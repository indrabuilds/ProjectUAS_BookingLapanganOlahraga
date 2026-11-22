<?php

namespace App\Exceptions;

use RuntimeException;

// Dilempar kalau status venue diminta pindah ke langkah yang tidak ada di aturan.
class InvalidVenueTransition extends RuntimeException
{
    public function __construct(string $message = 'Perubahan status venue tidak diizinkan.')
    {
        parent::__construct($message);
    }
}
