<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class SanctumConfigTest extends TestCase
{
    public function test_spa_cookie_settings_match_the_local_frontend(): void
    {
        $this->assertContains('localhost:5173', config('sanctum.stateful'));
        $this->assertNotContains('127.0.0.1', config('sanctum.stateful'));
        $this->assertTrue(config('cors.supports_credentials'));
        $this->assertContains('http://localhost:5173', config('cors.allowed_origins'));
        $this->assertNotContains('*', config('cors.allowed_origins'));
        $this->assertContains('api/*', config('cors.paths'));
        $this->assertContains('sanctum/csrf-cookie', config('cors.paths'));
        $this->assertSame('localhost', config('session.domain'));
        $this->assertSame('lax', config('session.same_site'));
    }
}
