<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\BookingStatus;
use App\Enums\UserRole;
use App\Enums\VenueStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;

// Nol tetap dikirim untuk status yang belum punya data, supaya halaman tidak mengira angkanya hilang.
class AdminDashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'users_count' => User::query()->count(),
                'owners_count' => User::query()->where('role', UserRole::Owner)->count(),
                'venues_by_status' => $this->counts(Venue::class, VenueStatus::cases()),
                'courts_count' => Court::query()->count(),
                'bookings_by_status' => $this->counts(Booking::class, BookingStatus::cases()),
                'pending_venues' => Venue::query()
                    ->with('owner')
                    ->where('status', VenueStatus::PendingVerification)
                    ->latest()
                    ->limit(8)
                    ->get()
                    ->map(fn (Venue $venue) => [
                        'id' => $venue->id,
                        'name' => $venue->name,
                        'city' => $venue->city,
                        'owner_name' => $venue->owner?->name,
                        'created_at' => $venue->created_at?->utc()->format('Y-m-d\TH:i:s\Z'),
                    ])
                    ->values(),
            ],
        ]);
    }

    /**
     * @param  class-string  $model
     * @param  array<int, \BackedEnum>  $cases
     * @return array<string, int>
     */
    private function counts(string $model, array $cases): array
    {
        $counts = [];
        foreach ($cases as $case) {
            $counts[$case->value] = 0;
        }

        $rows = $model::query()->selectRaw('status, COUNT(*) as total')->groupBy('status')->get();
        foreach ($rows as $row) {
            $status = $row->status instanceof \BackedEnum ? $row->status->value : (string) $row->status;
            if (array_key_exists($status, $counts)) {
                $counts[$status] = (int) $row->total;
            }
        }

        return $counts;
    }
}
