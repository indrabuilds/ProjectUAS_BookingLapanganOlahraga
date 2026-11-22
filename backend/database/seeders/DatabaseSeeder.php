<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // DemoDataSeeder sudah memanggil kategori olahraga. Admin tetap lewat app:create-admin.
        $this->call(DemoDataSeeder::class);
    }
}
