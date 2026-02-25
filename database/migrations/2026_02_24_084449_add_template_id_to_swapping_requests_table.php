<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTemplateIdToSwappingRequestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('swapping_request', function (Blueprint $table) {
            // Add templates_id column - nullable, no foreign key constraint for now
            $table->integer('templates_id')->nullable()->after('approved_by');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Changed 'swapping_requests' to 'swapping_request' to match the up() method
        Schema::table('swapping_request', function (Blueprint $table) {
            $table->dropForeign(['templates_id']);
            $table->dropColumn('templates_id');
        });
    }
}