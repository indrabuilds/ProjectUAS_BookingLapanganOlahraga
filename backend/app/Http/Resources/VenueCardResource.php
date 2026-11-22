<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

// Kartu pencarian. Tidak memuat status internal atau alasan admin.
class VenueCardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $cover = $this->relationLoaded('images') ? $this->images->first() : null;
        $sports = $this->relationLoaded('courts')
            ? $this->courts->pluck('sport')->filter()->unique('id')->values()->map(fn ($sport) => [
                'id' => $sport->id,
                'name' => $sport->name,
                'slug' => $sport->slug,
            ])->all()
            : [];

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'city' => $this->city,
            'province' => $this->province,
            'cover_image_url' => $cover ? Storage::disk('public')->url($cover->path) : null,
            'sports' => $sports,
            'starting_price' => $this->starting_price === null
                ? null
                : number_format((float) $this->starting_price, 2, '.', ''),
        ];
    }
}
