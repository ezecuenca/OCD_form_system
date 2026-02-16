<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class ClearSectionsAndAllowNullProfileSection extends Migration
{
    /**
     * Run the migrations.
     * Makes profile.section_id nullable, clears all profile section references,
     * then deletes all sections so the Departments table is empty.
     *
     * @return void
     */
    public function up()
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            try {
                DB::statement('ALTER TABLE profile DROP FOREIGN KEY profile_ibfk_2');
            } catch (\Throwable $e) {
                // Already dropped
            }
            try {
                DB::statement('ALTER TABLE profile MODIFY section_id BIGINT UNSIGNED NULL');
            } catch (\Throwable $e) {
                // Already nullable
            }
        }

        DB::table('profile')->update(['section_id' => null]);
        DB::table('section')->delete();
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
