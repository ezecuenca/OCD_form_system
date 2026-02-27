<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class ChangeAttendanceTaskColumnToText extends Migration
{
    /**
     * Run the migrations.
     * Change task to TEXT so long content (e.g. multiline task descriptions) can be stored.
     *
     * @return void
     */
    public function up()
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE attendance MODIFY task TEXT NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE attendance ALTER COLUMN task TYPE TEXT');
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE attendance MODIFY task VARCHAR(255) NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE attendance ALTER COLUMN task TYPE VARCHAR(255)');
        }
    }
}
