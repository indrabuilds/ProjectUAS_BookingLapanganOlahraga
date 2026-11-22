<?php

namespace Tests\Feature\Venue;

use App\Enums\UserRole;
use App\Enums\VenueStatus;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\MakesVenueContext;
use Tests\TestCase;

class VenueManagementTest extends TestCase
{
    use MakesVenueContext;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpVenueContext();
    }

    public function test_owner_can_create_venue_and_ignores_client_status(): void
    {
        $owner = $this->makeOwner('owner@mail.test');
        $this->loginAs($owner);

        $response = $this->postJson('/api/v1/owner/venues', $this->venuePayload([
            'owner_id' => 999,
            'status' => 'approved',
            'verified_by' => 1,
        ]));

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending_verification')
            ->assertJsonPath('data.city', 'Bandung')
            ->assertJsonPath('data.timezone', 'Asia/Jakarta')
            ->assertJsonCount(7, 'data.operating_hours');

        $venue = Venue::query()->first();
        $this->assertNotNull($venue);
        $this->assertSame($owner->id, $venue->owner_id);
        $this->assertSame(VenueStatus::PendingVerification, $venue->status);
        $this->assertNotSame('approved', $venue->status->value);
    }

    public function test_other_owner_gets_404_for_private_venue(): void
    {
        $ownerA = $this->makeOwner('a@mail.test');
        $ownerB = $this->makeOwner('b@mail.test');
        $venue = Venue::factory()->create(['owner_id' => $ownerA->id, 'name' => 'Milik A']);

        $this->loginAs($ownerB);

        $this->getJson('/api/v1/owner/venues/'.$venue->id)->assertNotFound();
        $this->putJson('/api/v1/owner/venues/'.$venue->id, $this->venuePayload([
            'name' => 'Dicuri',
        ]))->assertNotFound();
        $this->deleteJson('/api/v1/owner/venues/'.$venue->id)->assertNotFound();

        $this->assertSame('Milik A', $venue->fresh()->name);
    }

    public function test_customer_and_admin_cannot_use_owner_venue_routes(): void
    {
        $owner = $this->makeOwner('owner@mail.test');
        $venue = Venue::factory()->create(['owner_id' => $owner->id]);

        $customer = User::factory()->create([
            'email' => 'cust@mail.test',
            'password' => 'Rahasia12',
            'role' => UserRole::Customer,
        ]);
        $this->loginAs($customer);
        $this->getJson('/api/v1/owner/venues')->assertForbidden();
        $this->getJson('/api/v1/owner/venues/'.$venue->id)->assertForbidden();

        $admin = $this->makeAdmin('admin@mail.test');
        $this->loginAs($admin);
        $this->putJson('/api/v1/owner/venues/'.$venue->id, $this->venuePayload())->assertForbidden();
    }

    public function test_rejected_venue_returns_to_pending_when_edited_and_approved_stays_approved(): void
    {
        $owner = $this->makeOwner('owner@mail.test');
        $this->loginAs($owner);

        $rejected = Venue::factory()->create([
            'owner_id' => $owner->id,
            'status' => VenueStatus::Rejected,
            'status_reason' => 'Foto kurang jelas',
        ]);

        $this->putJson('/api/v1/owner/venues/'.$rejected->id, $this->venuePayload([
            'name' => 'GOR Diperbaiki',
        ]))->assertOk()
            ->assertJsonPath('data.status', 'pending_verification')
            ->assertJsonPath('data.status_reason', null);

        $approved = Venue::factory()->create([
            'owner_id' => $owner->id,
            'status' => VenueStatus::Approved,
        ]);

        $this->putJson('/api/v1/owner/venues/'.$approved->id, $this->venuePayload([
            'name' => 'GOR Tetap Approved',
            'status' => 'pending_verification',
        ]))->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.name', 'GOR Tetap Approved');
    }

    public function test_suspended_venue_cannot_be_edited(): void
    {
        $owner = $this->makeOwner('owner@mail.test');
        $this->loginAs($owner);
        $venue = Venue::factory()->create([
            'owner_id' => $owner->id,
            'status' => VenueStatus::Suspended,
            'name' => 'Ditahan',
        ]);

        $this->putJson('/api/v1/owner/venues/'.$venue->id, $this->venuePayload())
            ->assertStatus(409)
            ->assertJsonPath('code', 'VENUE_INVALID_TRANSITION');

        $this->assertSame('Ditahan', $venue->fresh()->name);
    }

    public function test_owner_can_toggle_and_soft_delete_own_venue(): void
    {
        $owner = $this->makeOwner('owner@mail.test');
        $this->loginAs($owner);
        $venue = Venue::factory()->create([
            'owner_id' => $owner->id,
            'is_active' => true,
        ]);

        $this->patchJson('/api/v1/owner/venues/'.$venue->id.'/toggle-active')
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->deleteJson('/api/v1/owner/venues/'.$venue->id)->assertNoContent();
        $this->getJson('/api/v1/owner/venues/'.$venue->id)->assertNotFound();
        $this->assertSoftDeleted('venues', ['id' => $venue->id]);
    }

    public function test_invalid_facility_and_phone_are_rejected(): void
    {
        $this->loginAs($this->makeOwner('owner@mail.test'));

        $this->postJson('/api/v1/owner/venues', $this->venuePayload([
            'facilities' => ['kolam-renang'],
        ]))->assertUnprocessable()->assertJsonValidationErrors('facilities.0');

        $this->postJson('/api/v1/owner/venues', $this->venuePayload([
            'phone' => 'bukan-nomor',
        ]))->assertUnprocessable()->assertJsonValidationErrors('phone');
    }
}
