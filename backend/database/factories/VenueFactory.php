<?php

namespace Database\Factories;

use App\Enums\VenueStatus;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Venue>
 */
class VenueFactory extends Factory
{
    protected $model = Venue::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = 'GOR '.Str::title(fake()->unique()->word());

        return [
            'owner_id' => User::factory()->owner(),
            'name' => substr($name, 0, 150),
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(4)),
            'description' => fake()->sentence(),
            'address' => fake()->streetAddress(),
            'city' => 'Bandung',
            'province' => 'Jawa Barat',
            'phone' => '081234567890',
            'timezone' => 'Asia/Jakarta',
            'facilities' => ['parking'],
            'status' => VenueStatus::PendingVerification,
            'status_reason' => null,
            'is_active' => true,
        ];
    }
}
