<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class BackfillTemplateTypes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::table('templates')
            ->whereNull('type')
            ->orWhere('type', '')
            ->update([
                'type' => DB::raw("CASE WHEN LOWER(template_name) LIKE '%swap%' THEN 'swap' ELSE 'adr' END"),
            ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::table('templates')->update(['type' => null]);
    }
}
