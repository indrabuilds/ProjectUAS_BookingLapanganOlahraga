<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabel ini dipakai availability agar slot booked bisa dihitung.
// Alur buat dan setujui booking menyusul di fase berikutnya.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('court_id')->constrained()->restrictOnDelete();
            $table->dateTime('start_at');
            $table->dateTime('end_at');
            $table->decimal('price_per_hour', 12, 2);
            $table->decimal('total_price', 12, 2);
            $table->enum('status', ['pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'expired'])
                ->default('pending');
            $table->dateTime('expires_at')->nullable();
            $table->string('notes', 500)->nullable();
            $table->timestamps();

            $table->index(['court_id', 'start_at', 'end_at']);
            $table->index(['user_id', 'start_at']);
            $table->index(['status', 'expires_at']);
            $table->index(['status', 'end_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
