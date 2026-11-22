<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Court;
use App\Models\User;

// Court ikut venue. Owner lain tidak boleh tahu court itu ada, jadi pemanggil mengembalikan 404.
class CourtPolicy
{
    public function manage(User $user, Court $court): bool
    {
        $venue = $court->venue;

        return $user->role === UserRole::Owner
            && $venue !== null
            && $venue->owner_id === $user->id;
    }
}
