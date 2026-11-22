<?php

namespace Tests\Feature\Venue;

use App\Models\Court;
use App\Models\Sport;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\MakesVenueContext;
use Tests\TestCase;

class CourtManagementTest extends TestCase
{
    use MakesVenueContext;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpVenueContext();
        Storage::fake('public');
    }

    public function test_owner_creates_court_on_the_venue_in_the_url(): void
    {
        $owner = $this->makeOwner('owner@mail.test');
        $this->loginAs($owner);
        $sport = $this->makeSport();
        $venue = Venue::factory()->create(['owner_id' => $owner->id]);
        $other = Venue::factory()->create(['owner_id' => $owner->id]);

        $this->postJson('/api/v1/owner/venues/'.$venue->id.'/courts', [
            'venue_id' => $other->id,
            'name' => 'Court A',
            'sport_id' => $sport->id,
            'description' => 'Lantai kayu',
            'price_per_hour' => 75000,
            'is_active' => false,
            'status' => 'approved',
        ])->assertCreated()
            ->assertJsonPath('data.venue_id', $venue->id)
            ->assertJsonPath('data.name', 'Court A')
            ->assertJsonPath('data.price_per_hour', '75000.00')
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.sport.slug', $sport->slug);

        $this->assertSame(1, Court::query()->where('venue_id', $venue->id)->count());
        $this->assertSame(0, Court::query()->where('venue_id', $other->id)->count());
    }

    public function test_other_owner_cannot_see_or_edit_the_court(): void
    {
        $ownerA = $this->makeOwner('a@mail.test');
        $ownerB = $this->makeOwner('b@mail.test');
        $sport = Sport::factory()->create();
        $venue = Venue::factory()->create(['owner_id' => $ownerA->id]);
        $court = Court::factory()->create([
            'venue_id' => $venue->id,
            'sport_id' => $sport->id,
            'name' => 'Court A',
            'price_per_hour' => 50000,
        ]);

        $this->loginAs($ownerB);

        $this->getJson('/api/v1/owner/venues/'.$venue->id.'/courts')->assertNotFound();
        $this->putJson('/api/v1/owner/courts/'.$court->id, [
            'name' => 'Diubah',
            'sport_id' => $sport->id,
            'price_per_hour' => 1000,
        ])->assertNotFound();
        $this->deleteJson('/api/v1/owner/courts/'.$court->id)->assertNotFound();

        $this->assertSame('Court A', $court->fresh()->name);
    }

    public function test_duplicate_name_inactive_sport_and_bad_price_are_rejected(): void
    {
        $owner = $this->makeOwner('owner@mail.test');
        $this->loginAs($owner);
        $venue = Venue::factory()->create(['owner_id' => $owner->id]);
        $sport = $this->makeSport();
        Court::factory()->create([
            'venue_id' => $venue->id,
            'sport_id' => $sport->id,
            'name' => 'Court A',
        ]);
        $inactive = Sport::factory()->inactive()->create();

        $this->postJson('/api/v1/owner/venues/'.$venue->id.'/courts', [
            'name' => 'Court A',
            'sport_id' => $sport->id,
            'price_per_hour' => 10000,
        ])->assertUnprocessable()->assertJsonValidationErrors('name');

        $this->postJson('/api/v1/owner/venues/'.$venue->id.'/courts', [
            'name' => 'Court B',
            'sport_id' => $inactive->id,
            'price_per_hour' => 10000,
        ])->assertUnprocessable()->assertJsonValidationErrors('sport_id');

        $this->postJson('/api/v1/owner/venues/'.$venue->id.'/courts', [
            'name' => 'Court C',
            'sport_id' => $sport->id,
            'price_per_hour' => 0,
        ])->assertUnprocessable()->assertJsonValidationErrors('price_per_hour');
    }

    public function test_owner_can_replace_court_image_and_soft_delete(): void
    {
        $owner = $this->makeOwner('owner@mail.test');
        $this->loginAs($owner);
        $sport = $this->makeSport();
        $venue = Venue::factory()->create(['owner_id' => $owner->id]);
        $court = Court::factory()->create([
            'venue_id' => $venue->id,
            'sport_id' => $sport->id,
        ]);

        $this->post('/api/v1/owner/courts/'.$court->id.'/image', [
            'image' => $this->pngUpload('court.png'),
        ])->assertOk();

        $this->assertNotNull($court->fresh()->image_path);

        $this->patchJson('/api/v1/owner/courts/'.$court->id.'/toggle-active')
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->deleteJson('/api/v1/owner/courts/'.$court->id)->assertNoContent();
        $this->assertSoftDeleted('courts', ['id' => $court->id]);
    }

    public function test_active_sports_are_public_and_inactive_are_hidden(): void
    {
        Sport::factory()->create(['name' => 'Futsal', 'slug' => 'futsal-uji', 'is_active' => true]);
        Sport::factory()->inactive()->create(['name' => 'Lama', 'slug' => 'lama-uji']);

        $this->getJson('/api/v1/sports')
            ->assertOk()
            ->assertJsonFragment(['slug' => 'futsal-uji'])
            ->assertJsonMissing(['slug' => 'lama-uji']);
    }
}
