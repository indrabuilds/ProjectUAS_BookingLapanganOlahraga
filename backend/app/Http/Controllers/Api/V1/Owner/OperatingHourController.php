<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Api\V1\Concerns\ResolvesOwnedVenue;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\UpdateOperatingHoursRequest;
use App\Http\Resources\OperatingHourResource;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class OperatingHourController extends Controller
{
    use ResolvesOwnedVenue;

    public function index(Request $request, Venue $venue): AnonymousResourceCollection
    {
        $venue = $this->ownedVenue($request, $venue);

        return OperatingHourResource::collection($venue->operatingHours()->orderBy('day_of_week')->get());
    }

    public function update(UpdateOperatingHoursRequest $request, Venue $venue): AnonymousResourceCollection
    {
        $venue = $this->ownedVenue($request, $venue);

        // Ganti 7 baris sekaligus. Booking yang sudah ada tidak dibatalkan.
        DB::transaction(function () use ($request, $venue): void {
            foreach ($request->validated('days') as $day) {
                $closed = filter_var($day['is_closed'], FILTER_VALIDATE_BOOLEAN);
                $venue->operatingHours()->updateOrCreate(
                    ['day_of_week' => $day['day_of_week']],
                    [
                        'is_closed' => $closed,
                        'open_hour' => $closed ? null : $day['open_hour'],
                        'close_hour' => $closed ? null : $day['close_hour'],
                    ],
                );
            }
        });

        return OperatingHourResource::collection($venue->operatingHours()->orderBy('day_of_week')->get());
    }
}
