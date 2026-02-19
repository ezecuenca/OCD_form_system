<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class TemplatesController extends Controller
{
    /**
     * Return docx with all ${...} placeholders replaced by empty string (for preview in modal).
     */
    public function preview(string $filename)
    {
        $filename = basename($filename);
        if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) !== 'docx') {
            return response()->json(['message' => 'Invalid template.'], 404);
        }

        $path = resource_path('templates/' . $filename);
        if (!is_readable($path) || !is_file($path)) {
            return response()->json(['message' => 'Template not found.'], 404);
        }

        $zip = new \ZipArchive;
        if ($zip->open($path, \ZipArchive::RDONLY) !== true) {
            return response()->json(['message' => 'Could not read template.'], 500);
        }

        $tmpPath = tempnam(sys_get_temp_dir(), 'tpl_preview_') . '.docx';
        $out = new \ZipArchive;
        if ($out->open($tmpPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            $zip->close();
            return response()->json(['message' => 'Could not create preview.'], 500);
        }

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $entry = $zip->getNameIndex($i);
            if ($entry === false) {
                continue;
            }
            $content = $zip->getFromIndex($i);
            if ($content === false && $zip->statIndex($i)['size'] > 0) {
                continue;
            }
            if ($entry === 'word/document.xml' && $content !== false) {
                $content = preg_replace('/\$\{[^}]*\}/u', '', $content);
            }
            if ($content !== false) {
                $out->addFromString($entry, $content);
            }
        }

        $zip->close();
        $out->close();

        $name = pathinfo($filename, PATHINFO_FILENAME) . '.docx';
        $response = response()->file($tmpPath, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'inline; filename="' . $name . '"',
        ]);
        $response->deleteFileAfterSend(true);
        return $response;
    }
    /**
     * Upload a new .docx template (multipart form, file field: "template" or "file").
     */
    public function store(Request $request)
    {
        $file = $request->file('template') ?? $request->file('file');
        if (!$file || !$file->isValid()) {
            return response()->json(['message' => 'No valid file uploaded.'], 422);
        }

        $ext = strtolower($file->getClientOriginalExtension());
        if ($ext !== 'docx') {
            return response()->json(['message' => 'Only .docx files are allowed.'], 422);
        }

        $maxSize = 10 * 1024 * 1024; // 10 MB
        if ($file->getSize() > $maxSize) {
            return response()->json(['message' => 'File is too large. Maximum size is 10 MB.'], 422);
        }

        $baseName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $baseName = preg_replace('/[^a-zA-Z0-9_\-\s]/', '', $baseName) ?: 'template';
        $baseName = substr(trim($baseName), 0, 100) ?: 'template';

        $dir = resource_path('templates');
        if (!is_dir($dir)) {
            if (!File::makeDirectory($dir, 0755, true)) {
                return response()->json(['message' => 'Could not create templates directory.'], 500);
            }
        }

        $filename = $baseName . '.docx';
        $path = $dir . '/' . $filename;
        // Same name = replace: overwrite file and update DB row (preserve is_active).
        if (!$file->move($dir, $filename)) {
            return response()->json(['message' => 'Failed to save template.'], 500);
        }

        $name = pathinfo($filename, PATHINFO_FILENAME);
        $template = Template::firstOrCreate(
            ['template_name' => $name],
            ['template_name' => $name, 'html_layout' => null, 'is_active' => false]
        );
        $template->touch();

        $fullPath = $dir . '/' . $filename;
        $updatedAt = is_file($fullPath) ? date('c', filemtime($fullPath)) : date('c');

        return response()->json([
            'name' => $name,
            'filename' => $filename,
            'updated_at' => $updatedAt,
            'is_active' => (bool) $template->is_active,
        ], 201);
    }

    /**
     * Set which template is "in use" (is_active = 1). Body: template_name or filename.
     */
    public function setActive(Request $request)
    {
        $validated = $request->validate([
            'template_name' => ['nullable', 'string', 'max:255'],
            'filename' => ['nullable', 'string', 'max:255'],
        ]);
        $name = $validated['template_name'] ?? null;
        if (!$name && !empty($validated['filename'])) {
            $name = pathinfo($validated['filename'], PATHINFO_FILENAME);
        }
        if (!$name || trim($name) === '') {
            return response()->json(['message' => 'template_name or filename is required.'], 422);
        }
        $name = trim($name);
        Template::where('is_active', 1)->update(['is_active' => 0]);
        $template = Template::updateOrCreate(
            ['template_name' => $name],
            ['template_name' => $name, 'html_layout' => null, 'is_active' => 1]
        );
        return response()->json([
            'message' => 'Template set as in use.',
            'template_name' => $name,
            'id' => $template->id,
        ]);
    }

    /**
     * List templates from the database. Only includes rows where the .docx file exists.
     * When only one template remains, it is set "in use" by default.
     */
    public function index()
    {
        $dir = resource_path('templates');
        $templates = [];
        foreach (Template::orderBy('template_name')->get() as $row) {
            $name = trim((string) $row->template_name);
            if ($name === '') {
                continue;
            }
            $filename = $name . '.docx';
            $path = $dir . '/' . $filename;
            if (!is_file($path) || !is_readable($path)) {
                continue;
            }
            $templates[] = [
                'name' => $name,
                'filename' => $filename,
                'updated_at' => date('c', filemtime($path)),
                'is_active' => (bool) $row->is_active,
            ];
        }

        // If only one template and none is active, set it as "in use" by default.
        if (count($templates) === 1 && !$templates[0]['is_active']) {
            $onlyName = $templates[0]['name'];
            Template::where('template_name', $onlyName)->update(['is_active' => 1]);
            $templates[0]['is_active'] = true;
        }

        return response()->json($templates);
    }

    /**
     * Permanently delete a template file and its DB record.
     */
    public function destroy(string $filename)
    {
        $filename = basename($filename);
        if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) !== 'docx') {
            return response()->json(['message' => 'Invalid template.'], 404);
        }

        $path = resource_path('templates/' . $filename);
        if (is_file($path)) {
            if (!@unlink($path)) {
                return response()->json(['message' => 'Could not delete template file.'], 500);
            }
        }

        $name = pathinfo($filename, PATHINFO_FILENAME);
        Template::where('template_name', $name)->delete();

        return response()->json(['message' => 'Template deleted.']);
    }

    /**
     * Serve a template file for viewing (inline) or download.
     * Filename must be safe (no path traversal).
     */
    public function show(Request $request, string $filename)
    {
        $filename = basename($filename);
        if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) !== 'docx') {
            return response()->json(['message' => 'Invalid template.'], 404);
        }

        $path = resource_path('templates/' . $filename);
        if (!is_readable($path) || !is_file($path)) {
            return response()->json(['message' => 'Template not found.'], 404);
        }

        $disposition = $request->query('download') ? 'attachment' : 'inline';
        $name = pathinfo($filename, PATHINFO_FILENAME) . '.docx';

        return response()->file($path, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => $disposition . '; filename="' . $name . '"',
        ]);
    }
}
