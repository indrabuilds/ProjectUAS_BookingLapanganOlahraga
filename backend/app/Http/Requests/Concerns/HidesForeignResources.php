<?php

namespace App\Http\Requests\Concerns;

use App\Models\Booking;
use App\Models\Court;
use App\Models\Venue;

// Validasi jalan sebelum controller. Tanpa cek ini, pemilik lain bisa dapat 422 dan tahu data itu ada.
trait HidesForeignResources
{
    protected function hideForeignResource(): bool
    {
        $user = $this->user();
        if ($user === null) {
            abort(404);
        }

        $venue = $this->route('venue');
        if ($venue instanceof Venue && ! $user->can('manage', $venue)) {
            abort(404);
        }

        $court = $this->route('court');
        if ($court instanceof Court && ! $user->can('manage', $court)) {
            abort(404);
        }

        $booking = $this->route('booking');
        if ($booking instanceof Booking && ! $user->can('view', $booking)) {
            abort(404);
        }

        return true;
    }
}
