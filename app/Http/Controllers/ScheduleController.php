<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    protected function canManageSchedules(Request $request): bool
    {
        $user = $request->user();
        if (!$user) {
            return false;
        }
        return in_array($user->role_id, [2, 3], true);
    }

    protected function formatSchedule(Schedule $schedule): array
    {
        $profile = $schedule->profile;
        $profileName = $profile?->full_name;
        if (!$profileName && $profile?->user) {
            $profileName = $profile->user->username;
        }

        $swapInfo = null;
        if ($schedule->status === 'swap') {
            // Find the swap request related to this schedule
            $swapRequest = \App\Models\SwappingRequest::where('status', 'approved')
                ->where(function ($query) use ($schedule) {
                    $query->where('requester_schedule_id', $schedule->id)
                          ->orWhere('target_schedule_id', $schedule->id);
                })
                ->with(['requesterSchedule.profile', 'targetSchedule.profile'])
                ->first();

            if ($swapRequest) {
                $isRequester = $swapRequest->requester_schedule_id === $schedule->id;
                $targetSchedule = $swapRequest->targetSchedule;

                $originalRequesterDate = $swapRequest->original_requester_date?->format('Y-m-d');
                $originalTargetDate = $swapRequest->original_target_date?->format('Y-m-d');

                // Determine original and new dates using stored originals
                if ($isRequester) {
                    $originalDate = $originalRequesterDate;
                    $newDate = $targetSchedule ? $originalTargetDate : $swapRequest->target_date?->format('Y-m-d');
                } else {
                    $originalDate = $originalTargetDate;
                    $newDate = $originalRequesterDate;
                }

                $swapInfo = [
                    'has_target_person' => $targetSchedule !== null,
                    'original_date' => $originalDate,
                    'new_date' => $newDate,
                ];

                // Only include swapped_with if there's a target person
                if ($targetSchedule) {
                    $otherSchedule = $isRequester ? $targetSchedule : $swapRequest->requesterSchedule;
                    $otherProfile = $otherSchedule?->profile;
                    $otherName = $otherProfile?->full_name ?? $otherProfile?->user?->username ?? 'Unknown';
                    $swapInfo['swapped_with'] = $otherName;
                }
            }
        }

        return [
            'id' => $schedule->id,
            'profile_id' => $schedule->profile_id,
            'profile_name' => $profileName,
            'task_description' => $schedule->task_description,
            'task_date' => $schedule->task_date?->format('Y-m-d'),
            'status' => $schedule->status,
            'swap_info' => $swapInfo,
            'created_at' => $schedule->created_at?->toIso8601String(),
            'updated_at' => $schedule->updated_at?->toIso8601String(),
        ];
    }

    /**
     * List all schedules.
     */
    public function index()
    {
        $schedules = Schedule::with(['profile.user'])
            ->where(function ($builder) {
                $builder->whereNull('status')->orWhere('status', '!=', 'placeholder');
            })
            ->orderBy('task_date')
            ->orderBy('id')
            ->get();

        return response()->json($schedules->map(function (Schedule $schedule) {
            return $this->formatSchedule($schedule);
        }));
    }

    /**
     * Create a new schedule.
     */
    public function store(Request $request)
    {
        if (!$this->canManageSchedules($request)) {
            return response()->json(['message' => 'Not authorized.'], 403);
        }

        $validated = $request->validate([
            'profile_id' => ['required', 'integer', 'exists:profile,id'],
            'task_description' => ['required', 'string'],
            'task_date' => ['required', 'date'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        $schedule = Schedule::create([
            'profile_id' => $validated['profile_id'],
            'task_description' => $validated['task_description'],
            'task_date' => $validated['task_date'],
            'status' => $validated['status'] ?? 'active',
        ])->fresh(['profile.user']);

        return response()->json($this->formatSchedule($schedule), 201);
    }

    /**
     * Update an existing schedule.
     */
    public function update(Request $request, $id)
    {
        if (!$this->canManageSchedules($request)) {
            return response()->json(['message' => 'Not authorized.'], 403);
        }

        $schedule = Schedule::with(['profile.user'])->find($id);
        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found.'], 404);
        }

        $validated = $request->validate([
            'profile_id' => ['sometimes', 'integer', 'exists:profile,id'],
            'task_description' => ['sometimes', 'string'],
            'task_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'string', 'max:50'],
        ]);

        if (!empty($validated)) {
            $schedule->update($validated);
        }

        return response()->json($this->formatSchedule($schedule->fresh(['profile.user'])));
    }

    /**
     * Delete a schedule.
     */
    public function destroy(Request $request, $id)
    {
        if (!$this->canManageSchedules($request)) {
            return response()->json(['message' => 'Not authorized.'], 403);
        }

        $schedule = Schedule::find($id);
        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found.'], 404);
        }

        $schedule->delete();
        return response()->json(['message' => 'Deleted.'], 200);
    }
}
