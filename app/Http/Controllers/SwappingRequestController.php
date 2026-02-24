<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\Schedule;
use App\Models\SwappingRequest;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\TemplateProcessor;

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

    /**
     * Get an available Swap template ID.
     * Returns the active swap template if available, otherwise the first available swap template.
     */
    public function getAvailableTemplate()
    {
        // Try to get the active swap template first
        $active = Template::where('type', 'swap')->where('is_active', 1)->first();
        if ($active) {
            return response()->json(['template_id' => $active->id, 'template_name' => $active->template_name]);
        }

        // Fall back to the first available swap template
        $swapTemplate = Template::where('type', 'swap')->first();
        if ($swapTemplate) {
            return response()->json(['template_id' => $swapTemplate->id, 'template_name' => $swapTemplate->template_name]);
        }

        // If no swap template found, return any available template
        $anyTemplate = Template::first();
        if ($anyTemplate) {
            return response()->json(['template_id' => $anyTemplate->id, 'template_name' => $anyTemplate->template_name]);
        }

        // No templates available
        return response()->json(['template_id' => null, 'template_name' => null], 404);
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

    public function show(Request $request, int $id)
    {
        $swapRequest = SwappingRequest::with([
            'requesterSchedule.profile.user',
            'targetSchedule.profile.user',
            'requesterProfile.user',
        ])->find($id);

        if (!$swapRequest) {
            return response()->json(['message' => 'Swap request not found.'], 404);
        }

        // Get requester info
        $requesterProfile = $swapRequest->requesterSchedule?->profile;
        $requesterUser = $requesterProfile?->user;
        $requesterName = $requesterProfile?->full_name ?? $requesterUser?->username ?? 'N/A';
        
        // Get target info
        $targetProfile = $swapRequest->targetSchedule?->profile;
        $targetUser = $targetProfile?->user;
        $targetName = $targetProfile?->full_name ?? $targetUser?->username ?? 'N/A';
        
        $requesterTask = $swapRequest->requesterSchedule?->task_description ?? 'N/A';
        $targetTask = $swapRequest->targetSchedule?->task_description ?? 'N/A';
        
        $fromDate = $swapRequest->requesterSchedule?->task_date?->format('F j, Y') ?? 'N/A';
        $toDate = $swapRequest->targetSchedule?->task_date?->format('F j, Y') ?? 
                  ($swapRequest->target_date ? \Carbon\Carbon::parse($swapRequest->target_date)->format('F j, Y') : 'N/A');
        
        $currentDate = $swapRequest->created_at?->format('F j, Y') ?? 'N/A';
        $status = ucfirst($swapRequest->status);

        $data = [
            'id' => $swapRequest->id,
            'requester_name' => $requesterName,
            'target_name' => $targetName,
            'requester_task' => $requesterTask,
            'target_task' => $targetTask,
            'from_date' => $fromDate,
            'to_date' => $toDate,
            'current_date' => $currentDate,
            'status' => $status,
            'created_at' => $swapRequest->created_at?->toIso8601String(),
            'updated_at' => $swapRequest->updated_at?->toIso8601String(),
        ];

        return response()->json($data);
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

            $originalRequesterDate = $requesterSchedule->task_date;
            $originalTargetDate = $targetSchedule?->task_date;

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
                'original_requester_date' => $originalRequesterDate,
                'original_target_date' => $originalTargetDate,
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

    public function restore(Request $request, $id)
    {
        if (!$this->canManageRequests($request)) {
            return response()->json(['message' => 'Not authorized.'], 403);
        }

        $swapRequest = SwappingRequest::find($id);
        if (!$swapRequest) {
            return response()->json(['message' => 'Swap request not found.'], 404);
        }

        if (!$swapRequest->is_archived) {
            return response()->json(['message' => 'Only archived requests can be restored.'], 422);
        }

        $swapRequest->update([
            'is_archived' => false,
            'archived_at' => null,
        ]);

        $swapRequest->load(['requesterSchedule.profile.user', 'targetSchedule.profile.user']);
        return response()->json($this->formatRequest($swapRequest));
    }

    public function export(Request $request, $id)
    {
        $swapRequest = SwappingRequest::with([
            'requesterSchedule.profile.user',
            'targetSchedule.profile.user',
        ])->find($id);

        if (!$swapRequest) {
            return response()->json(['message' => 'Swap request not found.'], 404);
        }

        $templatePath = resource_path('templates/SwapForm_template.docx');
        if (!file_exists($templatePath)) {
            return response()->json(['message' => 'SwapForm template not found.'], 404);
        }

        try {
            $template = new TemplateProcessor($templatePath);

            $requesterProfile = $swapRequest->requesterSchedule?->profile;
            $targetProfile = $swapRequest->targetSchedule?->profile;
            
            $requesterName = $requesterProfile?->full_name ?? $requesterProfile?->user?->username ?? 'N/A';
            $targetName = $targetProfile?->full_name ?? $targetProfile?->user?->username ?? 'N/A';
            
            $requesterTask = $swapRequest->requesterSchedule?->task_description ?? 'N/A';
            $targetTask = $swapRequest->targetSchedule?->task_description ?? 'N/A';
            
            $fromDate = $swapRequest->requesterSchedule?->task_date?->format('F j, Y') ?? 'N/A';
            $toDate = $swapRequest->targetSchedule?->task_date?->format('F j, Y') ?? 
                      ($swapRequest->target_date ? \Carbon\Carbon::parse($swapRequest->target_date)->format('F j, Y') : 'N/A');
            
            $currentDate = now()->format('F j, Y');
            $status = ucfirst($swapRequest->status);

            $template->setValues([
                'requester_name' => $requesterName,
                'target_name' => $targetName,
                'requester_task' => $requesterTask,
                'target_task' => $targetTask,
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'current_date' => $currentDate,
                'status' => $status,
            ]);

            $tempFile = storage_path('app/temp_swap_' . Str::random(10) . '.docx');
            $template->saveAs($tempFile);

            $content = file_get_contents($tempFile);
            unlink($tempFile);

            $filename = 'SwapForm_' . $id . '_' . date('Ymd') . '.docx';

            return response($content, 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Content-Length' => strlen($content),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }
}
