<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// user_id diisi dari session. Harga dan status diisi BookingService, bukan dari body klien.
#[Fillable([
    'code',
    'user_id',
    'court_id',
    'start_at',
    'end_at',
    'price_per_hour',
    'total_price',
    'status',
    'expires_at',
    'notes',
])]
class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'expires_at' => 'datetime',
            'price_per_hour' => 'decimal:2',
            'total_price' => 'decimal:2',
            'status' => BookingStatus::class,
        ];
    }

    /**
     * @param  Builder<Booking>  $query
     * @return Builder<Booking>
     */
    public function scopeHoldingSlot(Builder $query): Builder
    {
        return $query->where(function (Builder $inner): void {
            $inner->where('status', BookingStatus::Confirmed)
                ->orWhere(function (Builder $pending): void {
                    $pending->where('status', BookingStatus::Pending)
                        ->where('expires_at', '>', now());
                });
        });
    }

    /**
     * @return BelongsTo<Court, $this>
     */
    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<BookingStatusHistory, $this>
     */
    public function histories(): HasMany
    {
        return $this->hasMany(BookingStatusHistory::class);
    }
}
