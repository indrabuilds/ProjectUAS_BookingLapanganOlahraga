<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Exceptions\InvalidAvailabilityDate;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\AvailabilityRequest;
use App\Models\Court;
use App\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;

class AvailabilityController extends Controller
{
    public function __invoke(AvailabilityRequest $request, Court $court, AvailabilityService $availability): JsonResponse
    {
        // Form request sudah menolak court tersembunyi. Ini cadangan kalau pemanggilan lain lupa.
        if (! $court->isOpenToPublic()) {
            abort(404);
        }

        try {
            $payload = $availability->forDate($court, $request->string('date')->toString());
        } catch (InvalidAvailabilityDate $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => ['date' => [$exception->getMessage()]],
            ], 422);
        }

        return response()->json(['data' => $payload]);
    }
}
