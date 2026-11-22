<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Exceptions\InvalidVenueTransition;
use App\Http\Controllers\Api\V1\Concerns\ResolvesOwnedVenue;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreCourtRequest;
use App\Http\Requests\Owner\StoreImageRequest;
use App\Http\Requests\Owner\UpdateCourtRequest;
use App\Http\Resources\CourtResource;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class CourtController extends Controller
{
    use ResolvesOwnedVenue;

    public function index(Request $request, Venue $venue): AnonymousResourceCollection
    {
        $venue = $this->ownedVenue($request, $venue);

        $courts = $venue->courts()->with('sport')->orderBy('name')->get();

        return CourtResource::collection($courts);
    }

    public function store(StoreCourtRequest $request, Venue $venue): JsonResponse
    {
        $venue = $this->ownedVenue($request, $venue);
        $blocked = $this->guardEditable($venue);
        if ($blocked !== null) {
            return $blocked;
        }

        $data = $request->validated();

        // venue_id dari URL. Field venue_id di body, kalau ada, tidak dipakai.
        $court = $venue->courts()->create([
            'sport_id' => $data['sport_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price_per_hour' => $data['price_per_hour'],
            'is_active' => true,
        ]);

        $court->load('sport');

        return (new CourtResource($court))->response()->setStatusCode(201);
    }

    public function update(UpdateCourtRequest $request, Court $court): CourtResource|JsonResponse
    {
        $court = $this->ownedCourt($request, $court);
        $blocked = $this->guardEditable($court->venue);
        if ($blocked !== null) {
            return $blocked;
        }

        $court->fill($request->validated());
        $court->save();
        $court->load('sport');

        return new CourtResource($court);
    }

    public function toggleActive(Request $request, Court $court): CourtResource|JsonResponse
    {
        $court = $this->ownedCourt($request, $court);
        $blocked = $this->guardEditable($court->venue);
        if ($blocked !== null) {
            return $blocked;
        }

        $court->is_active = ! $court->is_active;
        $court->save();

        return new CourtResource($court->load('sport'));
    }

    public function storeImage(StoreImageRequest $request, Court $court): CourtResource|JsonResponse
    {
        $court = $this->ownedCourt($request, $court);
        $blocked = $this->guardEditable($court->venue);
        if ($blocked !== null) {
            return $blocked;
        }

        $path = $request->file('image')->store('courts', 'public');

        if ($court->image_path !== null) {
            Storage::disk('public')->delete($court->image_path);
        }

        $court->image_path = $path;
        $court->save();

        return new CourtResource($court->load('sport'));
    }

    public function destroy(Request $request, Court $court): Response|JsonResponse
    {
        $court = $this->ownedCourt($request, $court);
        $blocked = $this->guardEditable($court->venue);
        if ($blocked !== null) {
            return $blocked;
        }

        $busy = Booking::query()
            ->holdingSlot()
            ->where('court_id', $court->id)
            ->where('end_at', '>', now())
            ->exists();

        if ($busy) {
            return response()->json([
                'message' => 'Masih ada booking aktif pada lapangan ini.',
            ], 409);
        }

        $court->delete();

        return response()->noContent();
    }

    private function guardEditable(?Venue $venue): ?JsonResponse
    {
        if ($venue === null) {
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

        return null;
    }
}
