<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminBookingIndexRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

// Admin hanya membaca. Mengubah status booking tetap tugas pemilik venue atau pelanggan.
class BookingMonitorController extends Controller
{
    public function index(AdminBookingIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 12);

        $bookings = Booking::query()
            ->with(['court.venue', 'court.sport', 'user'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['venue_id'] ?? null, function ($query, $venueId): void {
                $query->whereHas('court', fn ($court) => $court->where('venue_id', $venueId));
            })
            ->when($filters['date_from'] ?? null, fn ($query, $from) => $query->where('start_at', '>=', $from.' 00:00:00'))
            ->when($filters['date_to'] ?? null, fn ($query, $to) => $query->where('start_at', '<=', $to.' 23:59:59'))
            ->latest('start_at')
            ->paginate($perPage);

        return BookingResource::collection($bookings);
    }

    public function show(Booking $booking): BookingResource
    {
        $booking->load(['court.venue', 'court.sport', 'user', 'histories.actor']);

        return new BookingResource($booking);
    }
}
