<?php

namespace App\Http\Controllers\Api\V1\Concerns;

use App\Models\Court;
use App\Models\Venue;
use Illuminate\Http\Request;

trait ResolvesOwnedVenue
{
    // 404, bukan 403, supaya owner lain tidak bisa memastikan venue itu ada.
    protected function ownedVenue(Request $request, Venue $venue): Venue
    {
        if (! $request->user()->can('manage', $venue)) {
            abort(404);
        }

        return $venue;
    }

    protected function ownedCourt(Request $request, Court $court): Court
    {
        if (! $request->user()->can('manage', $court)) {
            abort(404);
        }

        return $court;
    }
}
