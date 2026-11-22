<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Angka di sini dihitung dari database, bukan dikirim dari halaman.
class OwnerDashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $venueIds = Venue::query()->where('owner_id', $request->user()->id)->pluck('id');
        $bookings = Booking::query()->whereHas('court', fn ($court) => $court->whereIn('venue_id', $venueIds));

        $pending = (clone $bookings)
            ->where('status', BookingStatus::Pending)
            ->where('expires_at', '>', now());

        $confirmed = (clone $bookings)
            ->where('status', BookingStatus::Confirmed)
            ->where('end_at', '>', now());

        return response()->json([
            'data' => [
                'venues_count' => $venueIds->count(),
                'courts_count' => Court::query()->whereIn('venue_id', $venueIds)->count(),
                'pending_bookings' => $pending->count(),
                'confirmed_upcoming' => $confirmed->count(),
                'recent_bookings' => BookingResource::collection(
                    $bookings->with(['court.venue', 'court.sport', 'user'])->latest()->limit(5)->get()
                )->resolve(),
            ],
        ]);
    }
}
