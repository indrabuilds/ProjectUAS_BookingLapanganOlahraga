<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tujuh baris per venue (Senin-Minggu). Form ubah jam menyusul di fase berikutnya.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operating_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venue_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week');
            $table->boolean('is_closed')->default(false);
            $table->unsignedTinyInteger('open_hour')->nullable();
            $table->unsignedTinyInteger('close_hour')->nullable();
            $table->timestamps();

            $table->unique(['venue_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operating_hours');
    }
};
