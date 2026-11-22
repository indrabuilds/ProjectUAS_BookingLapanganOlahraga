<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicVenueResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...(new VenueCardResource($this))->toArray($request),
            'description' => $this->description,
            'address' => $this->address,
            'phone' => $this->phone,
            'timezone' => $this->timezone,
            'facilities' => $this->facilities ?? [],
            'images' => VenueImageResource::collection($this->whenLoaded('images')),
            'operating_hours' => OperatingHourResource::collection($this->whenLoaded('operatingHours')),
            'courts' => PublicCourtResource::collection($this->whenLoaded('courts')),
        ];
    }
}
