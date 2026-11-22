<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const FORK_MIGRATION = '2026_11_21_000001_add_auth_columns_to_users_table';

    public function up(): void
    {
        if ($this->usesForkMigration() && Schema::hasColumns('users', ['role', 'status', 'phone'])) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('email');
            $table->enum('role', ['customer', 'owner', 'admin'])->default('customer')->after('password');
            $table->enum('status', ['active', 'suspended'])->default('active')->after('role');

            $table->index(['role', 'status']);
        });
    }

    public function down(): void
    {
        if ($this->usesForkMigration()) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role', 'status']);
            $table->dropColumn(['phone', 'role', 'status']);
        });
    }
    private function usesForkMigration(): bool
    {
        return DB::table('migrations')->where('migration', self::FORK_MIGRATION)->exists();
    }
};
