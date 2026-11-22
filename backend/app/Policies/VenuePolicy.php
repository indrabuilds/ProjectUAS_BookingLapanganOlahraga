<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Venue;

// Owner hanya boleh mengelola venue miliknya. Admin memverifikasi lewat endpoint admin.
class VenuePolicy
{
    public function manage(User $user, Venue $venue): bool
    {
        return $user->role === UserRole::Owner && $venue->owner_id === $user->id;
    }

    public function moderate(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }
}
