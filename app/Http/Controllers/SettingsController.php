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
}
