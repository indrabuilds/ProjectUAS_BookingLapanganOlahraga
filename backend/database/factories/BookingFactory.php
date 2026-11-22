<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = now()->addDay()->startOfHour();

        return [
            'code' => 'SC-'.Str::upper(Str::random(8)),
            'user_id' => User::factory(),
            'court_id' => Court::factory(),
            'start_at' => $start,
            'end_at' => $start->copy()->addHour(),
            'price_per_hour' => 50000,
            'total_price' => 50000,
            'status' => BookingStatus::Confirmed,
            'expires_at' => null,
            'notes' => null,
        ];
    }
}
