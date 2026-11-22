<?php

namespace App\Exceptions;

use RuntimeException;

// Tanggal di luar jendela booking ditolak di service, bukan hanya di form.
class InvalidAvailabilityDate extends RuntimeException
{
    public function __construct(string $message = 'Tanggal di luar jangkauan pencarian.')
    {
        parent::__construct($message);
    }
}
