<?php

namespace App\Models;

use App\Enums\VenueStatus;
use App\Exceptions\InvalidVenueTransition;
use Database\Factories\VenueFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

// owner_id dan status ada di fillable untuk factory dan aksi server.
// Jangan pernah mengisi keduanya dari body request.
#[Fillable([
    'owner_id',
    'name',
    'slug',
    'description',
    'address',
    'city',
    'province',
    'phone',
    'timezone',
    'facilities',
    'status',
    'status_reason',
    'verified_at',
    'verified_by',
    'is_active',
])]
class Venue extends Model
{
    /** @use HasFactory<VenueFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'facilities' => 'array',
            'status' => VenueStatus::class,
            'verified_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // Jam default 08-22 supaya venue baru selalu punya 7 hari, tanpa form terpisah.
        static::created(function (Venue $venue): void {
            if ($venue->operatingHours()->exists()) {
                return;
            }

            $rows = [];
            for ($day = 1; $day <= 7; $day++) {
                $rows[] = [
                    'day_of_week' => $day,
                    'is_closed' => false,
                    'open_hour' => 8,
                    'close_hour' => 22,
                ];
            }

            $venue->operatingHours()->createMany($rows);
        });
    }

    public static function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        if ($base === '') {
            $base = 'venue';
        }

        $base = substr($base, 0, 160);
        $slug = $base;
        $suffix = 2;

        while (static::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * @return HasMany<VenueImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(VenueImage::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<OperatingHour, $this>
     */
    public function operatingHours(): HasMany
    {
        return $this->hasMany(OperatingHour::class)->orderBy('day_of_week');
    }

    /**
     * @return HasMany<Court, $this>
     */
    public function courts(): HasMany
    {
        return $this->hasMany(Court::class);
    }

    public function statusValue(): VenueStatus
    {
        return $this->status instanceof VenueStatus
            ? $this->status
            : VenueStatus::from((string) $this->status);
    }

    public function ensureOwnerCanEdit(): void
    {
        if ($this->statusValue() === VenueStatus::Suspended) {
            throw new InvalidVenueTransition('Venue yang ditangguhkan tidak bisa diubah. Minta admin mengaktifkan kembali.');
        }
    }

    public function markResubmittedIfRejected(): void
    {
        if ($this->statusValue() !== VenueStatus::Rejected) {
            return;
        }

        $this->transitionTo(VenueStatus::PendingVerification, null, null);
    }

    public function transitionTo(VenueStatus $next, ?string $reason, ?User $actor, ?VenueStatus $onlyFrom = null): void
    {
        $current = $this->statusValue();

        if ($onlyFrom !== null && $current !== $onlyFrom) {
            throw new InvalidVenueTransition('Status venue tidak bisa diubah dari '.$current->value.' ke '.$next->value.'.');
        }

        if (! $current->canTransitionTo($next)) {
            throw new InvalidVenueTransition('Status venue tidak bisa diubah dari '.$current->value.' ke '.$next->value.'.');
        }

        $payload = ['status' => $next];

        if ($next === VenueStatus::Approved) {
            $payload['status_reason'] = null;
            if ($current === VenueStatus::PendingVerification) {
                $payload['verified_at'] = now();
                $payload['verified_by'] = $actor?->id;
            }
        }

        if ($next === VenueStatus::Rejected || $next === VenueStatus::Suspended) {
            $payload['status_reason'] = $reason;
        }

        if ($next === VenueStatus::PendingVerification) {
            $payload['status_reason'] = null;
            $payload['verified_at'] = null;
            $payload['verified_by'] = null;
        }

        $this->forceFill($payload)->save();
    }
}
