<?php

namespace App\Policies;

use App\Models\User;

// Profil hanya boleh diubah oleh pemilik session, bukan lewat id di body.
class UserPolicy
{
    public function update(User $actor, User $subject): bool
    {
        return $actor->is($subject);
    }
}
