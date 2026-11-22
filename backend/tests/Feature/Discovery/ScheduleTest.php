<?php

namespace Tests\Feature\Discovery;

use App\Enums\BookingStatus;
use App\Enums\VenueStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Sport;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithSpa;
use Tests\TestCase;

class ScheduleTest extends TestCase
{
    use InteractsWithSpa;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpSpa();
        $this->travelTo('2026-11-21 02:00:00');
    }

    public function test_owner_can_replace_operating_hours_without_removing_bookings(): void
    {
        [$owner, $court] = $this->ownedCourt();
        $booking = Booking::factory()->create([
            'court_id' => $court->id,
            'status' => BookingStatus::Confirmed,
            'start_at' => '2026-11-25 02:00:00',
            'end_at' => '2026-11-25 03:00:00',
        ]);
        $this->loginAs($owner);

        $days = [];
        for ($day = 1; $day <= 7; $day++) {
            $days[] = $day === 7
                ? ['day_of_week' => 7, 'is_closed' => true]
                : ['day_of_week' => $day, 'is_closed' => false, 'open_hour' => 9, 'close_hour' => 18];
        }

        $this->putJson('/api/v1/owner/venues/'.$court->venue_id.'/operating-hours', ['days' => $days])
            ->assertOk()
            ->assertJsonCount(7, 'data')
            ->assertJsonPath('data.6.is_closed', true)
            ->assertJsonPath('data.0.open_hour', 9);

        $this->assertNotNull($booking->fresh());
    }

    public function test_invalid_hours_and_other_owner_are_rejected(): void
    {
        [$owner, $court] = $this->ownedCourt();
        $other = User::factory()->owner()->create(['email' => 'lain@mail.test', 'password' => 'Rahasia12']);
        $this->loginAs($owner);

        $this->putJson('/api/v1/owner/venues/'.$court->venue_id.'/operating-hours', [
            'days' => [
                ['day_of_week' => 1, 'is_closed' => false, 'open_hour' => 10, 'close_hour' => 10],
            ],
        ])->assertUnprocessable();

        $this->loginAs($other);
        $this->getJson('/api/v1/owner/venues/'.$court->venue_id.'/operating-hours')->assertNotFound();
    }

    public function test_block_conflicts_with_active_booking_but_not_expired_pending(): void
    {
        [$owner, $court] = $this->ownedCourt();
        Booking::factory()->create([
            'court_id' => $court->id,
            'status' => BookingStatus::Confirmed,
            'start_at' => '2026-11-25 03:00:00',
            'end_at' => '2026-11-25 04:00:00',
        ]);
        Booking::factory()->create([
            'court_id' => $court->id,
            'status' => BookingStatus::Pending,
            'expires_at' => '2026-11-20 00:00:00',
            'start_at' => '2026-11-25 05:00:00',
            'end_at' => '2026-11-25 06:00:00',
        ]);
        $this->loginAs($owner);

        $this->postJson('/api/v1/owner/courts/'.$court->id.'/blocks', [
            'date' => '2026-11-25',
            'start_hour' => 10,
            'end_hour' => 11,
            'reason' => 'Maintenance',
        ])->assertStatus(409)->assertJsonPath('code', 'BLOCK_CONFLICTS_WITH_BOOKING');

        $this->postJson('/api/v1/owner/courts/'.$court->id.'/blocks', [
            'date' => '2026-11-25',
            'start_hour' => 12,
            'end_hour' => 13,
            'reason' => 'Istirahat',
        ])->assertCreated()->assertJsonPath('data.reason', 'Istirahat');

        $this->getJson('/api/v1/courts/'.$court->id.'/availability?date=2026-11-25')
            ->assertOk()
            ->assertJsonPath('data.timezone', 'Asia/Jakarta')
            ->assertJsonMissingPath('data.slots.0.reason');
    }

    public function test_hidden_court_availability_is_not_found(): void
    {
        $owner = User::factory()->owner()->create();
        $venue = Venue::factory()->create([
            'owner_id' => $owner->id,
            'status' => VenueStatus::PendingVerification,
        ]);
        $court = Court::factory()->create([
            'venue_id' => $venue->id,
            'sport_id' => Sport::factory(),
        ]);

        $this->getJson('/api/v1/courts/'.$court->id.'/availability?date=2026-11-25')->assertNotFound();
    }

    /**
     * @return array{0: User, 1: Court}
     */
    private function ownedCourt(): array
    {
        $owner = User::factory()->owner()->create([
            'email' => 'owner-jam@mail.test',
            'password' => 'Rahasia12',
        ]);
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
            'price_per_hour' => 75000,
        ]);

        return [$owner, $court];
    }

    private function loginAs(User $user): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Rahasia12',
        ])->assertOk();

        $this->carryCookies($response);
    }
}
