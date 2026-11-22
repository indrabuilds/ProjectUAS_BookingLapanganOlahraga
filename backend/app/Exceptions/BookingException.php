<?php

namespace App\Exceptions;

use RuntimeException;

// Kesalahan aturan booking. code dibaca klien, status HTTP dipilih di handler.
class BookingException extends RuntimeException
{
    public function __construct(
        public readonly string $errorCode,
        string $message,
        public readonly int $status = 422,
    ) {
        parent::__construct($message);
    }
}
