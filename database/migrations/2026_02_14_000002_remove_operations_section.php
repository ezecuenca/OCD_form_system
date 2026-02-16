<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class RemoveOperationsSection extends Migration
{
    /**
     * Run the migrations.
     * Removes the "Operations" section so you can retry adding sections.
     *
     * @return void
     */
    public function up()
    {
        DB::table('section')->where('name', 'Operations')->delete();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Optionally re-insert; we don't know the original id/created_at
    }
}
