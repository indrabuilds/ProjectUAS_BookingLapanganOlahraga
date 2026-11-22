<?php

namespace Tests\Feature\Security;

use App\Enums\VenueStatus;
use App\Models\Court;
use App\Models\Sport;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithSpa;
use Tests\TestCase;

class ForeignResourceTest extends TestCase
{
    use InteractsWithSpa;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpSpa();
    }

    public function test_other_owner_cannot_learn_a_court_exists_from_validation(): void
    {
        $owner = User::factory()->owner()->create(['email' => 'owner-a@mail.test', 'password' => 'Rahasia12']);
        $other = User::factory()->owner()->create(['email' => 'owner-b@mail.test', 'password' => 'Rahasia12']);
        $sport = Sport::factory()->create();
        $venue = Venue::factory()->create([
            'owner_id' => $owner->id,
            'status' => VenueStatus::Approved,
            'is_active' => true,
        ]);
        $court = Court::factory()->create([
            'venue_id' => $venue->id,
            'sport_id' => $sport->id,
            'name' => 'Court A',
        ]);

        $this->login('owner-b@mail.test');
        $this->postJson('/api/v1/owner/venues/'.$venue->id.'/courts', [
            'name' => 'Court A',
            'sport_id' => $sport->id,
            'price_per_hour' => 50000,
        ])->assertNotFound();
        $this->putJson('/api/v1/owner/courts/'.$court->id, [
            'name' => 'Court A',
            'sport_id' => $sport->id,
            'price_per_hour' => 50000,
        ])->assertNotFound();
        $this->postJson('/api/v1/owner/courts/'.$court->id.'/blocks', [])->assertNotFound();

        $this->login('owner-a@mail.test');
        $this->postJson('/api/v1/owner/venues/'.$venue->id.'/courts', [
            'name' => 'Court A',
            'sport_id' => $sport->id,
            'price_per_hour' => 50000,
        ])->assertUnprocessable();
    }

    public function test_other_customer_cancel_stays_404_even_when_the_body_is_invalid(): void
    {
        [$customer, $court] = $this->bookable();
        $other = User::factory()->create(['email' => 'lain@mail.test', 'password' => 'Rahasia12']);
        $this->login($customer->email);
        $id = $this->postJson('/api/v1/bookings', [
            'court_id' => $court->id,
            'date' => '2026-11-25',
            'start_hour' => 19,
            'duration_hours' => 1,
        ])->assertCreated()->json('data.id');

        $this->login($other->email);
        $this->patchJson('/api/v1/bookings/'.$id.'/cancel', [
            'reason' => str_repeat('a', 501),
        ])->assertNotFound();
    }

    public function test_hidden_court_availability_does_not_say_the_date_is_wrong(): void
    {
        $owner = User::factory()->owner()->create();
        $court = Court::factory()->create([
            'venue_id' => Venue::factory()->create([
                'owner_id' => $owner->id,
                'status' => VenueStatus::PendingVerification,
            ]),
            'sport_id' => Sport::factory(),
        ]);

        $this->getJson('/api/v1/courts/'.$court->id.'/availability?date=bukan-tanggal')->assertNotFound();
    }

    /**
     * @return array{0: User, 1: Court}
     */
    private function bookable(): array
    {
        $this->travelTo('2026-11-21 02:00:00');
        $customer = User::factory()->create(['email' => 'cust@mail.test', 'password' => 'Rahasia12']);
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
        ]);

        return [$customer, $court];
    }

    private function login(string $email): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => 'Rahasia12',
        ])->assertOk();
        $this->carryCookies($response);
    }
}
