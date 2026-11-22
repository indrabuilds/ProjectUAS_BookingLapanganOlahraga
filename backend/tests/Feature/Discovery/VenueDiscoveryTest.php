<?php

namespace Tests\Feature\Discovery;

use App\Enums\UserStatus;
use App\Enums\VenueStatus;
use App\Models\Court;
use App\Models\Sport;
use App\Models\User;
use App\Models\Venue;
use App\Models\VenueImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class VenueDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_visible_venues_are_listed_and_hidden_ones_are_404(): void
    {
        $visible = $this->visibleVenue('GOR Terbuka', 'Bandung', true);
        $pending = $this->visibleVenue('GOR Pending', 'Bandung');
        $pending->update(['status' => VenueStatus::PendingVerification]);
        $inactive = $this->visibleVenue('GOR Tutup', 'Bandung');
        $inactive->update(['is_active' => false]);
        $suspendedOwner = $this->visibleVenue('GOR Owner', 'Bandung');
        $suspendedOwner->owner->status = UserStatus::Suspended;
        $suspendedOwner->owner->save();

        $this->getJson('/api/v1/venues')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'GOR Terbuka')
            ->assertJsonPath('data.0.city', 'Bandung')
            ->assertJsonMissingPath('data.0.status');

        $this->getJson('/api/v1/venues/'.$pending->id)->assertNotFound();
        $this->getJson('/api/v1/venues/'.$inactive->id)->assertNotFound();
        $this->getJson('/api/v1/venues/'.$suspendedOwner->id)->assertNotFound();
        $this->getJson('/api/v1/venues/'.$visible->id)
            ->assertOk()
            ->assertJsonPath('data.name', 'GOR Terbuka')
            ->assertJsonCount(7, 'data.operating_hours');
    }

    public function test_filters_sort_and_unknown_sport_are_validated(): void
    {
        $badminton = Sport::factory()->create(['name' => 'Badminton', 'slug' => 'badminton']);
        $futsal = Sport::factory()->create(['name' => 'Futsal', 'slug' => 'futsal']);
        $cheap = $this->visibleVenue('GOR Murah', 'Bandung');
        Court::factory()->create([
            'venue_id' => $cheap->id,
            'sport_id' => $badminton->id,
            'price_per_hour' => 40000,
            'is_active' => true,
        ]);
        $costly = $this->visibleVenue('GOR Mahal', 'Makassar');
        Court::factory()->create([
            'venue_id' => $costly->id,
            'sport_id' => $futsal->id,
            'price_per_hour' => 150000,
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/venues?q=Murah&city=Bandung&sport=badminton&max_price=50000&sort=price_asc')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.starting_price', '40000.00')
            ->assertJsonPath('data.0.sports.0.slug', 'badminton');

        $this->getJson('/api/v1/venues?sport=tidak-ada')->assertUnprocessable()->assertJsonValidationErrors('sport');
        $this->getJson('/api/v1/venues?min_price=100&max_price=50')->assertUnprocessable()->assertJsonValidationErrors('max_price');
    }

    public function test_listing_query_count_does_not_grow_per_venue(): void
    {
        $this->visibleVenue('Satu', 'Bandung', true);
        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->getJson('/api/v1/venues')->assertOk();
        $one = count(DB::getQueryLog());

        $this->visibleVenue('Dua', 'Bandung', true);
        $this->visibleVenue('Tiga', 'Bandung', true);
        DB::flushQueryLog();
        $this->getJson('/api/v1/venues')->assertOk()->assertJsonCount(3, 'data');
        $three = count(DB::getQueryLog());

        $this->assertSame($one, $three, 'Jumlah query harus tetap saat venue bertambah.');
    }

    private function visibleVenue(string $name, string $city, bool $withCourt = false): Venue
    {
        $owner = User::factory()->owner()->create(['status' => UserStatus::Active]);
        $venue = Venue::factory()->create([
            'owner_id' => $owner->id,
            'name' => $name,
            'slug' => str($name)->slug().'-'.str()->lower(str()->random(4)),
            'city' => $city,
            'status' => VenueStatus::Approved,
            'is_active' => true,
        ]);

        if ($withCourt) {
            Court::factory()->create([
                'venue_id' => $venue->id,
                'sport_id' => Sport::factory(),
                'is_active' => true,
                'price_per_hour' => 80000,
            ]);
            VenueImage::query()->create([
                'venue_id' => $venue->id,
                'path' => 'venues/sampul.png',
                'sort_order' => 0,
            ]);
        }

        return $venue;
    }
}
