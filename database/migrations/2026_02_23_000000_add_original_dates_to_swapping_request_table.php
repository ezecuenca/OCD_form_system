<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('swapping_request', function (Blueprint $table) {
            $table->date('original_requester_date')->nullable()->after('target_date');
            $table->date('original_target_date')->nullable()->after('original_requester_date');
        });
    }

    public function down(): void
    {
        Schema::table('swapping_request', function (Blueprint $table) {
            $table->dropColumn(['original_requester_date', 'original_target_date']);
        });
    }
};
