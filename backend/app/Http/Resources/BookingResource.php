<?php

namespace App\Http\Resources;

use App\Services\BookingService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing('court.venue', 'court.sport');
        $timezone = $this->court->venue->timezone ?? 'UTC';
        $start = CarbonImmutable::instance($this->start_at)->timezone($timezone);
        $end = CarbonImmutable::instance($this->end_at)->timezone($timezone);
        $viewer = $request->user();

        return [
            'id' => $this->id,
            'code' => $this->code,
            'status' => $this->status->value,
            'start_at' => $this->start_at->utc()->format('Y-m-d\TH:i:s\Z'),
            'end_at' => $this->end_at->utc()->format('Y-m-d\TH:i:s\Z'),
            'local' => [
                'date' => $start->toDateString(),
                'start' => $start->format('H:i'),
                'end' => $end->format('H:i'),
                'timezone' => $timezone,
            ],
            'duration_hours' => (int) round($this->start_at->diffInMinutes($this->end_at, true) / 60),
            'price_per_hour' => number_format((float) $this->price_per_hour, 2, '.', ''),
            'total_price' => number_format((float) $this->total_price, 2, '.', ''),
            'expires_at' => $this->expires_at?->utc()->format('Y-m-d\TH:i:s\Z'),
            'notes' => $this->notes,
            'court' => [
                'id' => $this->court->id,
                'name' => $this->court->name,
                'sport' => $this->court->sport?->name,
            ],
            'venue' => [
                'id' => $this->court->venue->id,
                'name' => $this->court->venue->name,
                'slug' => $this->court->venue->slug,
            ],
            'can_cancel' => $viewer ? app(BookingService::class)->canCancel($viewer, $this->resource) : false,
            // Email pelanggan tidak ikut. Pemilik cukup nama dan telepon untuk menghubungi.
            'customer' => $this->when(
                $viewer && $viewer->id !== $this->user_id,
                fn () => [
                    'name' => $this->user?->name,
                    'phone' => $this->user?->phone,
                ],
            ),
            'created_at' => $this->created_at?->utc()->format('Y-m-d\TH:i:s\Z'),
            'histories' => BookingHistoryResource::collection($this->whenLoaded('histories')),
        ];
    }
}
