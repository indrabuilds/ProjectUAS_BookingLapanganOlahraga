<?php

namespace Database\Factories;

use App\Models\Court;
use App\Models\Sport;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Court>
 */
class CourtFactory extends Factory
{
    protected $model = Court::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'venue_id' => Venue::factory(),
            'sport_id' => Sport::factory(),
            'name' => 'Court '.fake()->unique()->numerify('##'),
            'description' => null,
            'price_per_hour' => 75000,
            'image_path' => null,
            'is_active' => true,
        ];
    }
}
