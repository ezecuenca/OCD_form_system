<?php

namespace App\Console\Commands;

use App\Models\AdrForm;
use App\Models\DataRetentionSetting;
use App\Models\SwappingRequest;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoPurgeArchivedData extends Command
{
    protected $signature = 'data-retention:purge-archived';

    protected $description = 'Permanently delete archived ADR forms and swapping requests beyond the configured purge period.';

    public function handle(): int
    {
        $settings = DataRetentionSetting::first();
        if (!$settings || !$settings->purge_enabled) {
            $this->info('Auto-purge is disabled or not configured.');
            return Command::SUCCESS;
        }

        $cutoffDate = $this->calculateCutoffDate(
            (int) $settings->purge_after_value,
            (string) $settings->purge_after_unit
        );

        $archivedAdrForms = AdrForm::where('is_archived', true)
            ->where(function ($query) use ($cutoffDate) {
                $query->where('archived_at', '<', $cutoffDate)
                    ->orWhere(function ($inner) use ($cutoffDate) {
                        $inner->whereNull('archived_at')
                            ->where('created_at', '<', $cutoffDate);
                    });
            })
            ->get();

        $adrCount = $archivedAdrForms->count();

        $swapDeleted = SwappingRequest::where('is_archived', true)
            ->where(function ($query) use ($cutoffDate) {
                $query->where('archived_at', '<', $cutoffDate)
                    ->orWhere(function ($inner) use ($cutoffDate) {
                        $inner->whereNull('archived_at')
                            ->where('created_at', '<', $cutoffDate);
                    });
            })
            ->delete();

        if ($adrCount > 0) {
            DB::transaction(function () use ($archivedAdrForms) {
                foreach ($archivedAdrForms as $form) {
                    $form->advisories()->delete();
                    $form->attendance()->delete();
                    $form->communications()->delete();
                    $form->concerns()->delete();
                    $form->endorsed()->delete();
                    $form->otherItems()->delete();
                    $form->delete();
                }
            });
        }

        $this->info("Deleted {$adrCount} archived ADR form(s) and {$swapDeleted} swapping request(s).");

        return Command::SUCCESS;
    }

    private function calculateCutoffDate(int $retentionValue, string $retentionUnit): Carbon
    {
        $cutoff = Carbon::now();

        switch ($retentionUnit) {
            case 'days':
                $cutoff->subDays($retentionValue);
                break;
            case 'months':
                $cutoff->subMonths($retentionValue);
                break;
            case 'years':
                $cutoff->subYears($retentionValue);
                break;
            default:
                $cutoff->subDays($retentionValue);
        }

        return $cutoff;
    }
}
