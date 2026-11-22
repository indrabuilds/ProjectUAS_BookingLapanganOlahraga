<?php

namespace Tests\Concerns;

use Illuminate\Support\Facades\Auth;
use Illuminate\Testing\TestResponse;

// Test JSON tidak menyimpan cookie sendiri. Helper ini meniru browser SPA.
trait InteractsWithSpa
{
    protected function setUpSpa(): void
    {
        $this->withCredentials();
        $this->withHeaders([
            'origin' => 'http://localhost:5173',
            'referer' => 'http://localhost:5173',
        ]);
    }

    protected function carryCookies(TestResponse $response): static
    {
        foreach ($response->headers->getCookies() as $cookie) {
            $this->withUnencryptedCookie($cookie->getName(), $cookie->getValue());
        }

        // Browser membuka process baru tiap request. Test ini tidak, jadi cache guard harus dibuang.
        Auth::forgetGuards();

        return $this;
    }
}
