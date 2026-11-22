<?php

namespace Tests\Feature\Venue;

use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\MakesVenueContext;
use Tests\TestCase;

class VenueImageTest extends TestCase
{
    use MakesVenueContext;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpVenueContext();
        Storage::fake('public');
    }

    public function test_owner_can_upload_and_delete_an_image(): void
    {
        $owner = $this->makeOwner('owner@mail.test');
        $venue = Venue::factory()->create(['owner_id' => $owner->id]);
        $this->loginAs($owner);

        $created = $this->post('/api/v1/owner/venues/'.$venue->id.'/images', [
            'image' => $this->pngUpload(),
        ])->assertCreated()
            ->assertJsonPath('data.sort_order', 0);

        $stored = $venue->images()->first();
        $this->assertNotNull($stored);
        Storage::disk('public')->assertExists($stored->path);

        $this->deleteJson('/api/v1/owner/venues/'.$venue->id.'/images/'.$created->json('data.id'))
            ->assertNoContent();

        $this->assertSame(0, $venue->images()->count());
    }

    public function test_other_owner_cannot_upload_to_a_foreign_venue(): void
    {
        $ownerA = $this->makeOwner('a@mail.test');
        $ownerB = $this->makeOwner('b@mail.test');
        $venue = Venue::factory()->create(['owner_id' => $ownerA->id]);
        $this->loginAs($ownerB);

        $this->post('/api/v1/owner/venues/'.$venue->id.'/images', [
            'image' => $this->pngUpload(),
        ])->assertNotFound();

        $this->assertSame(0, $venue->images()->count());
    }

    public function test_svg_oversized_and_too_many_images_are_rejected(): void
    {
        $owner = $this->makeOwner('owner@mail.test');
        $venue = Venue::factory()->create(['owner_id' => $owner->id]);
        $this->loginAs($owner);

        $svg = tempnam(sys_get_temp_dir(), 'svg');
        file_put_contents($svg, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');

        $this->post('/api/v1/owner/venues/'.$venue->id.'/images', [
            'image' => new UploadedFile($svg, 'ikon.svg', 'image/svg+xml', null, true),
        ])->assertUnprocessable()->assertJsonValidationErrors('image');

        $this->post('/api/v1/owner/venues/'.$venue->id.'/images', [
            'image' => $this->pngUpload('lebar.png', 4001, 10),
        ])->assertUnprocessable()->assertJsonValidationErrors('image');

        $this->post('/api/v1/owner/venues/'.$venue->id.'/images', [
            'image' => $this->pngUpload('besar.png', 1, 1, 2100 * 1024),
        ])->assertUnprocessable()->assertJsonValidationErrors('image');

        for ($i = 0; $i < 5; $i++) {
            $this->post('/api/v1/owner/venues/'.$venue->id.'/images', [
                'image' => $this->pngUpload('ok-'.$i.'.png'),
            ])->assertCreated();
        }

        $this->post('/api/v1/owner/venues/'.$venue->id.'/images', [
            'image' => $this->pngUpload('lebih.png'),
        ])->assertUnprocessable()->assertJsonPath('code', 'VENUE_IMAGE_LIMIT');

        $this->assertSame(5, $venue->images()->count());
    }
}
