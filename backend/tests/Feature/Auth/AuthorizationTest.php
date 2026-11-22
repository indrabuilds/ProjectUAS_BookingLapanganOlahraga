<?php

namespace Tests\Feature\Auth;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\Concerns\InteractsWithSpa;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use InteractsWithSpa;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpSpa();

        // Route ini hanya ada di test, supaya middleware role bisa diuji tanpa fitur fase berikutnya.
        Route::middleware(['api', 'auth:sanctum', 'active', 'role:owner'])
            ->get('/api/v1/_probe/owner', fn () => response()->json(['data' => ['ok' => true]]));

        Route::middleware(['api', 'auth:sanctum', 'active', 'role:admin'])
            ->get('/api/v1/_probe/admin', fn () => response()->json(['data' => ['ok' => true]]));
    }

    public function test_customer_cannot_open_an_owner_route(): void
    {
        $this->loginAs(User::factory()->create([
            'email' => 'cust@mail.test',
            'password' => 'Rahasia12',
        ]));

        $this->getJson('/api/v1/_probe/owner')->assertForbidden();
        $this->getJson('/api/v1/_probe/admin')->assertForbidden();
    }

    public function test_owner_can_open_an_owner_route_but_not_admin(): void
    {
        $this->loginAs(User::factory()->owner()->create([
            'email' => 'owner@mail.test',
            'password' => 'Rahasia12',
        ]));

        $this->getJson('/api/v1/_probe/owner')
            ->assertOk()
            ->assertJsonPath('data.ok', true);

        $this->getJson('/api/v1/_probe/admin')->assertForbidden();
    }

    public function test_admin_can_open_an_admin_route(): void
    {
        $this->loginAs(User::factory()->admin()->create([
            'email' => 'admin@mail.test',
            'password' => 'Rahasia12',
        ]));

        $this->getJson('/api/v1/_probe/admin')->assertOk();
        $this->getJson('/api/v1/_probe/owner')->assertForbidden();
    }

    public function test_guest_is_unauthorized(): void
    {
        $this->getJson('/api/v1/_probe/owner')->assertUnauthorized();
    }

    public function test_suspended_session_is_rejected_on_the_next_request(): void
    {
        $user = User::factory()->create([
            'email' => 'budi@mail.test',
            'password' => 'Rahasia12',
        ]);

        $this->loginAs($user);

        $user->forceFill(['status' => UserStatus::Suspended])->save();

        $this->getJson('/api/v1/auth/me')
            ->assertForbidden()
            ->assertJsonPath('code', 'ACCOUNT_SUSPENDED');

        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_register_is_throttled_per_ip(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.44']);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/v1/auth/register', [
                'name' => 'Budi',
                'email' => "budi{$attempt}@mail.test",
                'password' => 'pendek',
                'password_confirmation' => 'pendek',
                'account_type' => 'customer',
            ])->assertUnprocessable();
        }

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi',
            'email' => 'budi-lagi@mail.test',
            'password' => 'Rahasia12',
            'password_confirmation' => 'Rahasia12',
            'account_type' => 'customer',
        ])->assertStatus(429);

        $this->assertDatabaseMissing('users', [
            'email' => 'budi-lagi@mail.test',
        ]);
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
