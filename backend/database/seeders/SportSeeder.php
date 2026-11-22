<?php

namespace Database\Seeders;

use App\Models\Sport;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

// Kategori awal. Admin menambah atau menonaktifkan dari halaman olahraga.
class SportSeeder extends Seeder
{
    public function run(): void
    {
        $names = ['Badminton', 'Futsal', 'Basket', 'Tenis', 'Padel'];

        foreach ($names as $name) {
            Sport::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'is_active' => true],
            );
        }
    }
}
