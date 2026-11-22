<?php

namespace Tests\Unit;

use App\Enums\BookingStatus;
use App\Enums\VenueStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\CourtBlock;
use App\Models\Sport;
use App\Models\User;
use App\Models\Venue;
use App\Services\AvailabilityService;
use App\Support\VenueClock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AvailabilityServiceTest extends TestCase
{
    use RefreshDatabase;

    private AvailabilityService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo('2026-11-21 02:00:00');
        $this->service = new AvailabilityService;
    }

    public function test_closed_day_has_no_slots(): void
    {
        $court = $this->courtIn('Asia/Jakarta');
        $court->venue->operatingHours()->where('day_of_week', 3)->update([
            'is_closed' => true,
            'open_hour' => null,
            'close_hour' => null,
        ]);

        $result = $this->service->forDate($court, '2026-11-25');

        $this->assertTrue($result['is_closed']);
        $this->assertSame([], $result['slots']);
    }

    public function test_block_booking_and_past_slots_are_marked(): void
    {
        $this->travelTo('2026-11-25 02:30:00');
        $court = $this->courtIn('Asia/Jakarta');
        $customer = User::factory()->create(['name' => 'Rahasia Pelanggan']);

        Booking::factory()->create([
            'user_id' => $customer->id,
            'court_id' => $court->id,
            'start_at' => '2026-11-25 04:00:00',
            'end_at' => '2026-11-25 05:00:00',
            'status' => BookingStatus::Confirmed,
        ]);
        Booking::factory()->create([
            'court_id' => $court->id,
            'start_at' => '2026-11-25 05:00:00',
            'end_at' => '2026-11-25 06:00:00',
            'status' => BookingStatus::Pending,
            'expires_at' => '2026-11-25 06:00:00',
        ]);
        Booking::factory()->create([
            'court_id' => $court->id,
            'start_at' => '2026-11-25 06:00:00',
            'end_at' => '2026-11-25 07:00:00',
            'status' => BookingStatus::Pending,
            'expires_at' => '2026-11-25 01:00:00',
        ]);
        CourtBlock::query()->create([
            'court_id' => $court->id,
            'start_at' => '2026-11-25 07:00:00',
            'end_at' => '2026-11-25 08:00:00',
            'reason' => 'Perbaikan lampu',
            'created_by' => $court->venue->owner_id,
        ]);

        $slots = collect($this->service->forDate($court, '2026-11-25')['slots'])->keyBy('start_hour');

        $this->assertSame('past', $slots[8]['status']);
        $this->assertSame('booked', $slots[11]['status']);
        $this->assertSame('booked', $slots[12]['status']);
        $this->assertSame('available', $slots[13]['status']);
        $this->assertSame('blocked', $slots[14]['status']);
        $this->assertArrayNotHasKey('reason', $slots[14]);
    }

    public function test_slot_start_converts_wita_and_wit_to_utc(): void
    {
        $wita = $this->courtIn('Asia/Makassar');
        $wit = $this->courtIn('Asia/Jayapura');

        $witaSlot = collect($this->service->forDate($wita, '2026-11-25')['slots'])->firstWhere('start_hour', 8);
        $witSlot = collect($this->service->forDate($wit, '2026-11-25')['slots'])->firstWhere('start_hour', 8);

        $this->assertSame('2026-11-25T00:00:00Z', $witaSlot['start_at']);
        $this->assertSame('2026-11-24T23:00:00Z', $witSlot['start_at']);
        $this->assertSame(
            '2026-11-25T00:00:00Z',
            VenueClock::toUtc(VenueClock::atHour(VenueClock::localDay('2026-11-25', 'Asia/Makassar'), 8))->format('Y-m-d\TH:i:s\Z'),
        );
    }

    private function courtIn(string $timezone): Court
    {
        $owner = User::factory()->owner()->create();
        $venue = Venue::factory()->create([
            'owner_id' => $owner->id,
            'status' => VenueStatus::Approved,
            'timezone' => $timezone,
        ]);
        $sport = Sport::factory()->create();

        return Court::factory()->create([
            'venue_id' => $venue->id,
            'sport_id' => $sport->id,
            'is_active' => true,
            'price_per_hour' => 75000,
        ]);
    }
}
