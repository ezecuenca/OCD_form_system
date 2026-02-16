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
        $counter = 1;
        while (is_file($path)) {
            $filename = $baseName . '_' . $counter . '.docx';
            $path = $dir . '/' . $filename;
            $counter++;
        }

        if (!$file->move($dir, $filename)) {
            return response()->json(['message' => 'Failed to save template.'], 500);
        }

        $fullPath = $dir . '/' . $filename;
        $updatedAt = is_file($fullPath) ? date('c', filemtime($fullPath)) : date('c');
        $name = pathinfo($filename, PATHINFO_FILENAME);
        Template::updateOrCreate(
            ['template_name' => $name],
            ['template_name' => $name, 'html_layout' => null, 'is_active' => false]
        );

        return response()->json([
            'name' => $name,
            'filename' => $filename,
            'updated_at' => $updatedAt,
            'is_active' => false,
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
     * List .docx template files in resources/templates and merge is_active from DB.
     */
    public function index()
    {
        $dir = resource_path('templates');
        if (!is_dir($dir)) {
            return response()->json([]);
        }

        $activeNames = Template::where('is_active', true)->pluck('template_name')->flip()->toArray();
        $templates = [];
        foreach (File::files($dir) as $file) {
            $ext = strtolower($file->getExtension());
            if ($ext !== 'docx') {
                continue;
            }
            $filename = $file->getFilename();
            $name = pathinfo($filename, PATHINFO_FILENAME);
            $templates[] = [
                'name' => $name,
                'filename' => $filename,
                'updated_at' => date('c', $file->getMTime()),
                'is_active' => isset($activeNames[$name]),
            ];
        }

        usort($templates, fn ($a, $b) => strcasecmp($a['name'], $b['name']));

        return response()->json($templates);
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
