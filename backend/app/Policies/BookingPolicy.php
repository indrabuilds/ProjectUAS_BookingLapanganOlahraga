<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\User;

// Yang boleh melihat: pemesan, pemilik venue, atau admin. Selain itu dianggap tidak ada.
class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        if ($user->role === UserRole::Admin) {
            return true;
        }

        if ($user->id === $booking->user_id) {
            return true;
        }

        $booking->loadMissing('court.venue');

        return $user->role === UserRole::Owner
            && $booking->court?->venue?->owner_id === $user->id;
    }
}
