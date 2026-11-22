<?php

namespace App\Http\Resources;

use App\Enums\VenueStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Bentuk venue untuk owner dan admin.
 * Halaman publik (tanpa status internal) menyusul di fase pencarian.
 */
class VenueResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $status = $this->status instanceof VenueStatus ? $this->status->value : $this->status;
        $cover = $this->relationLoaded('images') ? $this->images->first() : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'phone' => $this->phone,
            'timezone' => $this->timezone,
            'facilities' => $this->facilities ?? [],
            'status' => $status,
            'status_reason' => $this->status_reason,
            'is_active' => $this->is_active,
            'cover_image_url' => $cover?->url(),
            'verified_at' => $this->verified_at?->utc()->format('Y-m-d\TH:i:s\Z'),
            'created_at' => $this->created_at?->utc()->format('Y-m-d\TH:i:s\Z'),
            'images' => VenueImageResource::collection($this->whenLoaded('images')),
            'operating_hours' => OperatingHourResource::collection($this->whenLoaded('operatingHours')),
            'courts' => CourtResource::collection($this->whenLoaded('courts')),
            'courts_count' => $this->whenCounted('courts'),
            'owner' => $this->whenLoaded('owner', fn () => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
                'email' => $this->owner->email,
                'phone' => $this->owner->phone,
            ]),
        ];
    }
}
