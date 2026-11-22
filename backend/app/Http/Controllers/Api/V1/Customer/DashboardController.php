<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $mine = Booking::query()->where('user_id', $request->user()->id);

        // Mendatang hanya pending yang masih hidup dan confirmed yang belum selesai.
        $upcoming = (clone $mine)
            ->whereIn('status', [BookingStatus::Pending, BookingStatus::Confirmed])
            ->where('end_at', '>', now());

        $pending = (clone $mine)
            ->where('status', BookingStatus::Pending)
            ->where('expires_at', '>', now());

        return response()->json([
            'data' => [
                'upcoming_count' => (clone $upcoming)->count(),
                'pending_count' => (clone $pending)->count(),
                'upcoming' => BookingResource::collection(
                    $upcoming->with(['court.venue', 'court.sport'])->orderBy('start_at')->limit(5)->get()
                )->resolve(),
                'recent' => BookingResource::collection(
                    $mine->with(['court.venue', 'court.sport'])->latest()->limit(5)->get()
                )->resolve(),
            ],
        ]);
    }
}
