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
        Schema::create('data_retention_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(true);
            $table->unsignedInteger('retention_value')->default(30);
            $table->string('retention_unit', 10)->default('days');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_retention_settings');
    }
};
