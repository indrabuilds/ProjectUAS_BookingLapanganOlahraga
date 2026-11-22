<?php

use App\Exceptions\BookingException;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../../vendor/autoload.php';

$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$user = User::query()->findOrFail((int) $argv[1]);

try {
    app(BookingService::class)->create($user, [
        'court_id' => (int) $argv[2],
        'date' => $argv[3],
        'start_hour' => (int) $argv[4],
        'duration_hours' => (int) $argv[5],
        'notes' => null,
    ]);
    fwrite(STDOUT, "created\n");
    exit(0);
} catch (BookingException $exception) {
    if ($exception->errorCode === 'BOOKING_SLOT_UNAVAILABLE') {
        fwrite(STDOUT, "conflict\n");
        exit(2);
    }

    fwrite(STDERR, $exception->errorCode.' '.$exception->getMessage());
    exit(1);
} catch (Throwable $exception) {
    fwrite(STDERR, $exception::class.' '.$exception->getMessage());
    exit(1);
}
