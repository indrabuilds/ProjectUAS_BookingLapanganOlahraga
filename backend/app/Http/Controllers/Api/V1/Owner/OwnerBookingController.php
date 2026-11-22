<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\OwnerBookingIndexRequest;
use App\Http\Requests\Owner\OwnerCancelBookingRequest;
use App\Http\Requests\Owner\RejectBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Venue;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

// Daftar ini hanya venue milik pemilik yang sedang login. Venue orang lain dianggap tidak ada.
class OwnerBookingController extends Controller
{
    public function index(OwnerBookingIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 12);
        $venueIds = Venue::query()->where('owner_id', $request->user()->id)->pluck('id');

        if (isset($filters['venue_id']) && ! $venueIds->contains((int) $filters['venue_id'])) {
            abort(404);
        }

        $query = Booking::query()
            ->with(['court.venue', 'court.sport', 'user'])
            ->whereHas('court', function ($court) use ($venueIds, $filters): void {
                $court->whereIn('venue_id', isset($filters['venue_id']) ? [(int) $filters['venue_id']] : $venueIds);
                if (isset($filters['court_id'])) {
                    $court->whereKey((int) $filters['court_id']);
                }
            })
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['date_from'] ?? null, fn ($q, $from) => $q->where('start_at', '>=', $from.' 00:00:00'))
            ->when($filters['date_to'] ?? null, fn ($q, $to) => $q->where('start_at', '<', $to.' 23:59:59'))
            ->latest('start_at');

        return BookingResource::collection($query->paginate($perPage));
    }

    public function confirm(Request $request, Booking $booking, BookingService $bookings): BookingResource
    {
        return new BookingResource($bookings->confirm($request->user(), $booking));
    }

    public function reject(RejectBookingRequest $request, Booking $booking, BookingService $bookings): BookingResource
    {
        return new BookingResource($bookings->reject($request->user(), $booking, $request->validated('reason')));
    }

    public function cancel(OwnerCancelBookingRequest $request, Booking $booking, BookingService $bookings): BookingResource
    {
        return new BookingResource($bookings->cancelByOwner(
            $request->user(),
            $booking,
            $request->string('reason')->toString(),
        ));
    }
}
