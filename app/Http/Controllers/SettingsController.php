<?php

namespace App\Http\Controllers;

use App\Models\AdrForm;
use App\Models\SwappingRequest;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SettingsController extends Controller
{
    /**
     * Preview how many ADR forms and Swapping Requests would be archived based on cutoff date.
     */
    public function autoArchive(Request $request)
    {
        $request->validate([
            'cutoff_date' => 'required|date',
        ]);

        $cutoffDate = Carbon::parse($request->cutoff_date);

        // Count ADR forms older than cutoff date (that are not already archived)
        $adrCount = AdrForm::where('is_archived', false)
            ->where('created_at', '<', $cutoffDate)
            ->count();

        // Count Swapping Requests older than cutoff date (that are not already archived)
        $swapCount = SwappingRequest::where('is_archived', false)
            ->where('created_at', '<', $cutoffDate)
            ->count();

        return response()->json([
            'message' => 'Preview completed successfully.',
            'adr_to_archive' => $adrCount,
            'swap_to_archive' => $swapCount,
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

        // Calculate the date when records will be archived
        $archiveDate = Carbon::now();
        switch ($retentionUnit) {
            case 'days':
                $archiveDate->addDays($retentionValue);
                break;
            case 'months':
                $archiveDate->addMonths($retentionValue);
                break;
            case 'years':
                $archiveDate->addYears($retentionValue);
                break;
        }

        // Get the oldest active ADR form
        $oldestAdr = AdrForm::where('is_archived', false)
            ->orderBy('created_at', 'asc')
            ->first();

        // Get the oldest active swapping request
        $oldestSwap = SwappingRequest::where('is_archived', false)
            ->orderBy('created_at', 'asc')
            ->first();

        $daysUntilAdrArchive = null;
        $daysUntilSwapArchive = null;

        if ($oldestAdr) {
            $daysUntilAdrArchive = Carbon::now()->diffInDays($oldestAdr->created_at->addDays(
                $retentionUnit === 'days' ? $retentionValue :
                ($retentionUnit === 'months' ? $retentionValue * 30 : $retentionValue * 365)
            ), false);
        }

        if ($oldestSwap) {
            $daysUntilSwapArchive = Carbon::now()->diffInDays($oldestSwap->created_at->addDays(
                $retentionUnit === 'days' ? $retentionValue :
                ($retentionUnit === 'months' ? $retentionValue * 30 : $retentionValue * 365)
            ), false);
        }

        return response()->json([
            'days_until_adr_archive' => $daysUntilAdrArchive,
            'days_until_swap_archive' => $daysUntilSwapArchive,
            'oldest_adr_date' => $oldestAdr ? $oldestAdr->created_at->toIso8601String() : null,
            'oldest_swap_date' => $oldestSwap ? $oldestSwap->created_at->toIso8601String() : null,
        ]);
    }
}
