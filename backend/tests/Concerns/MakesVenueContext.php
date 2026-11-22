<?php

namespace Tests\Concerns;

use App\Models\Sport;
use App\Models\User;
use Illuminate\Http\UploadedFile;

trait MakesVenueContext
{
    use InteractsWithSpa;

    protected function setUpVenueContext(): void
    {
        $this->setUpSpa();
        $this->withHeader('Accept', 'application/json');
    }

    protected function loginAs(User $user): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Rahasia12',
        ])->assertOk();

        $this->carryCookies($response);
    }

    protected function makeOwner(string $email): User
    {
        return User::factory()->owner()->create([
            'email' => $email,
            'password' => 'Rahasia12',
        ]);
    }

    protected function makeAdmin(string $email): User
    {
        return User::factory()->admin()->create([
            'email' => $email,
            'password' => 'Rahasia12',
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    protected function venuePayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'GOR Sehat Jaya',
            'description' => 'Lapangan indoor untuk badminton dan futsal.',
            'address' => 'Jl. Melati 1',
            'city' => 'Bandung',
            'province' => 'Jawa Barat',
            'phone' => '081234567890',
            'timezone' => 'Asia/Jakarta',
            'facilities' => ['parking', 'toilet'],
        ], $overrides);
    }

    protected function makeSport(): Sport
    {
        return Sport::factory()->create([
            'name' => 'Badminton',
            'slug' => 'badminton-'.fake()->unique()->numerify('###'),
        ]);
    }

    protected function pngUpload(string $name = 'lapangan.png', int $width = 1, int $height = 1, int $extraBytes = 0): UploadedFile
    {
        $bytes = $width === 1 && $height === 1
            ? base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
            : $this->pngWithSize($width, $height);

        if ($extraBytes > 0) {
            $bytes .= str_repeat('A', $extraBytes);
        }

        $path = tempnam(sys_get_temp_dir(), 'img');
        file_put_contents($path, $bytes);

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    private function pngWithSize(int $width, int $height): string
    {
        $chunk = function (string $type, string $data): string {
            return pack('N', strlen($data)).$type.$data.pack('N', crc32($type.$data));
        };

        $ihdr = pack('NNCCCCC', $width, $height, 8, 2, 0, 0, 0);

        return "\x89PNG\r\n\x1a\n".$chunk('IHDR', $ihdr).$chunk('IEND', '');
    }
}
