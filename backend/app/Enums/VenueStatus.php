<?php

namespace App\Enums;

// Urutan status venue. Bukan semua langkah boleh dilompati.
enum VenueStatus: string
{
    case PendingVerification = 'pending_verification';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Suspended = 'suspended';

    public function canTransitionTo(self $next): bool
    {
        return match ($this) {
            self::PendingVerification => in_array($next, [self::Approved, self::Rejected], true),
            self::Rejected => $next === self::PendingVerification,
            self::Approved => $next === self::Suspended,
            self::Suspended => $next === self::Approved,
        };
    }
}
