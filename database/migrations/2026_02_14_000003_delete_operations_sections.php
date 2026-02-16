<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class DeleteOperationsSections extends Migration
{
    /**
     * Run the migrations.
     * Permanently deletes all sections with "Operation" in the name so you can restart.
     *
     * @return void
     */
    public function up()
    {
        $operationIds = DB::table('section')->whereRaw('LOWER(name) LIKE ?', ['%operation%'])->pluck('id');
        if ($operationIds->isEmpty()) {
            return;
        }

        $otherSectionId = DB::table('section')->whereNotIn('id', $operationIds)->value('id');
        if ($otherSectionId === null) {
            $otherSectionId = DB::table('section')->insertGetId(['name' => 'Unassigned', 'is_archived' => 0]);
        }

        DB::table('profile')->whereIn('section_id', $operationIds)->update(['section_id' => $otherSectionId]);
        DB::table('section')->whereIn('id', $operationIds)->delete();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
