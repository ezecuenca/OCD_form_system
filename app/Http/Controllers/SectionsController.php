<?php

namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectionsController extends Controller
{
    public function index(Request $request)
    {
        $archived = $request->query('archived');
        $query = Section::query()->select(['id', 'name', 'is_archived', 'archived_at', 'created_at'])->orderBy('name');

        if ($archived === '1' || $archived === true) {
            $query->where('is_archived', true);
        } else {
            $query->where('is_archived', false);
        }

        return $query->get();
    }

    /**
     * Store a new section.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $section = Section::create([
            'name' => $validated['name'],
            'is_archived' => false,
        ]);

        return response()->json([
            'id' => $section->id,
            'name' => $section->name,
            'is_archived' => $section->is_archived,
            'archived_at' => $section->archived_at?->toIso8601String(),
            'created_at' => $section->created_at?->toIso8601String(),
        ], 201);
    }

    /**
     * Update a section.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $section = Section::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $section->update($validated);

        return response()->json([
            'id' => $section->id,
            'name' => $section->name,
            'is_archived' => $section->is_archived,
            'archived_at' => $section->archived_at?->toIso8601String(),
            'created_at' => $section->created_at?->toIso8601String(),
        ]);
    }

    /**
     * Archive a section.
     */
    public function archive(int $id): JsonResponse
    {
        $section = Section::findOrFail($id);
        $section->update(['is_archived' => true, 'archived_at' => now()]);

        return response()->json([
            'id' => $section->id,
            'name' => $section->name,
            'is_archived' => true,
            'archived_at' => $section->archived_at?->toIso8601String(),
            'created_at' => $section->created_at?->toIso8601String(),
        ]);
    }

    /**
     * Restore an archived section.
     */
    public function restore(int $id): JsonResponse
    {
        $section = Section::findOrFail($id);
        $section->update(['is_archived' => false, 'archived_at' => null]);

        return response()->json([
            'id' => $section->id,
            'name' => $section->name,
            'is_archived' => false,
            'archived_at' => null,
            'created_at' => $section->created_at?->toIso8601String(),
        ]);
    }

    /**
     * Remove a section permanently.
     */
    public function destroy(int $id): JsonResponse
    {
        $section = Section::findOrFail($id);
        $section->delete();

        return response()->json(null, 204);
    }
}
