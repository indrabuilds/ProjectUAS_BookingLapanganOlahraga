<?php

namespace App\Console\Commands;

use App\Services\BookingService;
use Illuminate\Console\Command;

// Confirmed yang jam selesainya sudah lewat ditandai completed.
class CompleteBookings extends Command
{
    protected $signature = 'bookings:complete';

    protected $description = 'Ubah booking confirmed yang sudah selesai menjadi completed.';

    public function handle(BookingService $bookings): int
    {
        $count = $bookings->completeDue();
        $this->info($count.' booking menjadi completed.');

        return self::SUCCESS;
    }
}
