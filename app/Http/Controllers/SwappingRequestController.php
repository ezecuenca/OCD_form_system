<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\Schedule;
use App\Models\SwappingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SwappingRequestController extends Controller
{
    protected function getProfileId(Request $request): ?int
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }
        return Profile::where('user_id', $user->id)->value('id');
    }

    protected function canManageRequests(Request $request): bool
    {
        $user = $request->user();
        if (!$user) {
            return false;
        }
        return in_array($user->role_id, [2, 3], true);
    }

    protected function formatRequest(SwappingRequest $request): array
    {
        $requesterSchedule = $request->requesterSchedule;
        $targetSchedule = $request->targetSchedule;

        $taskName = $requesterSchedule?->profile?->full_name;
        if (!$taskName && $requesterSchedule?->profile?->user) {
            $taskName = $requesterSchedule->profile->user->username;
        }

        $targetTaskName = $targetSchedule?->profile?->full_name;
        if (!$targetTaskName && $targetSchedule?->profile?->user) {
            $targetTaskName = $targetSchedule->profile->user->username;
        }

        $fromDate = $requesterSchedule?->task_date?->format('Y-m-d');
        $toDate = $targetSchedule?->task_date?->format('Y-m-d') ?? $request->target_date?->format('Y-m-d');

        if ($request->status === 'approved' && $requesterSchedule && $targetSchedule) {
            $fromDate = $targetSchedule->task_date?->format('Y-m-d');
            $toDate = $requesterSchedule->task_date?->format('Y-m-d');
        }

        return [
            'id' => $request->id,
            'requester_profile_id' => $request->requester_profile_id,
            'requester_schedule_id' => $request->requester_schedule_id,
            'target_schedule_id' => $request->target_schedule_id,
            'status' => $request->status,
            'is_archived' => (bool) $request->is_archived,
            'approved_by' => $request->approved_by,
            'createdAt' => $request->created_at?->toIso8601String(),
            'updatedAt' => $request->updated_at?->toIso8601String(),
            'archivedAt' => $request->archived_at?->toIso8601String(),
            'taskId' => $requesterSchedule?->id,
            'targetTaskId' => $targetSchedule?->id,
            'taskName' => $taskName,
            'taskDescription' => $requesterSchedule?->task_description,
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'targetTaskName' => $targetTaskName,
        ];
    }

    public function index(Request $request)
    {
        $query = SwappingRequest::with([
            'requesterSchedule.profile.user',
            'targetSchedule.profile.user',
        ])->orderByDesc('created_at');

        if ($request->query('include_archived') !== 'true') {
            $query->where(function ($builder) {
                $builder->whereNull('is_archived')->orWhere('is_archived', false);
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $requests = $query->get();

        return response()->json($requests->map(function (SwappingRequest $swapRequest) {
            return $this->formatRequest($swapRequest);
        }));
    }

    public function store(Request $request)
    {
        $profileId = $this->getProfileId($request);
        if ($profileId === null) {
            return response()->json(['message' => 'Profile not found.'], 422);
        }

        $validated = $request->validate([
            'requester_schedule_id' => ['required', 'integer', 'exists:schedule,id'],
            'target_schedule_id' => ['nullable', 'integer', 'exists:schedule,id'],
            'target_date' => ['nullable', 'date'],
        ]);

        if (empty($validated['target_schedule_id']) && empty($validated['target_date'])) {
            return response()->json(['message' => 'Target schedule or date is required.'], 422);
        }

        $requesterSchedule = Schedule::with('profile.user')->find($validated['requester_schedule_id']);
        if (!$requesterSchedule) {
            return response()->json(['message' => 'Schedule not found.'], 404);
        }

        if (!$this->canManageRequests($request) && $requesterSchedule->profile_id !== $profileId) {
            return response()->json(['message' => 'Not authorized to swap this schedule.'], 403);
        }

        if ($requesterSchedule->status === 'placeholder') {
            return response()->json(['message' => 'Cannot swap a placeholder schedule.'], 422);
        }

        $targetSchedule = null;
        if (!empty($validated['target_schedule_id'])) {
            if ((int) $validated['target_schedule_id'] === (int) $requesterSchedule->id) {
                return response()->json(['message' => 'Target schedule must be different.'], 422);
            }

            $targetSchedule = Schedule::find($validated['target_schedule_id']);
            if (!$targetSchedule) {
                return response()->json(['message' => 'Target schedule not found.'], 422);
            }
        }

        $swapRequest = SwappingRequest::create([
            'requester_profile_id' => $profileId,
            'requester_schedule_id' => $requesterSchedule->id,
            'target_schedule_id' => $targetSchedule?->id,
            'target_date' => $validated['target_date'] ?? null,
            'status' => 'pending',
            'approved_by' => null,
            'is_archived' => false,
        ]);

        $swapRequest->load(['requesterSchedule.profile.user', 'targetSchedule.profile.user']);
        return response()->json($this->formatRequest($swapRequest), 201);
    }

    public function approve(Request $request, $id)
    {
        if (!$this->canManageRequests($request)) {
            return response()->json(['message' => 'Not authorized.'], 403);
        }

        $approverProfileId = $this->getProfileId($request);
        if ($approverProfileId === null) {
            return response()->json(['message' => 'Approver profile not found.'], 422);
        }

        $swapRequest = SwappingRequest::with(['requesterSchedule', 'targetSchedule'])->find($id);
        if (!$swapRequest) {
            return response()->json(['message' => 'Swap request not found.'], 404);
        }

        if ($swapRequest->status !== 'pending') {
            return response()->json(['message' => 'Swap request is not pending.'], 422);
        }

        $result = DB::transaction(function () use ($swapRequest, $approverProfileId) {
            $requesterSchedule = $swapRequest->requesterSchedule;
            $targetSchedule = $swapRequest->targetSchedule;

            if (!$requesterSchedule) {
                return null;
            }

            if ($targetSchedule) {
                $fromDate = $requesterSchedule->task_date;
                $toDate = $targetSchedule->task_date;

                $requesterSchedule->update([
                    'task_date' => $toDate,
                    'status' => 'swap',
                ]);

                $targetSchedule->update([
                    'task_date' => $fromDate,
                    'status' => 'swap',
                ]);
            } else {
                $requesterSchedule->update([
                    'task_date' => $swapRequest->target_date,
                    'status' => 'swap',
                ]);
            }

            $swapRequest->update([
                'status' => 'approved',
                'approved_by' => $approverProfileId,
            ]);

            return $swapRequest->fresh(['requesterSchedule.profile.user', 'targetSchedule.profile.user']);
        });

        if (!$result) {
            return response()->json(['message' => 'Swap request could not be processed.'], 422);
        }

        return response()->json($this->formatRequest($result));
    }

    public function deny(Request $request, $id)
    {
        if (!$this->canManageRequests($request)) {
            return response()->json(['message' => 'Not authorized.'], 403);
        }

        $approverProfileId = $this->getProfileId($request);
        if ($approverProfileId === null) {
            return response()->json(['message' => 'Approver profile not found.'], 422);
        }

        $swapRequest = SwappingRequest::with('targetSchedule')->find($id);
        if (!$swapRequest) {
            return response()->json(['message' => 'Swap request not found.'], 404);
        }

        if ($swapRequest->status !== 'pending') {
            return response()->json(['message' => 'Swap request is not pending.'], 422);
        }

        DB::transaction(function () use ($swapRequest, $approverProfileId) {
            $swapRequest->update([
                'status' => 'denied',
                'approved_by' => $approverProfileId,
            ]);
        });

        $swapRequest->load(['requesterSchedule.profile.user', 'targetSchedule.profile.user']);
        return response()->json($this->formatRequest($swapRequest));
    }

    public function archive(Request $request, $id)
    {
        if (!$this->canManageRequests($request)) {
            return response()->json(['message' => 'Not authorized.'], 403);
        }

        $swapRequest = SwappingRequest::find($id);
        if (!$swapRequest) {
            return response()->json(['message' => 'Swap request not found.'], 404);
        }

        if (!in_array($swapRequest->status, ['approved', 'denied'], true)) {
            return response()->json(['message' => 'Only approved or denied requests can be archived.'], 422);
        }

        $swapRequest->update([
            'is_archived' => true,
            'archived_at' => now(),
        ]);

        $swapRequest->load(['requesterSchedule.profile.user', 'targetSchedule.profile.user']);
        return response()->json($this->formatRequest($swapRequest));
    }
}
