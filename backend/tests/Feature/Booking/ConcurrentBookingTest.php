<?php

namespace Tests\Feature\Booking;

use App\Enums\VenueStatus;
use App\Models\Booking;
use App\Models\BookingStatusHistory;
use App\Models\Court;
use App\Models\Sport;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class ConcurrentBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_exactly_one_of_two_parallel_bookings_succeeds(): void
    {
        $this->travelTo('2026-11-21 02:00:00');
        $first = User::factory()->create();
        $second = User::factory()->create();
        $owner = User::factory()->owner()->create();
        $venue = Venue::factory()->create([
            'owner_id' => $owner->id,
            'status' => VenueStatus::Approved,
            'is_active' => true,
            'timezone' => 'Asia/Jakarta',
        ]);
        $court = Court::factory()->create([
            'venue_id' => $venue->id,
            'sport_id' => Sport::factory(),
            'is_active' => true,
            'price_per_hour' => 50000,
        ]);

        // Transaksi test menyembunyikan data dari proses lain. Commit dulu supaya dua koneksi melihat court yang sama.
        DB::commit();

        $courtId = $court->id;
        $sportId = $court->sport_id;
        $venueId = $venue->id;
        $firstId = $first->id;
        $secondId = $second->id;

        try {
            $left = $this->racer($firstId, $courtId);
            $right = $this->racer($secondId, $courtId);
            $left->start();
            $right->start();
            $left->wait();
            $right->wait();

            $codes = [$left->getExitCode(), $right->getExitCode()];
            sort($codes);

            $this->assertSame(
                [0, 2],
                $codes,
                $left->getOutput().$left->getErrorOutput()."\n".$right->getOutput().$right->getErrorOutput(),
            );
            $this->assertSame(1, Booking::query()->where('court_id', $courtId)->count());
        } finally {
            $ids = Booking::query()->where('court_id', $courtId)->pluck('id');
            BookingStatusHistory::query()->whereIn('booking_id', $ids)->delete();
            Booking::query()->where('court_id', $courtId)->delete();
            Court::query()->whereKey($courtId)->forceDelete();
            Venue::query()->whereKey($venueId)->forceDelete();
            Sport::query()->whereKey($sportId)->delete();
            User::query()->whereIn('id', [$firstId, $secondId, $owner->id])->delete();
            DB::beginTransaction();
        }
    }

    private function racer(int $userId, int $courtId): Process
    {
        $process = new Process([
            PHP_BINARY,
            base_path('tests/Support/attempt_booking.php'),
            (string) $userId,
            (string) $courtId,
            '2026-11-25',
            '19',
            '2',
        ]);
        $process->setTimeout(30);

        return $process;
    }
}
