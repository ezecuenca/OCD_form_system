<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all constraints on the swapping_request table for schedule references
        $constraints = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'swapping_request' 
            AND COLUMN_NAME IN ('requester_schedule_id', 'target_schedule_id')
            AND REFERENCED_TABLE_NAME = 'schedule'
            AND TABLE_SCHEMA = DATABASE()
        ");

        // Drop existing foreign keys
        foreach ($constraints as $constraint) {
            try {
                DB::statement("ALTER TABLE swapping_request DROP FOREIGN KEY {$constraint->CONSTRAINT_NAME}");
            } catch (\Exception $e) {
                // Constraint might not exist, continue
            }
        }

        // Add new foreign keys with SET NULL on delete
        try {
            DB::statement("
                ALTER TABLE swapping_request 
                ADD CONSTRAINT swapping_request_requester_schedule_id_foreign 
                FOREIGN KEY (requester_schedule_id) 
                REFERENCES schedule(id) 
                ON DELETE SET NULL
            ");
        } catch (\Exception $e) {
            // Foreign key might already exist
        }

        try {
            DB::statement("
                ALTER TABLE swapping_request 
                ADD CONSTRAINT swapping_request_target_schedule_id_foreign 
                FOREIGN KEY (target_schedule_id) 
                REFERENCES schedule(id) 
                ON DELETE SET NULL
            ");
        } catch (\Exception $e) {
            // Foreign key might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the new foreign keys
        try {
            DB::statement("ALTER TABLE swapping_request DROP FOREIGN KEY swapping_request_requester_schedule_id_foreign");
        } catch (\Exception $e) {
            // Key might not exist
        }

        try {
            DB::statement("ALTER TABLE swapping_request DROP FOREIGN KEY swapping_request_target_schedule_id_foreign");
        } catch (\Exception $e) {
            // Key might not exist
        }
    }
};
