<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Exceptions\InvalidVenueTransition;
use App\Http\Controllers\Api\V1\Concerns\ResolvesOwnedVenue;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreImageRequest;
use App\Http\Resources\VenueImageResource;
use App\Models\Venue;
use App\Models\VenueImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

// Nama file dibuat acak oleh Laravel. Nama asli dari komputer pemilik tidak disimpan.
class VenueImageController extends Controller
{
    use ResolvesOwnedVenue;

    public function store(StoreImageRequest $request, Venue $venue): JsonResponse
    {
        $venue = $this->ownedVenue($request, $venue);

        try {
            $venue->ensureOwnerCanEdit();
        } catch (InvalidVenueTransition $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'code' => 'VENUE_INVALID_TRANSITION',
            ], 409);
        }

        $image = DB::transaction(function () use ($request, $venue) {
            $locked = Venue::query()->whereKey($venue->id)->lockForUpdate()->firstOrFail();
            $count = $locked->images()->count();
            $limit = (int) config('sportscourt.venue.max_images');

            if ($count >= $limit) {
                return null;
            }

            $path = $request->file('image')->store('venues', 'public');

            return $locked->images()->create([
                'path' => $path,
                'sort_order' => $count,
            ]);
        });

        if ($image === null) {
            return response()->json([
                'message' => 'Satu venue paling banyak '.config('sportscourt.venue.max_images').' foto.',
                'code' => 'VENUE_IMAGE_LIMIT',
            ], 422);
        }

        return (new VenueImageResource($image))->response()->setStatusCode(201);
    }

    public function destroy(Request $request, Venue $venue, VenueImage $image): Response|JsonResponse
    {
        $venue = $this->ownedVenue($request, $venue);

        if ($image->venue_id !== $venue->id) {
            abort(404);
        }

        try {
            $venue->ensureOwnerCanEdit();
        } catch (InvalidVenueTransition $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'code' => 'VENUE_INVALID_TRANSITION',
            ], 409);
        }

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->noContent();
    }
}
