<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Venue milik owner. Status verifikasi hanya boleh diubah admin.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('venues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->restrictOnDelete();
            $table->string('name', 150);
            $table->string('slug', 180)->unique();
            $table->text('description');
            $table->string('address');
            $table->string('city', 100);
            $table->string('province', 100);
            $table->string('phone', 20);
            $table->string('timezone', 40)->default('Asia/Jakarta');
            $table->json('facilities')->nullable();
            $table->enum('status', ['pending_verification', 'approved', 'rejected', 'suspended'])
                ->default('pending_verification');
            $table->string('status_reason', 500)->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'is_active']);
            $table->index('city');
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('venues');
    }
};
