<?php

namespace App\Exceptions;

use RuntimeException;

// Blokir tidak boleh menimpa booking yang masih menahan slot.
class BlockConflictsWithBooking extends RuntimeException
{
    public function __construct(string $message = 'Blokir bertabrakan dengan booking yang masih aktif.')
    {
        parent::__construct($message);
    }
}
