<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rejects requests from suspended accounts and terminates their session,
 * so a user suspended by an admin loses access on the very next request.
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null && ! $user->isActive()) {
            Auth::guard('web')->logout();

            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            Auth::forgetGuards();

            return response()->json([
                'message' => 'Akun Anda sedang dinonaktifkan. Hubungi admin SportsCourt.',
                'code' => 'ACCOUNT_SUSPENDED',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
