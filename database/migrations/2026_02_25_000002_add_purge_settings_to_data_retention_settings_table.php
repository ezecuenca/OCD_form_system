<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('data_retention_settings', function (Blueprint $table) {
            $table->boolean('purge_enabled')->default(false)->after('retention_unit');
            $table->unsignedInteger('purge_after_value')->default(30)->after('purge_enabled');
            $table->string('purge_after_unit', 10)->default('days')->after('purge_after_value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data_retention_settings', function (Blueprint $table) {
            $table->dropColumn(['purge_enabled', 'purge_after_value', 'purge_after_unit']);
        });
    }
};
