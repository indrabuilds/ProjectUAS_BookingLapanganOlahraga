<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\InteractsWithSpa;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use InteractsWithSpa;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpSpa();
    }

    public function test_user_can_login_logout_and_session_ends(): void
    {
        User::factory()->create([
            'email' => 'budi@mail.test',
            'password' => 'Rahasia12',
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'Budi@Mail.test',
            'password' => 'Rahasia12',
        ]);

        $login->assertOk()
            ->assertJsonPath('data.email', 'budi@mail.test')
            ->assertJsonMissingPath('data.password');

        $this->carryCookies($login);

        $this->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.role', 'customer');

        $logout = $this->postJson('/api/v1/auth/logout');
        $logout->assertNoContent();

        $this->carryCookies($logout)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    }

    public function test_wrong_password_uses_a_generic_message(): void
    {
        User::factory()->suspended()->create([
            'email' => 'budi@mail.test',
            'password' => 'Rahasia12',
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@mail.test',
            'password' => 'Salah1234',
        ])->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'Email atau password salah.')
            ->assertJsonMissingPath('code');
    }

    public function test_suspended_account_cannot_login(): void
    {
        User::factory()->suspended()->create([
            'email' => 'budi@mail.test',
            'password' => 'Rahasia12',
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@mail.test',
            'password' => 'Rahasia12',
        ]);

        $login->assertForbidden()
            ->assertJsonPath('code', 'ACCOUNT_SUSPENDED');

        $this->carryCookies($login)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    }

    public function test_login_is_throttled_after_five_attempts(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.15']);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'budi@mail.test',
                'password' => 'Salah1234',
            ])->assertUnprocessable();
        }

        $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@mail.test',
            'password' => 'Salah1234',
        ])->assertStatus(429);
    }

    public function test_guest_cannot_read_current_user(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }
}
