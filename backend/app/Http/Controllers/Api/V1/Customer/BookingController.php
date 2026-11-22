<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\BookingIndexRequest;
use App\Http\Requests\Customer\CancelBookingRequest;
use App\Http\Requests\Customer\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

// user_id, harga, dan status tidak dibaca dari body. Service yang mengisinya.
class BookingController extends Controller
{
    public function store(StoreBookingRequest $request, BookingService $bookings): JsonResponse
    {
        $data = $request->validated();
        $booking = $bookings->create($request->user(), [
            'court_id' => (int) $data['court_id'],
            'date' => $data['date'],
            'start_hour' => (int) $data['start_hour'],
            'duration_hours' => (int) $data['duration_hours'],
            'notes' => $data['notes'] ?? null,
        ]);

        return (new BookingResource($booking))->response()->setStatusCode(201);
    }

    public function mine(BookingIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 12);

        $query = Booking::query()
            ->where('user_id', $request->user()->id)
            ->with(['court.venue', 'court.sport'])
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when(($filters['period'] ?? null) === 'upcoming', fn ($q) => $q->where('end_at', '>', now()))
            ->when(($filters['period'] ?? null) === 'past', fn ($q) => $q->where('end_at', '<=', now()))
            ->latest('start_at');

        return BookingResource::collection($query->paginate($perPage));
    }

    public function show(Request $request, Booking $booking): BookingResource
    {
        if (! $request->user()->can('view', $booking)) {
            abort(404);
        }

        $booking->load(['court.venue', 'court.sport', 'user']);

        return new BookingResource($booking);
    }

    public function cancel(CancelBookingRequest $request, Booking $booking, BookingService $bookings): BookingResource
    {
        $updated = $bookings->cancelByCustomer(
            $request->user(),
            $booking,
            $request->validated('reason'),
        );

        return new BookingResource($updated);
    }
}
