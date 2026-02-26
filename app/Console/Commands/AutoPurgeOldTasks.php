<?php

namespace App\Console\Commands;

use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AutoPurgeOldTasks extends Command
{
    protected $signature = 'tasks:purge-old';

    protected $description = 'Automatically delete tasks older than 6 months.';

    public function handle(): int
    {
        $cutoffDate = Carbon::now()->subMonths(6);

        $deletedCount = Schedule::where('task_date', '<', $cutoffDate->toDateString())
            ->delete();

        $this->info("Deleted {$deletedCount} task(s) older than 6 months.");

        return Command::SUCCESS;
    }
}
