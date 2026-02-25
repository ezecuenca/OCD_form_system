<?php

namespace App\Http\Controllers;

use App\Models\AdrForm;
use App\Models\DataRetentionSetting;
use App\Models\SwappingRequest;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SettingsController extends Controller
{
    /**
     * Preview how many ADR forms and Swapping Requests would be archived.
     */
    public function previewRetention(Request $request)
    {
        $request->validate([
            'retention_value' => 'required|integer|min:1',
            'retention_unit' => 'required|in:days,months,years',
        ]);

        $cutoffDate = $this->calculateCutoffDate(
            (int) $request->retention_value,
            (string) $request->retention_unit
        );

        // Count ADR forms older than cutoff date (that are not already archived)
        $adrCount = AdrForm::where(function ($query) {
            $query->whereNull('is_archived')->orWhere('is_archived', false);
        })
            ->where('created_at', '<', $cutoffDate)
            ->count();

        // Count Swapping Requests older than cutoff date (that are not already archived)
        $swapCount = SwappingRequest::where(function ($query) {
            $query->whereNull('is_archived')->orWhere('is_archived', false);
        })
            ->where('created_at', '<', $cutoffDate)
            ->count();

        return response()->json([
            'message' => 'Preview completed successfully.',
            'adr_to_archive' => $adrCount,
            'swap_to_archive' => $swapCount,
            'cutoff_date' => $cutoffDate->toIso8601String(),
        ]);
    }

    /**
     * Archive ADR forms and Swapping Requests beyond the retention period.
     */
    public function autoArchive(Request $request)
    {
        $request->validate([
            'retention_value' => 'sometimes|integer|min:1',
            'retention_unit' => 'sometimes|in:days,months,years',
        ]);

        $settings = $this->getOrCreateRetentionSettings();
        if (!$settings->enabled) {
            return response()->json([
                'message' => 'Auto-archive is disabled.',
                'adr_archived' => 0,
                'swap_archived' => 0,
                'skipped' => true,
            ]);
        }

        $retentionValue = $request->retention_value ?? $settings->retention_value;
        $retentionUnit = $request->retention_unit ?? $settings->retention_unit;
        $cutoffDate = $this->calculateCutoffDate((int) $retentionValue, (string) $retentionUnit);
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

        return response()->json([
            'message' => 'Auto-archive completed successfully.',
            'adr_archived' => $adrArchived,
            'swap_archived' => $swapArchived,
            'cutoff_date' => $cutoffDate->toIso8601String(),
        ]);
    }

    /**
     * Get current data retention settings.
     */
    public function getRetentionSettings()
    {
        $settings = $this->getOrCreateRetentionSettings();

        return response()->json([
            'enabled' => (bool) $settings->enabled,
            'retention_value' => (int) $settings->retention_value,
            'retention_unit' => $settings->retention_unit,
            'purge_enabled' => (bool) $settings->purge_enabled,
            'purge_after_value' => (int) $settings->purge_after_value,
            'purge_after_unit' => $settings->purge_after_unit,
        ]);
    }

    /**
     * Update data retention settings.
     */
    public function updateRetentionSettings(Request $request)
    {
        $request->validate([
            'enabled' => 'required|boolean',
            'retention_value' => 'required|integer|min:1',
            'retention_unit' => 'required|in:days,months,years',
            'purge_enabled' => 'required|boolean',
            'purge_after_value' => 'required|integer|min:1',
            'purge_after_unit' => 'required|in:days,months,years',
        ]);

        $settings = $this->getOrCreateRetentionSettings();
        $settings->enabled = (bool) $request->enabled;
        $settings->retention_value = (int) $request->retention_value;
        $settings->retention_unit = (string) $request->retention_unit;
        $settings->purge_enabled = (bool) $request->purge_enabled;
        $settings->purge_after_value = (int) $request->purge_after_value;
        $settings->purge_after_unit = (string) $request->purge_after_unit;
        $settings->save();

        return response()->json([
            'message' => 'Retention settings updated successfully.',
            'enabled' => (bool) $settings->enabled,
            'retention_value' => (int) $settings->retention_value,
            'retention_unit' => $settings->retention_unit,
            'purge_enabled' => (bool) $settings->purge_enabled,
            'purge_after_value' => (int) $settings->purge_after_value,
            'purge_after_unit' => $settings->purge_after_unit,
        ]);
    }

    /**
     * Get the oldest active records to calculate days until archive.
     */
    public function getDaysUntilArchive(Request $request)
    {
        $request->validate([
            'retention_value' => 'required|integer|min:1',
            'retention_unit' => 'required|in:days,months,years',
        ]);

        $retentionValue = $request->retention_value;
        $retentionUnit = $request->retention_unit;

        // Convert retention period to days for unified display
        $retentionInDays = 0;
        switch ($retentionUnit) {
            case 'days':
                $retentionInDays = $retentionValue;
                break;
            case 'months':
                $retentionInDays = $retentionValue * 30;
                break;
            case 'years':
                $retentionInDays = $retentionValue * 365;
                break;
        }

        // Calculate hours and minutes if within the same day
        $hoursLeft = null;
        $minutesLeft = null;
        
        if ($retentionInDays < 1) {
            // Less than 1 day - show hours and minutes
            $hoursLeft = (int)($retentionInDays * 24);
            $minutesLeft = (int)(($retentionInDays * 24 * 60) % 60);
        } elseif ($retentionInDays < 30) {
            // Less than 30 days - calculate if within same day
            $totalHours = $retentionInDays * 24;
            if ($totalHours < 24) {
                $hoursLeft = (int)$totalHours;
                $minutesLeft = (int)(($totalHours * 60) % 60);
            }
        }

        // Get the oldest active ADR form to calculate actual days until oldest form exceeds retention
        $oldestAdr = AdrForm::where('is_archived', false)
            ->orderBy('created_at', 'asc')
            ->first();

        // Get the oldest active swapping request
        $oldestSwap = SwappingRequest::where('is_archived', false)
            ->orderBy('created_at', 'asc')
            ->first();

        // Calculate days until oldest forms exceed retention period (for preview)
        $daysUntilAdrArchive = null;
        $daysUntilSwapArchive = null;

        if ($oldestAdr) {
            $daysUntilAdrArchive = Carbon::now()->diffInDays($oldestAdr->created_at->addDays($retentionInDays), false);
        }

        if ($oldestSwap) {
            $daysUntilSwapArchive = Carbon::now()->diffInDays($oldestSwap->created_at->addDays($retentionInDays), false);
        }

        return response()->json([
            'retention_in_days' => $retentionInDays,
            'retention_value' => $retentionValue,
            'retention_unit' => $retentionUnit,
            'hours_left' => $hoursLeft,
            'minutes_left' => $minutesLeft,
            'days_until_adr_archive' => $daysUntilAdrArchive,
            'days_until_swap_archive' => $daysUntilSwapArchive,
            'oldest_adr_date' => $oldestAdr ? $oldestAdr->created_at->toIso8601String() : null,
            'oldest_swap_date' => $oldestSwap ? $oldestSwap->created_at->toIso8601String() : null,
        ]);
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

    private function getOrCreateRetentionSettings(): DataRetentionSetting
    {
        $settings = DataRetentionSetting::first();
        if ($settings) {
            return $settings;
        }

        return DataRetentionSetting::create([
            'enabled' => true,
            'retention_value' => 30,
            'retention_unit' => 'days',
            'purge_enabled' => false,
            'purge_after_value' => 30,
            'purge_after_unit' => 'days',
        ]);
    }
}
