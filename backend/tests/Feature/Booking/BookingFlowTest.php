<?php

namespace Tests\Feature\Booking;

use App\Enums\BookingStatus;
use App\Enums\VenueStatus;
use App\Models\Booking;
use App\Models\BookingStatusHistory;
use App\Models\Court;
use App\Models\CourtBlock;
use App\Models\Sport;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithSpa;
use Tests\TestCase;

class BookingFlowTest extends TestCase
{
    use InteractsWithSpa;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpSpa();
        $this->travelTo('2026-11-21 02:00:00');
    }

    public function test_customer_booking_uses_database_price_and_ignores_client_fields(): void
    {
        [$customer, $owner, $court] = $this->scene();
        $this->loginAs($customer);

        $response = $this->postJson('/api/v1/bookings', [
            'court_id' => $court->id,
            'date' => '2026-11-25',
            'start_hour' => 19,
            'duration_hours' => 2,
            'notes' => 'Bawa raket',
            'price' => 1,
            'status' => 'confirmed',
            'user_id' => $owner->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.price_per_hour', '75000.00')
            ->assertJsonPath('data.total_price', '150000.00')
            ->assertJsonPath('data.duration_hours', 2)
            ->assertJsonPath('data.local.start', '19:00')
            ->assertJsonPath('data.local.end', '21:00')
            ->assertJsonPath('data.can_cancel', true);

        $booking = Booking::query()->first();
        $this->assertSame($customer->id, $booking->user_id);
        $this->assertSame(1, BookingStatusHistory::query()->where('booking_id', $booking->id)->whereNull('from_status')->count());
    }

    public function test_overlap_uses_half_open_interval(): void
    {
        [$first, $second, $owner, $court] = $this->twoCustomers();
        $this->loginAs($first);
        $this->postJson('/api/v1/bookings', $this->payload($court->id, 19, 2))->assertCreated();

        $this->loginAs($second);
        $this->postJson('/api/v1/bookings', $this->payload($court->id, 21, 1))->assertCreated();
        $this->postJson('/api/v1/bookings', $this->payload($court->id, 20, 1))
            ->assertStatus(409)
            ->assertJsonPath('code', 'BOOKING_SLOT_UNAVAILABLE');
        $this->postJson('/api/v1/bookings', $this->payload($court->id, 18, 1))->assertCreated();
    }

    public function test_block_closed_hours_and_unbookable_court_are_rejected(): void
    {
        [$customer, , $court] = $this->scene();
        CourtBlock::query()->create([
            'court_id' => $court->id,
            'start_at' => '2026-11-25 12:00:00',
            'end_at' => '2026-11-25 13:00:00',
            'reason' => 'Maintenance',
            'created_by' => $court->venue->owner_id,
        ]);
        $this->loginAs($customer);

        $this->postJson('/api/v1/bookings', $this->payload($court->id, 19, 1))
            ->assertStatus(409)
            ->assertJsonPath('code', 'BOOKING_SLOT_UNAVAILABLE');

        $court->venue->operatingHours()->where('day_of_week', 3)->update([
            'is_closed' => true,
            'open_hour' => null,
            'close_hour' => null,
        ]);
        $this->postJson('/api/v1/bookings', $this->payload($court->id, 10, 1, '2026-11-25'))
            ->assertStatus(422)
            ->assertJsonPath('code', 'BOOKING_OUTSIDE_OPERATING_HOURS');

        $court->update(['is_active' => false]);
        $this->postJson('/api/v1/bookings', $this->payload($court->id, 10, 1, '2026-11-26'))
            ->assertStatus(422)
            ->assertJsonPath('code', 'COURT_NOT_BOOKABLE');
    }

    public function test_owner_confirm_reject_and_customer_cancel_rules(): void
    {
        [$customer, $owner, $court] = $this->scene();
        $this->loginAs($customer);
        $created = $this->postJson('/api/v1/bookings', $this->payload($court->id, 18, 1, '2026-11-21'))->assertCreated();
        $id = $created->json('data.id');

        $this->loginAs($owner);
        $this->patchJson('/api/v1/owner/bookings/'.$id.'/confirm')->assertOk()->assertJsonPath('data.status', 'confirmed');
        $this->patchJson('/api/v1/owner/bookings/'.$id.'/confirm')->assertStatus(409)->assertJsonPath('code', 'BOOKING_INVALID_TRANSITION');

        $this->loginAs($customer);
        $this->patchJson('/api/v1/bookings/'.$id.'/cancel', ['reason' => 'Berubah jadwal'])
            ->assertStatus(422)
            ->assertJsonPath('code', 'BOOKING_CANCEL_CUTOFF_PASSED');

        $later = $this->postJson('/api/v1/bookings', $this->payload($court->id, 10, 1, '2026-12-20'))->assertCreated();
        $laterId = $later->json('data.id');
        $this->loginAs($owner);
        $this->patchJson('/api/v1/owner/bookings/'.$laterId.'/reject', ['reason' => 'Lapangan basah'])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $pending = $this->loginAndBook($customer, $court->id, 11, '2026-12-20');
        $this->patchJson('/api/v1/bookings/'.$pending.'/cancel')->assertOk()->assertJsonPath('data.status', 'cancelled');
    }

    public function test_owner_cancel_requires_reason_and_other_customer_gets_404(): void
    {
        [$customer, $owner, $court] = $this->scene();
        $other = User::factory()->create(['email' => 'lain@mail.test', 'password' => 'Rahasia12']);
        $id = $this->loginAndBook($customer, $court->id, 19);
        $this->loginAs($owner);
        $this->patchJson('/api/v1/owner/bookings/'.$id.'/confirm')->assertOk();
        $this->patchJson('/api/v1/owner/bookings/'.$id.'/cancel', [])->assertUnprocessable();

        $far = $this->loginAndBook($customer, $court->id, 10, '2026-12-20');
        $this->loginAs($owner);
        $this->patchJson('/api/v1/owner/bookings/'.$far.'/confirm')->assertOk();
        $this->patchJson('/api/v1/owner/bookings/'.$far.'/cancel', ['reason' => 'Perbaikan mendadak'])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.customer.name', $customer->name)
            ->assertJsonMissingPath('data.customer.email');

        $this->loginAs($other);
        $this->getJson('/api/v1/bookings/'.$id)->assertNotFound();
    }

    public function test_customer_and_owner_lists_stay_inside_their_own_data(): void
    {
        [$customer, $owner, $court] = $this->scene();
        $id = $this->loginAndBook($customer, $court->id, 19);
        $this->getJson('/api/v1/bookings/my?period=upcoming')
            ->assertOk()
            ->assertJsonPath('data.0.id', $id)
            ->assertJsonMissingPath('data.0.customer');

        $this->loginAs($owner);
        $this->getJson('/api/v1/owner/bookings?venue_id='.$court->venue_id)
            ->assertOk()
            ->assertJsonPath('data.0.customer.name', $customer->name)
            ->assertJsonMissingPath('data.0.customer.email');

        $stranger = User::factory()->owner()->create(['email' => 'stranger@mail.test', 'password' => 'Rahasia12']);
        $this->loginAs($stranger);
        $this->getJson('/api/v1/owner/bookings?venue_id='.$court->venue_id)->assertNotFound();
    }

    public function test_past_and_far_dates_are_rejected(): void
    {
        [$customer, , $court] = $this->scene();
        $this->loginAs($customer);

        $this->postJson('/api/v1/bookings', $this->payload($court->id, 8, 1, '2026-11-21'))
            ->assertStatus(422)
            ->assertJsonPath('code', 'BOOKING_IN_PAST');

        $this->postJson('/api/v1/bookings', $this->payload($court->id, 10, 1, '2026-12-22'))
            ->assertStatus(422)
            ->assertJsonPath('code', 'BOOKING_BEYOND_HORIZON');
    }

    public function test_scheduler_expires_and_completes(): void
    {
        [, , $court] = $this->scene();
        $pending = Booking::factory()->create([
            'court_id' => $court->id,
            'status' => BookingStatus::Pending,
            'expires_at' => '2026-11-21 01:00:00',
            'start_at' => '2026-11-25 12:00:00',
            'end_at' => '2026-11-25 13:00:00',
        ]);
        $confirmed = Booking::factory()->create([
            'court_id' => $court->id,
            'status' => BookingStatus::Confirmed,
            'expires_at' => null,
            'start_at' => '2026-11-21 00:00:00',
            'end_at' => '2026-11-21 01:00:00',
        ]);

        $this->artisan('bookings:expire-pending')->assertSuccessful();
        $this->artisan('bookings:complete')->assertSuccessful();

        $this->assertSame(BookingStatus::Expired, $pending->fresh()->status);
        $this->assertSame(BookingStatus::Completed, $confirmed->fresh()->status);
        $this->assertNull(BookingStatusHistory::query()->where('booking_id', $pending->id)->value('changed_by'));
    }

    /**
     * @return array{0: User, 1: User, 2: Court}
     */
    private function scene(): array
    {
        $customer = User::factory()->create(['email' => 'cust@mail.test', 'password' => 'Rahasia12']);
        $owner = User::factory()->owner()->create(['email' => 'own@mail.test', 'password' => 'Rahasia12']);
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

        return [$customer, $owner, $court];
    }

    /**
     * @return array{0: User, 1: User, 2: User, 3: Court}
     */
    private function twoCustomers(): array
    {
        [$first, $owner, $court] = $this->scene();
        $second = User::factory()->create(['email' => 'cust2@mail.test', 'password' => 'Rahasia12']);

        return [$first, $second, $owner, $court];
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(int $courtId, int $hour, int $duration, string $date = '2026-11-25'): array
    {
        return [
            'court_id' => $courtId,
            'date' => $date,
            'start_hour' => $hour,
            'duration_hours' => $duration,
        ];
    }

    private function loginAs(User $user): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Rahasia12',
        ])->assertOk();
        $this->carryCookies($response);
    }

    private function loginAndBook(User $user, int $courtId, int $hour, string $date = '2026-11-25'): int
    {
        $this->loginAs($user);

        return $this->postJson('/api/v1/bookings', $this->payload($courtId, $hour, 1, $date))
            ->assertCreated()
            ->json('data.id');
    }
}
