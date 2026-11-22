<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithSpa;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use InteractsWithSpa;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpSpa();
    }

    public function test_customer_can_register_and_is_logged_in(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi Santoso',
            'email' => 'Budi@Mail.com',
            'password' => 'Rahasia12',
            'password_confirmation' => 'Rahasia12',
            'account_type' => 'customer',
            'role' => 'admin',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.email', 'budi@mail.com')
            ->assertJsonPath('data.role', 'customer')
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.phone', null)
            ->assertJsonMissingPath('data.password')
            ->assertJsonMissingPath('data.remember_token');

        $this->assertDatabaseHas('users', [
            'email' => 'budi@mail.com',
            'role' => UserRole::Customer->value,
        ]);

        $this->carryCookies($response)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'budi@mail.com');
    }

    public function test_owner_can_register(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Sari Venue',
            'email' => 'sari@venue.test',
            'password' => 'Rahasia12',
            'password_confirmation' => 'Rahasia12',
            'account_type' => 'owner',
        ])->assertCreated()
            ->assertJsonPath('data.role', 'owner');
    }

    public function test_admin_cannot_self_register(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Nak Admin',
            'email' => 'admin-palsu@mail.test',
            'password' => 'Rahasia12',
            'password_confirmation' => 'Rahasia12',
            'account_type' => 'admin',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('account_type');

        $this->assertDatabaseMissing('users', [
            'email' => 'admin-palsu@mail.test',
        ]);
    }

    public function test_duplicate_email_is_rejected(): void
    {
        User::factory()->create(['email' => 'ada@mail.test']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Orang Lain',
            'email' => 'Ada@Mail.test',
            'password' => 'Rahasia12',
            'password_confirmation' => 'Rahasia12',
            'account_type' => 'customer',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_weak_password_is_rejected(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi',
            'email' => 'lemah@mail.test',
            'password' => 'password',
            'password_confirmation' => 'password',
            'account_type' => 'customer',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }
}
