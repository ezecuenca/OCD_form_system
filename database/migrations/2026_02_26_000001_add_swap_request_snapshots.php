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
        Schema::table('swapping_request', function (Blueprint $table) {
            $table->string('requester_name_snapshot')->nullable()->after('requester_profile_id');
            $table->string('requester_task_description_snapshot')->nullable()->after('requester_name_snapshot');
            $table->date('requester_task_date_snapshot')->nullable()->after('requester_task_description_snapshot');
            $table->string('target_name_snapshot')->nullable()->after('target_schedule_id');
            $table->string('target_task_description_snapshot')->nullable()->after('target_name_snapshot');
            $table->date('target_task_date_snapshot')->nullable()->after('target_task_description_snapshot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('swapping_request', function (Blueprint $table) {
            $table->dropColumn([
                'requester_name_snapshot',
                'requester_task_description_snapshot',
                'requester_task_date_snapshot',
                'target_name_snapshot',
                'target_task_description_snapshot',
                'target_task_date_snapshot',
            ]);
        });
    }
};
