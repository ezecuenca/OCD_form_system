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

        return [
            'id' => $schedule->id,
            'profile_id' => $schedule->profile_id,
            'profile_name' => $profileName,
            'task_description' => $schedule->task_description,
            'task_date' => $schedule->task_date?->format('Y-m-d'),
            'status' => $schedule->status,
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
