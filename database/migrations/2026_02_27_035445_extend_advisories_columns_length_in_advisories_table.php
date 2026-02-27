<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class ExtendAdvisoriesColumnsLengthInAdvisoriesTable extends Migration
{
    /**
     * Run the migrations.
     * Change advisories and remarks to TEXT so long content (e.g. multiline) can be stored.
     *
     * @return void
     */
    public function up()
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE advisories MODIFY advisories TEXT NULL, MODIFY remarks TEXT NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE advisories ALTER COLUMN advisories TYPE TEXT, ALTER COLUMN remarks TYPE TEXT');
        } else {
            // SQLite: TEXT is default, no change needed for length
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
            DB::statement('ALTER TABLE advisories MODIFY advisories VARCHAR(255) NULL, MODIFY remarks VARCHAR(255) NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE advisories ALTER COLUMN advisories TYPE VARCHAR(255), ALTER COLUMN remarks TYPE VARCHAR(255)');
        }
    }
}
