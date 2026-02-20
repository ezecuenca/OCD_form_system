<?php

namespace App\Http\Controllers;

use App\Models\AdrForm;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdrFormController extends Controller
{
    protected function getProfileId(Request $request): ?int
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }
        return Profile::where('user_id', $user->id)->value('id');
    }

    /**
     * List ADR forms for the authenticated user's profile.
     */
    public function index(Request $request)
    {
        $profileId = $this->getProfileId($request);
        if ($profileId === null) {
            return response()->json([]);
        }

        $forms = AdrForm::where('profile_id', $profileId)
            ->orderByDesc('created_at')
            ->get(['id', 'document_name', 'subject', 'alert_status', 'is_archived', 'created_at']);

        $list = $forms->map(function ($form) {
            return [
                'id' => $form->id,
                'documentName' => $form->document_name,
                'subject' => $form->subject,
                'alertStatus' => $form->alert_status ?? 'WHITE ALERT',
                'status' => $form->is_archived ? 'Archived' : 'Active',
                'createdAt' => $form->created_at?->toIso8601String(),
            ];
        });

        return response()->json($list);
    }

    /**
     * Get a single ADR form with full form_data for the frontend.
     */
    public function show(Request $request, $id)
    {
        $profileId = $this->getProfileId($request);
        $form = AdrForm::where('profile_id', $profileId)->find($id);
        if (!$form) {
            return response()->json(['message' => 'Report not found.'], 404);
        }

        return response()->json($this->formatReportForFrontend($form));
    }

    /**
     * Create a new ADR form.
     */
    public function store(Request $request)
    {
        $request->validate([
            'report' => ['required', 'array'],
            'report.documentName' => ['nullable', 'string', 'max:255'],
            'report.subject' => ['nullable', 'string', 'max:255'],
            'report.alertStatus' => ['nullable', 'string', 'max:50'],
        ]);

        $profileId = $this->getProfileId($request);
        if ($profileId === null) {
            return response()->json(['message' => 'Profile not found.'], 422);
        }

        $report = $request->input('report');

        $form = DB::transaction(function () use ($profileId, $report) {
            $form = AdrForm::create([
                'profile_id' => $profileId,
                'document_name' => $report['documentName'] ?? '',
                'subject' => $report['subject'] ?? '',
                'alert_status' => $report['alertStatus'] ?? $report['status'] ?? 'WHITE ALERT',
                'is_archived' => false,
                'templates_id' => $report['templates_id'] ?? null,
                'form_data' => $report,
            ]);
            $this->syncChildTables($form, $profileId, $report);
            return $form->fresh();
        });

        return response()->json($this->formatReportForFrontend($form), 201);
    }

    /**
     * Update an ADR form.
     */
    public function update(Request $request, $id)
    {
        $profileId = $this->getProfileId($request);
        $form = AdrForm::where('profile_id', $profileId)->find($id);
        if (!$form) {
            return response()->json(['message' => 'Report not found.'], 404);
        }

        $request->validate([
            'report' => ['required', 'array'],
        ]);

        $report = $request->input('report');

        DB::transaction(function () use ($form, $profileId, $report) {
            $form->update([
                'document_name' => $report['documentName'] ?? $form->document_name,
                'subject' => $report['subject'] ?? $form->subject,
                'alert_status' => $report['alertStatus'] ?? $report['status'] ?? $form->alert_status,
                'templates_id' => $report['templates_id'] ?? $form->templates_id,
                'form_data' => $report,
            ]);
            $this->syncChildTables($form, $profileId, $report);
        });

        return response()->json($this->formatReportForFrontend($form->fresh()));
    }

    /**
     * Archive an ADR form.
     */
    public function archive(Request $request, $id)
    {
        $profileId = $this->getProfileId($request);
        $form = AdrForm::where('profile_id', $profileId)->find($id);
        if (!$form) {
            return response()->json(['message' => 'Report not found.'], 404);
        }
        $form->update(['is_archived' => true, 'archived_at' => now()]);
        return response()->json($this->formatReportForFrontend($form->fresh()));
    }

    /**
     * Restore an archived ADR form.
     */
    public function restore(Request $request, $id)
    {
        $profileId = $this->getProfileId($request);
        $form = AdrForm::where('profile_id', $profileId)->find($id);
        if (!$form) {
            return response()->json(['message' => 'Report not found.'], 404);
        }
        $form->update(['is_archived' => false, 'archived_at' => null]);
        return response()->json($this->formatReportForFrontend($form->fresh()));
    }

    /**
     * Delete an ADR form permanently.
     */
    public function destroy(Request $request, $id)
    {
        $profileId = $this->getProfileId($request);
        $form = AdrForm::where('profile_id', $profileId)->find($id);
        if (!$form) {
            return response()->json(['message' => 'Report not found.'], 404);
        }
        DB::transaction(function () use ($form) {
            $form->advisories()->delete();
            $form->attendance()->delete();
            $form->communications()->delete();
            $form->concerns()->delete();
            $form->endorsed()->delete();
            $form->otherItems()->delete();
            $form->delete();
        });
        return response()->json(['message' => 'Deleted.'], 200);
    }

    protected function formatReportForFrontend(AdrForm $form): array
    {
        $data = $form->form_data ?? [];
        return array_merge($data, [
            'id' => $form->id,
            'documentName' => $form->document_name ?: ($data['documentName'] ?? ''),
            'subject' => $form->subject ?: ($data['subject'] ?? ''),
            'alertStatus' => $form->alert_status ?: ($data['alertStatus'] ?? 'WHITE ALERT'),
            'status' => $form->is_archived ? 'Archived' : 'Active',
            'createdAt' => $form->created_at?->toIso8601String(),
            'updatedAt' => $form->updated_at?->toIso8601String(),
        ]);
    }

    protected function syncChildTables(AdrForm $form, int $profileId, array $report): void
    {
        $form->advisories()->delete();
        foreach ($report['reportsItems'] ?? [] as $item) {
            $form->advisories()->create([
                'advisories' => $item['report'] ?? '',
                'remarks' => $item['remarks'] ?? '',
            ]);
        }

        $form->attendance()->delete();
        foreach ($report['attendanceItems'] ?? [] as $item) {
            $form->attendance()->create([
                'profile_id' => $profileId,
                'task' => $item['task'] ?? '',
            ]);
        }

        $form->communications()->delete();
        foreach ($report['communicationRows'] ?? [] as $row) {
            $form->communications()->create([
                'particulars' => $row['particulars'] ?? '',
                'number' => (int) ($row['noOfItems'] ?? $row['number'] ?? 0),
                'contact' => $row['contact'] ?? '',
                'remarks' => $row['status'] ?? $row['remarks'] ?? '',
            ]);
        }

        $form->concerns()->delete();
        foreach ($report['otherAdminRows'] ?? [] as $row) {
            $form->concerns()->create([
                'concern' => $row['concern'] ?? '',
            ]);
        }

        $form->endorsed()->delete();
        foreach ($report['endorsedItemsRows'] ?? [] as $row) {
            $form->endorsed()->create([
                'endorsed' => $row['item'] ?? '',
            ]);
        }

        $form->otherItems()->delete();
        foreach ($report['otherItemsRows'] ?? [] as $row) {
            $form->otherItems()->create([
                'particulars' => $row['particulars'] ?? '',
                'number' => (int) ($row['noOfItems'] ?? $row['number'] ?? 0),
                'remarks' => $row['status'] ?? $row['remarks'] ?? '',
            ]);
        }
    }
}
