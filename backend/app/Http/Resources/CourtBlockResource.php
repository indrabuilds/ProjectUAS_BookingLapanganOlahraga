<?php

namespace App\Http\Resources;

use App\Support\VenueClock;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourtBlockResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $timezone = $this->court?->venue?->timezone ?? 'Asia/Jakarta';
        $start = $this->start_at->copy()->timezone($timezone);
        $end = $this->end_at->copy()->timezone($timezone);

        return [
            'id' => $this->id,
            'date' => $start->toDateString(),
            'start_hour' => (int) $start->format('G'),
            'end_hour' => $end->format('H:i') === '00:00' ? 24 : (int) $end->format('G'),
            'reason' => $this->reason,
            'start_at' => VenueClock::toUtc(CarbonImmutable::instance($this->start_at))->format('Y-m-d\TH:i:s\Z'),
            'end_at' => $this->end_at->utc()->format('Y-m-d\TH:i:s\Z'),
        ];
    }
}
