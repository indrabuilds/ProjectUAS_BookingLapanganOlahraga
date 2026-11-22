<?php

namespace Tests\Feature\Venue;

use App\Enums\VenueStatus;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\MakesVenueContext;
use Tests\TestCase;

class VenueModerationTest extends TestCase
{
    use MakesVenueContext;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpVenueContext();
    }

    public function test_admin_can_approve_reject_suspend_and_reactivate(): void
    {
        $admin = $this->makeAdmin('admin@mail.test');
        $owner = $this->makeOwner('owner@mail.test');
        $venue = Venue::factory()->create([
            'owner_id' => $owner->id,
            'status' => VenueStatus::PendingVerification,
            'city' => 'Bandung',
            'name' => 'GOR Sehat',
        ]);

        $this->loginAs($admin);

        $this->patchJson('/api/v1/admin/venues/'.$venue->id.'/approve')
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertSame($admin->id, $venue->fresh()->verified_by);

        $this->patchJson('/api/v1/admin/venues/'.$venue->id.'/suspend', [
            'reason' => 'Keluhan keamanan',
        ])->assertOk()->assertJsonPath('data.status', 'suspended');

        $this->patchJson('/api/v1/admin/venues/'.$venue->id.'/reactivate')
            ->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.status_reason', null);

        $pending = Venue::factory()->create([
            'owner_id' => $owner->id,
            'status' => VenueStatus::PendingVerification,
        ]);

        $this->patchJson('/api/v1/admin/venues/'.$pending->id.'/reject')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('reason');

        $this->patchJson('/api/v1/admin/venues/'.$pending->id.'/reject', [
            'reason' => 'Alamat tidak jelas',
        ])->assertOk()
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.status_reason', 'Alamat tidak jelas');
    }

    public function test_invalid_status_jump_is_rejected(): void
    {
        $admin = $this->makeAdmin('admin@mail.test');
        $venue = Venue::factory()->create(['status' => VenueStatus::Approved]);
        $this->loginAs($admin);

        $this->patchJson('/api/v1/admin/venues/'.$venue->id.'/approve')
            ->assertStatus(409)
            ->assertJsonPath('code', 'VENUE_INVALID_TRANSITION');

        $this->patchJson('/api/v1/admin/venues/'.$venue->id.'/reject', [
            'reason' => 'Tidak bisa',
        ])->assertStatus(409)->assertJsonPath('code', 'VENUE_INVALID_TRANSITION');

        $this->assertSame(VenueStatus::Approved, $venue->fresh()->status);
    }

    public function test_owner_cannot_call_admin_moderation(): void
    {
        $owner = $this->makeOwner('owner@mail.test');
        $venue = Venue::factory()->create(['owner_id' => $owner->id]);
        $this->loginAs($owner);

        $this->patchJson('/api/v1/admin/venues/'.$venue->id.'/approve')->assertForbidden();
    }

    public function test_admin_can_filter_venues(): void
    {
        $admin = $this->makeAdmin('admin@mail.test');
        Venue::factory()->create([
            'name' => 'GOR Sehat',
            'city' => 'Bandung',
            'status' => VenueStatus::PendingVerification,
        ]);
        Venue::factory()->create([
            'name' => 'Lapangan Laut',
            'city' => 'Makassar',
            'status' => VenueStatus::Approved,
        ]);

        $this->loginAs($admin);

        $this->getJson('/api/v1/admin/venues?status=pending_verification&city=Bandung&q=Sehat')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'GOR Sehat');

        $this->getJson('/api/v1/admin/venues?status=bukan-status')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }
}
