<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Exceptions\BlockConflictsWithBooking;
use App\Http\Controllers\Api\V1\Concerns\ResolvesOwnedVenue;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\CourtBlockIndexRequest;
use App\Http\Requests\Owner\StoreCourtBlockRequest;
use App\Http\Resources\CourtBlockResource;
use App\Models\Booking;
use App\Models\Court;
use App\Models\CourtBlock;
use App\Support\VenueClock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class CourtBlockController extends Controller
{
    use ResolvesOwnedVenue;

    public function index(CourtBlockIndexRequest $request, Court $court): AnonymousResourceCollection
    {
        $court = $this->ownedCourt($request, $court);
        $timezone = $court->venue->timezone;
        $query = $court->blocks()->with('court.venue')->orderBy('start_at');

        if ($request->filled('from')) {
            $from = VenueClock::toUtc(VenueClock::localDay($request->string('from')->toString(), $timezone));
            $query->where('end_at', '>', $from);
        }

        if ($request->filled('to')) {
            $to = VenueClock::toUtc(VenueClock::localDay($request->string('to')->toString(), $timezone)->addDay());
            $query->where('start_at', '<', $to);
        }

        return CourtBlockResource::collection($query->get());
    }

    public function store(StoreCourtBlockRequest $request, Court $court): JsonResponse
    {
        $court = $this->ownedCourt($request, $court);
        $timezone = $court->venue->timezone;
        $day = VenueClock::localDay($request->string('date')->toString(), $timezone);
        $start = VenueClock::toUtc(VenueClock::atHour($day, $request->integer('start_hour')));
        $end = VenueClock::toUtc(VenueClock::atHour($day, $request->integer('end_hour')));

        $block = DB::transaction(function () use ($request, $court, $start, $end) {
            // Kunci court dulu supaya blokir dan booking tidak saling menyalip.
            Court::query()->whereKey($court->id)->lockForUpdate()->first();

            $conflict = Booking::query()
                ->where('court_id', $court->id)
                ->holdingSlot()
                ->where('start_at', '<', $end)
                ->where('end_at', '>', $start)
                ->exists();

            if ($conflict) {
                throw new BlockConflictsWithBooking;
            }

            return $court->blocks()->create([
                'start_at' => $start,
                'end_at' => $end,
                'reason' => $request->string('reason')->toString(),
                'created_by' => $request->user()->id,
            ]);
        });

        $block->load('court.venue');

        return (new CourtBlockResource($block))->response()->setStatusCode(201);
    }

    public function destroy(CourtBlock $block): Response
    {
        $block->loadMissing('court.venue');
        $court = $block->court;
        if ($court === null || ! request()->user()->can('manage', $court)) {
            abort(404);
        }

        $block->delete();

        return response()->noContent();
    }
}
