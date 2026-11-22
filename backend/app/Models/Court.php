<?php

namespace App\Models;

use App\Enums\UserStatus;
use App\Enums\VenueStatus;
use Database\Factories\CourtFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

// venue_id diisi dari URL, bukan dari body, supaya owner tidak menaruh court di venue orang lain.
#[Fillable(['venue_id', 'sport_id', 'name', 'description', 'price_per_hour', 'image_path', 'is_active'])]
class Court extends Model
{
    /** @use HasFactory<CourtFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_per_hour' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Venue, $this>
     */
    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    /**
     * @return BelongsTo<Sport, $this>
     */
    public function sport(): BelongsTo
    {
        return $this->belongsTo(Sport::class);
    }

    /**
     * @return HasMany<CourtBlock, $this>
     */
    public function blocks(): HasMany
    {
        return $this->hasMany(CourtBlock::class);
    }

    // Lapangan tersembunyi harus terlihat seperti tidak ada, termasuk saat tanggalnya salah.
    public function isOpenToPublic(): bool
    {
        $this->loadMissing('venue.owner');
        $venue = $this->venue;

        return $this->is_active
            && $venue !== null
            && $venue->status === VenueStatus::Approved
            && $venue->is_active
            && $venue->owner?->status === UserStatus::Active;
    }

    public function imageUrl(): ?string
    {
        if ($this->image_path === null) {
            return null;
        }

        return Storage::disk('public')->url($this->image_path);
    }
}
