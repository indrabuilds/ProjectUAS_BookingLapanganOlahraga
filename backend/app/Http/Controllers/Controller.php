<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    // $this->authorize() memanggil Policy. Frontend tidak boleh jadi batas keamanan.
    use AuthorizesRequests;
}
