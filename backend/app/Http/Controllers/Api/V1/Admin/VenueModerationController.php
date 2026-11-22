<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\VenueStatus;
use App\Exceptions\InvalidVenueTransition;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VenueIndexRequest;
use App\Http\Requests\Admin\VenueReasonRequest;
use App\Http\Resources\VenueResource;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

// Admin mengubah status venue, bukan data operasional seperti harga atau jam buka.
class VenueModerationController extends Controller
{
    public function index(VenueIndexRequest $request): AnonymousResourceCollection
    {
        $this->authorize('moderate', Venue::class);

        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 12);

        $venues = Venue::query()
            ->with(['owner', 'images'])
            ->withCount('courts')
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['city'] ?? null, fn ($query, $city) => $query->where('city', $city))
            ->when($filters['q'] ?? null, function ($query, $q) {
                $safe = str_replace(['%', '_'], ['\\%', '\\_'], $q);
                $query->where('name', 'like', '%'.$safe.'%');
            })
            ->latest()
            ->paginate($perPage);

        return VenueResource::collection($venues);
    }

    public function show(Request $request, Venue $venue): VenueResource
    {
        $this->authorize('moderate', Venue::class);
        $venue->load(['owner', 'images', 'operatingHours', 'courts.sport']);

        return new VenueResource($venue);
    }

    public function approve(Request $request, Venue $venue): VenueResource|JsonResponse
    {
        return $this->change($request, $venue, VenueStatus::Approved, null, VenueStatus::PendingVerification);
    }

    public function reject(VenueReasonRequest $request, Venue $venue): VenueResource|JsonResponse
    {
        return $this->change($request, $venue, VenueStatus::Rejected, $request->string('reason')->toString(), VenueStatus::PendingVerification);
    }

    public function suspend(VenueReasonRequest $request, Venue $venue): VenueResource|JsonResponse
    {
        return $this->change($request, $venue, VenueStatus::Suspended, $request->string('reason')->toString(), VenueStatus::Approved);
    }

    public function reactivate(Request $request, Venue $venue): VenueResource|JsonResponse
    {
        return $this->change($request, $venue, VenueStatus::Approved, null, VenueStatus::Suspended);
    }

    private function change(Request $request, Venue $venue, VenueStatus $next, ?string $reason, VenueStatus $onlyFrom): VenueResource|JsonResponse
    {
        $this->authorize('moderate', Venue::class);

        try {
            $venue->transitionTo($next, $reason, $request->user(), $onlyFrom);
        } catch (InvalidVenueTransition $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'code' => 'VENUE_INVALID_TRANSITION',
            ], 409);
        }

        $venue->load(['owner', 'images', 'courts.sport']);

        return new VenueResource($venue);
    }
}
