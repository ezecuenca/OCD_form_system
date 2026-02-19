<?php

namespace App\Console\Commands;

use App\Models\AdrForm;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ClearArchivedAdrForms extends Command
{
    protected $signature = 'adr:clear-archived';

    protected $description = 'Delete all archived ADR forms and their related data (start fresh).';

    public function handle(): int
    {
        $archived = AdrForm::where('is_archived', true)->get();
        $count = $archived->count();

        if ($count === 0) {
            $this->info('No archived ADR forms to delete.');
            return self::SUCCESS;
        }

        $this->info("Deleting {$count} archived ADR form(s) and related data...");

        DB::transaction(function () use ($archived) {
            foreach ($archived as $form) {
                $form->advisories()->delete();
                $form->attendance()->delete();
                $form->communications()->delete();
                $form->concerns()->delete();
                $form->endorsed()->delete();
                $form->otherItems()->delete();
                $form->delete();
            }
        });

        $this->info('Done. Archived ADR data cleared.');
        return self::SUCCESS;
    }
}
