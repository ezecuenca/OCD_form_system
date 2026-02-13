<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFormDataToAdrFormTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('adr_form')) {
            return;
        }
        if (Schema::hasColumn('adr_form', 'form_data')) {
            return;
        }
        Schema::table('adr_form', function (Blueprint $table) {
            $table->json('form_data')->nullable()->after('templates_id');
        });
    }

    public function down()
    {
        if (!Schema::hasTable('adr_form')) {
            return;
        }
        if (Schema::hasColumn('adr_form', 'form_data')) {
            Schema::table('adr_form', function (Blueprint $table) {
                $table->dropColumn('form_data');
            });
        }
    }
}
