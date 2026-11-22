<?php

namespace App\Console\Commands;

use App\Services\BookingService;
use Illuminate\Console\Command;

// Pending yang melewati expires_at menjadi expired, tanpa menunggu halaman dibuka.
class ExpirePendingBookings extends Command
{
    protected $signature = 'bookings:expire-pending';

    protected $description = 'Ubah booking pending yang sudah lewat batas menjadi expired.';

    public function handle(BookingService $bookings): int
    {
        $count = $bookings->expireDue();
        $this->info($count.' booking menjadi expired.');

        return self::SUCCESS;
    }
}
