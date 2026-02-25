<?php

namespace App\Console\Commands;

use App\Models\AdrForm;
use App\Models\DataRetentionSetting;
use App\Models\SwappingRequest;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AutoArchiveDataRetention extends Command
{
    protected $signature = 'data-retention:auto-archive';

    protected $description = 'Archive ADR forms and swapping requests beyond the configured retention period.';

    public function handle(): int
    {
        $settings = DataRetentionSetting::first();
        if (!$settings || !$settings->enabled) {
            $this->info('Auto-archive is disabled or not configured.');
            return Command::SUCCESS;
        }

        $cutoffDate = $this->calculateCutoffDate(
            (int) $settings->retention_value,
            (string) $settings->retention_unit
        );

        $archivedAt = Carbon::now();

        $adrArchived = AdrForm::where(function ($query) {
            $query->whereNull('is_archived')->orWhere('is_archived', false);
        })
            ->where('created_at', '<', $cutoffDate)
            ->update([
                'is_archived' => true,
                'archived_at' => $archivedAt,
            ]);

        $swapArchived = SwappingRequest::where(function ($query) {
            $query->whereNull('is_archived')->orWhere('is_archived', false);
        })
            ->where('created_at', '<', $cutoffDate)
            ->update([
                'is_archived' => true,
                'archived_at' => $archivedAt,
            ]);

        $this->info("Archived {$adrArchived} ADR form(s) and {$swapArchived} swapping request(s).");

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
