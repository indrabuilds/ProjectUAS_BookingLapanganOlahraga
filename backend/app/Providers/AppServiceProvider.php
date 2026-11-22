<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    private function configureRateLimiting(): void
    {
        $tooMany = static fn (string $message) => static function (Request $request, array $headers) use ($message) {
            return response()->json([
                'message' => $message,
                'code' => 'TOO_MANY_REQUESTS',
            ], 429, $headers);
        };

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // 5 attempts per minute per (email + IP) — brute-force protection.
        RateLimiter::for('login', function (Request $request) use ($tooMany) {
            $email = mb_strtolower(trim((string) $request->input('email')));

            return Limit::perMinute(5)
                ->by($email.'|'.$request->ip())
                ->response($tooMany('Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.'));
        });

        RateLimiter::for('register', function (Request $request) use ($tooMany) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response($tooMany('Terlalu banyak percobaan registrasi. Silakan coba lagi nanti.'));
        });

        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('booking-create', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('password', function (Request $request) use ($tooMany) {
            return Limit::perMinute(5)
                ->by((string) ($request->user()?->id ?: $request->ip()))
                ->response($tooMany('Terlalu banyak percobaan ganti password. Silakan coba lagi nanti.'));
        });
    }
}
