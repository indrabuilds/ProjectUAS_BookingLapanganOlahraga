<?php

namespace App\Enums;

// Peta transisi yang boleh. Slot hanya dipegang pending yang belum kedaluwarsa atau confirmed.
enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';
    case Completed = 'completed';
    case Expired = 'expired';

    public function canTransitionTo(self $next): bool
    {
        return match ($this) {
            self::Pending => in_array($next, [self::Confirmed, self::Rejected, self::Cancelled, self::Expired], true),
            self::Confirmed => in_array($next, [self::Cancelled, self::Completed], true),
            default => false,
        };
    }
}
