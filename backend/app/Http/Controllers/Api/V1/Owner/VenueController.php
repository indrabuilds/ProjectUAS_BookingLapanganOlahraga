<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Enums\VenueStatus;
use App\Exceptions\InvalidVenueTransition;
use App\Http\Controllers\Api\V1\Concerns\ResolvesOwnedVenue;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\VenueRequest;
use App\Http\Resources\VenueResource;
use App\Models\Booking;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class VenueController extends Controller
{
    use ResolvesOwnedVenue;

    public function index(Request $request): AnonymousResourceCollection
    {
        $venues = Venue::query()
            ->where('owner_id', $request->user()->id)
            ->with(['images', 'courts.sport'])
            ->withCount('courts')
            ->latest()
            ->get();

        return VenueResource::collection($venues);
    }

    public function store(VenueRequest $request): JsonResponse
    {
        $data = $request->validated();

        // owner dan status tidak diambil dari body.
        $venue = Venue::query()->create([
            ...$data,
            'owner_id' => $request->user()->id,
            'slug' => Venue::uniqueSlug($data['name']),
            'facilities' => $data['facilities'] ?? [],
            'status' => VenueStatus::PendingVerification,
            'is_active' => true,
        ]);

        $venue->load(['images', 'operatingHours', 'courts.sport']);

        return (new VenueResource($venue))->response()->setStatusCode(201);
    }

    public function show(Request $request, Venue $venue): VenueResource
    {
        $venue = $this->ownedVenue($request, $venue);
        $venue->load(['images', 'operatingHours', 'courts.sport']);

        return new VenueResource($venue);
    }

    public function update(VenueRequest $request, Venue $venue): VenueResource|JsonResponse
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

        $venue->fill($request->validated());
        $venue->save();
        // Venue ditolak yang diedit dikirim ulang untuk diperiksa admin.
        $venue->markResubmittedIfRejected();
        $venue->load(['images', 'operatingHours', 'courts.sport']);

        return new VenueResource($venue);
    }

    public function toggleActive(Request $request, Venue $venue): VenueResource
    {
        $venue = $this->ownedVenue($request, $venue);
        $venue->is_active = ! $venue->is_active;
        $venue->save();

        return new VenueResource($venue->load(['images', 'courts.sport']));
    }

    public function destroy(Request $request, Venue $venue): Response|JsonResponse
    {
        $venue = $this->ownedVenue($request, $venue);

        $courtIds = $venue->courts()->pluck('id');
        $busy = Booking::query()
            ->holdingSlot()
            ->whereIn('court_id', $courtIds)
            ->where('end_at', '>', now())
            ->exists();

        if ($busy) {
            return response()->json([
                'message' => 'Masih ada booking aktif. Selesaikan atau batalkan dulu sebelum menghapus venue.',
            ], 409);
        }

        $venue->delete();

        return response()->noContent();
    }
}
