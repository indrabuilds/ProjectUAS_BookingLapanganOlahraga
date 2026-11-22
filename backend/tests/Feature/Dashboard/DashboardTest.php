<?php

namespace Tests\Feature\Dashboard;

use App\Enums\BookingStatus;
use App\Models\BookingStatusHistory;
use App\Models\User;
use Database\Seeders\DemoDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithSpa;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use InteractsWithSpa;
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpSpa();
        $this->admin = User::factory()->admin()->create([
            'name' => 'Admin Uji',
            'email' => 'admin-dash@mail.test',
            'password' => 'Rahasia12',
        ]);
        $this->seed(DemoDataSeeder::class);
    }

    public function test_dashboard_numbers_match_the_seeder(): void
    {
        $this->login('andi@demo.test');
        $this->getJson('/api/v1/customer/dashboard')
            ->assertOk()
            ->assertJsonPath('data.upcoming_count', DemoDataSeeder::ANDI_UPCOMING)
            ->assertJsonPath('data.pending_count', DemoDataSeeder::ANDI_PENDING)
            ->assertJsonCount(DemoDataSeeder::ANDI_UPCOMING, 'data.upcoming')
            ->assertJsonCount(5, 'data.recent')
            ->assertJsonMissingPath('data.upcoming.0.customer');

        $this->login('sari@demo.test');
        $this->getJson('/api/v1/owner/dashboard')
            ->assertOk()
            ->assertJsonPath('data.venues_count', DemoDataSeeder::SARI_VENUES)
            ->assertJsonPath('data.courts_count', DemoDataSeeder::SARI_COURTS)
            ->assertJsonPath('data.pending_bookings', DemoDataSeeder::SARI_PENDING_BOOKINGS)
            ->assertJsonPath('data.confirmed_upcoming', DemoDataSeeder::SARI_CONFIRMED_UPCOMING)
            ->assertJsonCount(5, 'data.recent_bookings')
            ->assertJsonPath('data.recent_bookings.0.customer.name', 'Bima Pelanggan')
            ->assertJsonMissingPath('data.recent_bookings.0.customer.email');

        $this->login('admin-dash@mail.test');
        $admin = $this->getJson('/api/v1/admin/dashboard')->assertOk();
        $admin->assertJsonPath('data.users_count', DemoDataSeeder::USERS + 1)
            ->assertJsonPath('data.owners_count', DemoDataSeeder::OWNERS)
            ->assertJsonPath('data.courts_count', DemoDataSeeder::COURTS)
            ->assertJsonPath('data.pending_venues.0.name', 'GOR Demo Baru');

        foreach (DemoDataSeeder::VENUES as $status => $count) {
            $admin->assertJsonPath('data.venues_by_status.'.$status, $count);
        }
        foreach (DemoDataSeeder::BOOKINGS as $status => $count) {
            $admin->assertJsonPath('data.bookings_by_status.'.$status, $count);
        }
    }

    public function test_each_role_is_refused_on_another_roles_dashboard(): void
    {
        $this->login('andi@demo.test');
        $this->getJson('/api/v1/owner/dashboard')->assertForbidden();
        $this->getJson('/api/v1/admin/dashboard')->assertForbidden();
        $this->getJson('/api/v1/admin/users')->assertForbidden();
        $this->getJson('/api/v1/admin/bookings')->assertForbidden();
        $this->postJson('/api/v1/admin/sports', ['name' => 'Voli'])->assertForbidden();

        $this->login('sari@demo.test');
        $this->getJson('/api/v1/customer/dashboard')->assertForbidden();
        $this->getJson('/api/v1/admin/dashboard')->assertForbidden();
        $this->patchJson('/api/v1/admin/users/'.$this->admin->id.'/suspend')->assertForbidden();

        $this->login('admin-dash@mail.test');
        $this->getJson('/api/v1/customer/dashboard')->assertForbidden();
        $this->getJson('/api/v1/owner/dashboard')->assertForbidden();
        $this->postJson('/api/v1/bookings', [
            'court_id' => 1,
            'date' => '2026-12-01',
            'start_hour' => 10,
            'duration_hours' => 1,
        ])->assertForbidden();
    }

    public function test_admin_cannot_suspend_self_or_another_admin(): void
    {
        $other = User::factory()->admin()->create([
            'email' => 'admin-lain@mail.test',
            'password' => 'Rahasia12',
        ]);
        $this->login('admin-dash@mail.test');

        $this->patchJson('/api/v1/admin/users/'.$this->admin->id.'/suspend')
            ->assertStatus(422)
            ->assertJsonPath('code', 'USER_SUSPEND_FORBIDDEN');
        $this->patchJson('/api/v1/admin/users/'.$other->id.'/suspend')
            ->assertStatus(422)
            ->assertJsonPath('code', 'USER_SUSPEND_FORBIDDEN');

        $this->getJson('/api/v1/admin/users?role=customer&q=Andi')
            ->assertOk()
            ->assertJsonPath('data.0.email', 'andi@demo.test');

        $andi = User::query()->where('email', 'andi@demo.test')->firstOrFail();
        $this->patchJson('/api/v1/admin/users/'.$andi->id.'/suspend')
            ->assertOk()
            ->assertJsonPath('data.status', 'suspended');
        $this->patchJson('/api/v1/admin/users/'.$andi->id.'/activate')
            ->assertOk()
            ->assertJsonPath('data.status', 'active');
    }

    public function test_admin_sport_slug_is_server_side_and_inactive_hides_from_public(): void
    {
        $this->login('admin-dash@mail.test');
        $created = $this->postJson('/api/v1/admin/sports', [
            'name' => 'Voli Pantai',
            'slug' => 'disisipkan-klien',
        ])->assertCreated();

        $created->assertJsonPath('data.slug', 'voli-pantai')
            ->assertJsonPath('data.is_active', true);
        $id = $created->json('data.id');

        $this->postJson('/api/v1/admin/sports', ['name' => 'Voli Pantai'])->assertUnprocessable();
        $this->patchJson('/api/v1/admin/sports/'.$id.'/toggle-active')
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $public = collect($this->getJson('/api/v1/sports')->assertOk()->json('data'));
        $this->assertFalse($public->pluck('slug')->contains('voli-pantai'));
    }

    public function test_admin_can_read_booking_history_and_owner_cannot(): void
    {
        $this->login('admin-dash@mail.test');
        $list = $this->getJson('/api/v1/admin/bookings?status=pending')->assertOk();
        $id = $list->json('data.0.id');
        $this->assertNotNull($id);

        BookingStatusHistory::query()->create([
            'booking_id' => $id,
            'from_status' => null,
            'to_status' => BookingStatus::Pending,
            'changed_by' => null,
            'reason' => 'Diajukan pelanggan',
            'created_at' => now(),
        ]);

        $this->getJson('/api/v1/admin/bookings/'.$id)
            ->assertOk()
            ->assertJsonPath('data.code', 'SC-DEMO0001')
            ->assertJsonPath('data.customer.name', 'Andi Pelanggan')
            ->assertJsonPath('data.histories.0.to_status', 'pending')
            ->assertJsonPath('data.histories.0.changed_by', null);

        $this->login('sari@demo.test');
        $this->getJson('/api/v1/admin/bookings/'.$id)->assertForbidden();
        $this->getJson('/api/v1/bookings/'.$id)->assertOk();
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
