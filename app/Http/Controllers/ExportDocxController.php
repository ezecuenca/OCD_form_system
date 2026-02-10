<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ExportDocxController extends Controller
{
    /**
     * POST: Generate DOCX and redirect to GET download URL so the browser
     * treats the download as navigation (avoids "permission to download" prompt).
     */
    public function __invoke(Request $request)
    {
        if (!class_exists(\ZipArchive::class)) {
            return response()->json([
                'error' => 'PHP Zip extension is required for DOCX export. Enable it in php.ini (e.g. extension=zip).',
            ], 503);
        }
        if (!class_exists(\PhpOffice\PhpWord\TemplateProcessor::class)) {
            return response()->json([
                'error' => 'PHPWord is not installed. Run: composer require phpoffice/phpword',
            ], 503);
        }

        $report = $request->input('report');
        if (is_string($report)) {
            $report = json_decode($report, true);
        }
        if (!is_array($report) || empty($report)) {
            $report = $request->all();
        }
        if (empty($report)) {
            return response()->json(['error' => 'No report data provided.'], 422);
        }

        $templatePath = resource_path('templates/ADR_template.docx');
        clearstatcache(true, $templatePath);
        if (!is_readable($templatePath)) {
            Log::error('ADR template not found or not readable: ' . $templatePath);
            return response()->json(['error' => 'Export template not found.'], 500);
        }

        try {
            $content = $this->generateDocxContent($report);
            $filename = $this->filename($report);

            // Form POST (no AJAX): return the file directly. The browser receives it as the direct
            // response to the user's form submit → no "permission to download" prompt.
            $isFormPost = !$request->wantsJson() && $request->header('X-Requested-With') !== 'XMLHttpRequest';
            if ($isFormPost) {
                $safeFilename = preg_replace('/[^\w\s\-\.]/', '_', $filename);
                $disposition = 'attachment; filename="' . $safeFilename . '"';
                return response($content, 200, [
                    'Content-Type'               => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition'        => $disposition,
                    'Content-Length'             => (string) strlen($content),
                    'Cache-Control'              => 'no-cache, no-store, must-revalidate',
                    'Pragma'                     => 'no-cache',
                    'X-Content-Type-Options'     => 'nosniff',
                ]);
            }

            // AJAX (fetch): return JSON with download URL for backwards compatibility.
            $token = Str::random(40);
            $path = 'exports/adr_' . $token . '.docx';
            Storage::disk('local')->put($path, $content);
            Cache::put('adr_export_filename_' . $token, $filename, now()->addMinutes(5));
            $downloadUrl = url('/api/adr/export-docx/' . $token);
            return response()->json([
                'downloadUrl' => $downloadUrl,
                'filename'    => $filename,
            ]);
        } catch (\Throwable $e) {
            Log::error('DOCX export failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            $msg = htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
            $isFormPost = !$request->wantsJson() && $request->header('X-Requested-With') !== 'XMLHttpRequest';
            if ($isFormPost) {
                $html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export failed</title></head><body style="font-family:sans-serif;padding:2rem;text-align:center"><p>Export failed.</p><p style="color:#666">' . $msg . '</p><p><a href="javascript:window.close()">Close this tab</a></p></body></html>';
                return response($html, 500, ['Content-Type' => 'text/html; charset=UTF-8']);
            }
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * GET: Serve the generated DOCX (after redirect from POST). No permission prompt.
     */
    public function download(string $token)
    {
        $path = 'exports/adr_' . $token . '.docx';
        if (!Storage::disk('local')->exists($path)) {
            return response()->json(['error' => 'Export expired or not found.'], 404);
        }
        $content = Storage::disk('local')->get($path);
        Storage::disk('local')->delete($path);
        $filename = Cache::pull('adr_export_filename_' . $token) ?? 'ADR_Report.docx';

        return response($content, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-cache, no-store, must-revalidate',
        ]);
    }

    /**
     * POST: Generate report as PDF (DOCX from template, then convert to PDF via LibreOffice).
     * Returns PDF inline so the browser can open it and the user can print.
     * If LibreOffice is not available, returns JSON error or 503.
     */
    public function exportPdf(Request $request)
    {
        $report = $request->input('report');
        if (is_string($report)) {
            $report = json_decode($report, true);
        }
        if (!is_array($report) || empty($report)) {
            $report = $request->all();
        }
        if (empty($report)) {
            return response()->json(['error' => 'No report data provided.'], 422);
        }
        try {
            $docxContent = $this->generateDocxContent($report);
            $pdfContent = $this->convertDocxToPdf($docxContent);
            if ($pdfContent === null) {
                Log::warning('PDF conversion failed or LibreOffice not available');
                return response()->json([
                    'error' => 'PDF export requires LibreOffice. Install LibreOffice and ensure soffice is in PATH, or set LIBREOFFICE_PATH in .env.',
                ], 503);
            }
            $baseName = pathinfo($this->filename($report), PATHINFO_FILENAME);
            $pdfFilename = $baseName . '.pdf';
            $safeFilename = preg_replace('/[^\w\s\-\.]/', '_', $pdfFilename);
            $isFormPost = !$request->wantsJson() && $request->header('X-Requested-With') !== 'XMLHttpRequest';
            $disposition = $isFormPost ? 'inline' : 'attachment';
            return response($pdfContent, 200, [
                'Content-Type'               => 'application/pdf',
                'Content-Disposition'        => $disposition . '; filename="' . $safeFilename . '"',
                'Content-Length'             => (string) strlen($pdfContent),
                'Cache-Control'              => 'no-cache, no-store, must-revalidate',
                'X-Content-Type-Options'     => 'nosniff',
            ]);
        } catch (\Throwable $e) {
            Log::error('PDF export failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Convert DOCX binary content to PDF.
     * If a LibreOffice listener is configured and unoconv is available, uses that (faster).
     * Otherwise uses soffice --headless --convert-to (slower, starts LibreOffice each time).
     * Returns PDF content or null if conversion fails.
     */
    private function convertDocxToPdf(string $docxContent): ?string
    {
        $tmpDir = sys_get_temp_dir() . '/adr_pdf_' . Str::random(8);
        if (!@mkdir($tmpDir, 0755, true)) {
            Log::warning('Could not create temp dir for PDF conversion: ' . $tmpDir);
            return null;
        }
        $docxPath = $tmpDir . '/document.docx';
        if (file_put_contents($docxPath, $docxContent) === false) {
            $this->cleanupTempDir($tmpDir);
            return null;
        }

        $pdfContent = null;
        if (config('services.libreoffice_use_listener')) {
            $pdfContent = $this->convertDocxToPdfViaUnoconv($docxPath, $tmpDir);
        }
        if ($pdfContent === null) {
            $pdfContent = $this->convertDocxToPdfViaSoffice($docxPath, $tmpDir);
        }

        $this->cleanupTempDir($tmpDir);
        return $pdfContent ?: null;
    }

    /**
     * Convert DOCX to PDF using unoconv and a running LibreOffice listener (faster).
     */
    private function convertDocxToPdfViaUnoconv(string $docxPath, string $tmpDir): ?string
    {
        $unoconv = $this->getUnoconvPath();
        if ($unoconv === null) {
            return null;
        }
        $host = config('services.libreoffice_listener_host', '127.0.0.1');
        $port = config('services.libreoffice_listener_port', '2083');
        $connection = 'socket,host=' . $host . ',port=' . $port . ';urp;StarOffice.ComponentContext';
        $pdfPath = $tmpDir . '/document.pdf';
        $cmd = $unoconv . ' --connection ' . escapeshellarg($connection) . ' -f pdf -o ' . escapeshellarg($pdfPath) . ' ' . escapeshellarg($docxPath) . ' 2>&1';
        exec($cmd, $output, $returnCode);
        if ($returnCode === 0 && is_readable($pdfPath)) {
            return file_get_contents($pdfPath);
        }
        if (config('app.debug')) {
            Log::debug('unoconv conversion failed', ['returnCode' => $returnCode, 'output' => $output]);
        }
        return null;
    }

    /**
     * Convert DOCX to PDF by starting soffice --headless (slower, one process per conversion).
     */
    private function convertDocxToPdfViaSoffice(string $docxPath, string $tmpDir): ?string
    {
        $outDir = $tmpDir . '/out';
        if (!@mkdir($outDir, 0755, true)) {
            return null;
        }
        $soffice = $this->getLibreOfficePath();
        if ($soffice === null) {
            return null;
        }
        $outDirQuoted = escapeshellarg($outDir);
        $docxPathQuoted = escapeshellarg($docxPath);
        $cmd = $soffice . ' --headless --convert-to "pdf:writer_pdf_Export" --outdir ' . $outDirQuoted . ' ' . $docxPathQuoted . ' 2>&1';
        exec($cmd, $output, $returnCode);
        $pdfPath = $outDir . '/document.pdf';
        if ($returnCode === 0 && is_readable($pdfPath)) {
            return file_get_contents($pdfPath);
        }
        return null;
    }

    /**
     * Path to unoconv executable, or null if not available.
     */
    private function getUnoconvPath(): ?string
    {
        $path = config('services.unoconv_path') ?? env('UNOCONV_PATH');
        if ($path && file_exists($path)) {
            return escapeshellarg($path);
        }
        $which = PHP_OS_FAMILY === 'Windows' ? 'where unoconv 2>nul' : 'which unoconv 2>/dev/null';
        $line = @trim(shell_exec($which) ?: '');
        if ($line !== '') {
            $first = preg_split('/\s+/', $line, 2)[0];
            if ($first && file_exists($first)) {
                return escapeshellarg($first);
            }
        }
        return null;
    }

    private function cleanupTempDir(string $dir): void
    {
        $files = @scandir($dir);
        if ($files) {
            foreach ($files as $f) {
                if ($f === '.' || $f === '..') {
                    continue;
                }
                $path = $dir . '/' . $f;
                if (is_dir($path)) {
                    $this->cleanupTempDir($path);
                } else {
                    @unlink($path);
                }
            }
        }
        @rmdir($dir);
    }

    /**
     * Path to LibreOffice soffice executable, or null if not available.
     */
    private function getLibreOfficePath(): ?string
    {
        $path = config('services.libreoffice_path') ?? env('LIBREOFFICE_PATH');
        if ($path && file_exists($path)) {
            return escapeshellarg($path);
        }
        if (PHP_OS_FAMILY === 'Windows') {
            $candidates = [
                getenv('ProgramFiles') . '\\LibreOffice\\program\\soffice.exe',
                getenv('ProgramFiles(x86)') . '\\LibreOffice\\program\\soffice.exe',
            ];
            foreach ($candidates as $c) {
                if ($c && file_exists($c)) {
                    return escapeshellarg($c);
                }
            }
        }
        $which = PHP_OS_FAMILY === 'Windows' ? 'where soffice 2>nul' : 'which libreoffice soffice 2>/dev/null';
        $line = @trim(shell_exec($which) ?: '');
        if ($line !== '') {
            $first = preg_split('/\s+/', $line, 2)[0];
            if ($first && file_exists($first)) {
                return escapeshellarg($first);
            }
        }
        return null;
    }

    /**
     * Generate filled DOCX content from report data. Returns binary string.
     */
    private function generateDocxContent(array $report): string
    {
        $templatePath = resource_path('templates/ADR_template.docx');
        clearstatcache(true, $templatePath);
        if (!is_readable($templatePath)) {
            throw new \RuntimeException('Export template not found.');
        }
        $originalTemplatePath = $templatePath;
        if (config('app.debug')) {
            Log::debug('ADR export using template', [
                'path' => $templatePath,
                'modified' => @filemtime($templatePath) ? date('Y-m-d H:i:s', filemtime($templatePath)) : null,
            ]);
        }
        $templatePath = $this->expandTemplateTableRows($templatePath, $report);

        $templateProcessor = new \PhpOffice\PhpWord\TemplateProcessor($templatePath);

        $this->setScalars($templateProcessor, $report);
        $this->setAttendanceRows($templateProcessor, $report);
        $this->setReportsRows($templateProcessor, $report);
        $this->setCommunicationRows($templateProcessor, $report);
        $this->setOtherItemsRows($templateProcessor, $report);
        $this->setOtherAdminRows($templateProcessor, $report);
        $this->setEndorsedItemsRows($templateProcessor, $report);

        $tempFile = tempnam(sys_get_temp_dir(), 'adr_export_') . '.docx';
        $templateProcessor->saveAs($tempFile);
        if ($templatePath !== $originalTemplatePath && is_file($templatePath)) {
            @unlink($templatePath);
        }
        $content = $this->repairDocxXml($tempFile);
        @unlink($tempFile);
        return $content;
    }

    /**
     * Repair DOCX so Word can open it: fix unescaped & and other XML in word/document.xml,
     * then return the full DOCX binary content.
     */
    private function repairDocxXml(string $tempFile): string
    {
        $zip = new \ZipArchive();
        if ($zip->open($tempFile, \ZipArchive::RDONLY) !== true) {
            return file_get_contents($tempFile);
        }
        $docXml = $zip->getFromName('word/document.xml');
        $zip->close();
        if ($docXml === false) {
            return file_get_contents($tempFile);
        }
        $docXml = $this->repairDocumentXml($docXml);
        $tempOut = tempnam(sys_get_temp_dir(), 'adr_docx_') . '.docx';
        $zipOut = new \ZipArchive();
        if ($zipOut->open($tempOut, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return file_get_contents($tempFile);
        }
        $zip = new \ZipArchive();
        $zip->open($tempFile, \ZipArchive::RDONLY);
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            $data = $zip->getFromIndex($i);
            if ($name === 'word/document.xml') {
                $data = $docXml;
            }
            $zipOut->addFromString($name, $data);
        }
        $zip->close();
        $zipOut->close();
        $content = file_get_contents($tempOut);
        @unlink($tempOut);
        return $content;
    }

    /**
     * Expand the template so each table has enough rows for the report data.
     * Finds the one placeholder row per table and duplicates it (count-1) times.
     * Returns path to expanded docx (temp file) or original if expansion skipped.
     */
    private function expandTemplateTableRows(string $templatePath, array $report): string
    {
        $zip = new \ZipArchive();
        if ($zip->open($templatePath, \ZipArchive::RDONLY) !== true) {
            return $templatePath;
        }
        $docXml = $zip->getFromName('word/document.xml');
        $zip->close();
        if ($docXml === false) {
            return $templatePath;
        }

        $tables = [
            [
                'marker'  => 'ATT_NAME',
                'count'   => min(count($report['attendanceItems'] ?? []), self::MAX_ATTENDANCE) ?: 1,
                'placeholders' => [['ATT_NUM', 'ATT_NAME', 'ATT_TASK']],
            ],
            [
                'marker'  => 'REP_REPORT',
                'count'   => min(count($report['reportsItems'] ?? []), self::MAX_REPORTS) ?: 1,
                'placeholders' => [['REP_REPORT', 'REP_REMARKS']],
            ],
            [
                'marker'  => 'COMM_PARTICULARS',
                'count'   => min(count($report['communicationRows'] ?? []), self::MAX_COMMUNICATION) ?: 1,
                'placeholders' => [['COMM_PARTICULARS', 'COMM_NO', 'COMM_CONTACT', 'COMM_STATUS']],
            ],
            [
                'marker'  => 'OTH_PARTICULARS',
                'count'   => min(count($report['otherItemsRows'] ?? []), self::MAX_OTHER_ITEMS) ?: 1,
                'placeholders' => [['OTH_PARTICULARS', 'OTH_NO', 'OTH_STATUS']],
            ],
            [
                'marker'  => 'ADM_CONCERN',
                'count'   => min(count($report['otherAdminRows'] ?? []), self::MAX_OTHER_ADMIN) ?: 1,
                'placeholders' => [['ADM_CONCERN']],
            ],
            [
                'marker'  => 'END_ITEM',
                'count'   => min(count($report['endorsedItemsRows'] ?? []), self::MAX_ENDORSED) ?: 1,
                'placeholders' => [['END_ITEM']],
            ],
        ];

        foreach ($tables as $table) {
            $pos = strpos($docXml, $table['marker']);
            if ($pos === false) {
                continue;
            }
            $rowStart = $this->findLastTableRowStartBefore($docXml, $pos);
            if ($rowStart === false) {
                continue;
            }
            $rowEnd = strpos($docXml, '</w:tr>', $rowStart);
            if ($rowEnd === false) {
                continue;
            }
            $rowEnd += strlen('</w:tr>');
            $rowXml = substr($docXml, $rowStart, $rowEnd - $rowStart);
            $placeholders = $table['placeholders'][0];
            $count = (int) $table['count'];
            // Normalize first row: ${ATT_NAME} -> ${ATT_NAME#1} so setValue fills it
            foreach ($placeholders as $ph) {
                $rowXml = str_replace('${' . $ph . '}', '${' . $ph . '#1}', $rowXml);
            }
            $docXml = substr($docXml, 0, $rowStart) . $rowXml . substr($docXml, $rowEnd);
            $rowEnd = $rowStart + strlen($rowXml);
            $insert = '';
            if ($count > 1) {
                for ($i = 2; $i <= $count; $i++) {
                    $newRow = $rowXml;
                    foreach ($placeholders as $ph) {
                        $newRow = str_replace('${' . $ph . '#1}', '${' . $ph . '#' . $i . '}', $newRow);
                    }
                    $insert .= $newRow;
                }
                $docXml = substr($docXml, 0, $rowEnd) . $insert . substr($docXml, $rowEnd);
            }
            // Remove any extra template rows in this table that still contain placeholders (avoids duplicate/wrong rows)
            $blockEnd = $rowStart + strlen($rowXml) + strlen($insert);
            $docXml = $this->removeExtraPlaceholderRowsFromTable($docXml, $blockEnd, $table['placeholders'][0]);
        }

        $tempOut = tempnam(sys_get_temp_dir(), 'adr_expand_') . '.docx';
        $zipOut = new \ZipArchive();
        if ($zipOut->open($tempOut, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return $templatePath;
        }
        $zip = new \ZipArchive();
        $zip->open($templatePath, \ZipArchive::RDONLY);
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            $data = $zip->getFromIndex($i);
            if ($name === 'word/document.xml') {
                $data = $docXml;
            }
            $zipOut->addFromString($name, $data);
        }
        $zip->close();
        $zipOut->close();
        return $tempOut;
    }

    /**
     * Remove any table rows after position $blockEnd that still contain placeholder markers (e.g. ATT_NAME, ATT_TASK).
     * This avoids duplicate/wrong rows when the template has multiple pre-filled data rows.
     */
    private function removeExtraPlaceholderRowsFromTable(string $docXml, int $blockEnd, array $placeholders): string
    {
        $tableEnd = strpos($docXml, '</w:tbl>', $blockEnd);
        if ($tableEnd === false) {
            return $docXml;
        }
        $between = substr($docXml, $blockEnd, $tableEnd - $blockEnd);
        $removed = true;
        while ($removed) {
            $removed = false;
            if (preg_match('/<w:tr(?:\s[^>]*)?>.*?<\/w:tr>/s', $between, $m)) {
                $rowContent = $m[0];
                foreach ($placeholders as $ph) {
                    if (strpos($rowContent, $ph) !== false) {
                        $between = str_replace($rowContent, '', $between);
                        $removed = true;
                        break;
                    }
                }
            }
        }
        return substr($docXml, 0, $blockEnd) . $between . substr($docXml, $tableEnd);
    }

    /**
     * Find the last start of a <w:tr> row element before position $pos.
     * Must not match <w:trPr> (row properties) so we require the character after '<w:tr' to be '>' or space.
     */
    private function findLastTableRowStartBefore(string $xml, int $pos)
    {
        $searchLen = min($pos + 1, strlen($xml));
        $last = false;
        $offset = 0;
        while ($offset < $searchLen) {
            $idx = strpos($xml, '<w:tr', $offset);
            if ($idx === false || $idx >= $searchLen) {
                break;
            }
            $next = $xml[$idx + 5] ?? '';
            if ($next === '>' || $next === ' ' || $next === "\t" || $next === "\n" || $next === "\r") {
                $last = $idx;
            }
            $offset = $idx + 1;
        }
        return $last;
    }

    /**
     * Escape ampersands in XML that are not part of an entity so the document is valid.
     */
    private function repairDocumentXml(string $xml): string
    {
        return preg_replace(
            '/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/u',
            '&amp;',
            $xml
        );
    }

    private function filename(array $report): string
    {
        $name = isset($report['documentName']) && trim((string) $report['documentName']) !== ''
            ? preg_replace('/[^\w\s\-\.]/', '', $report['documentName'])
            : 'ADR_Report';
        return $name . '.docx';
    }

    private function setScalars(\PhpOffice\PhpWord\TemplateProcessor $tp, array $report): void
    {
        $defaultAddress = 'CAMP ROMUALDO C RUBI, BANCASI, BUTUAN CITY 8600, PHILIPPINES';
        $scalars = [
            'documentName'     => $report['documentName'] ?? '',
            'headerAddress'    => $report['headerAddress'] ?? $defaultAddress,
            'forName'          => $report['forName'] ?? '',
            'forPosition'      => $report['forPosition'] ?? '',
            'thruName'         => $report['thruName'] ?? '',
            'thruPosition'     => $report['thruPosition'] ?? '',
            'fromName'         => $report['fromName'] ?? '',
            'fromPosition'     => $report['fromPosition'] ?? '',
            'subject'          => $report['subject'] ?? '',
            'dateTime'         => $report['dateTime'] ?? '',
            'alertStatus'      => $report['alertStatus'] ?? $report['status'] ?? 'WHITE ALERT',
            'preparedBy'   => $report['preparedBy'] ?? '',
            'preparedPosition' => $report['preparedPosition'] ?? '',
            'receivedBy'   => $report['receivedBy'] ?? '',
            'receivedPosition' => $report['receivedPosition'] ?? '',
            'notedBy'      => $report['notedBy'] ?? '',
            'notedPosition' => $report['notedPosition'] ?? '',
            'approvedBy'   => $report['approvedBy'] ?? '',
            'approvedPosition' => $report['approvedPosition'] ?? '',
        ];
        foreach ($scalars as $key => $value) {
            $tp->setValue($key, $this->clean($value));
        }
    }

    // Max rows we fill per table. Form sends all rows; we fill #1..#N. Add more rows in the template with #21, #22, … to show more.
    private const MAX_ATTENDANCE = 50;
    private const MAX_REPORTS = 50;
    private const MAX_COMMUNICATION = 50;
    private const MAX_OTHER_ITEMS = 50;
    private const MAX_OTHER_ADMIN = 30;
    private const MAX_ENDORSED = 30;

    private function setAttendanceRows(\PhpOffice\PhpWord\TemplateProcessor $tp, array $report): void
    {
        $rows = $report['attendanceItems'] ?? [];
        $first = $rows[0] ?? null;
        $this->setValue($tp, 'ATT_NUM', $first ? (string) 1 : '-');
        $this->setValue($tp, 'ATT_NAME', $first ? $this->clean($this->attendanceNameForExport($first['name'] ?? '')) : '-');
        $this->setValue($tp, 'ATT_TASK', $first ? $this->formatTaskForDocx($first) : '-');
        for ($i = 1; $i <= self::MAX_ATTENDANCE; $i++) {
            $r = $rows[$i - 1] ?? null;
            $this->setValue($tp, 'ATT_NUM#' . $i, $r ? (string) $i : '-');
            $this->setValue($tp, 'ATT_NAME#' . $i, $r ? $this->clean($this->attendanceNameForExport($r['name'] ?? '')) : '-');
            $this->setValue($tp, 'ATT_TASK#' . $i, $r ? $this->formatTaskForDocx($r) : '-');
        }
    }

    /**
     * Strip trailing #n (e.g. #1, #2) from attendance name so export never shows that suffix.
     */
    private function attendanceNameForExport(string $name): string
    {
        return preg_replace('/#\d+$/', '', trim($name));
    }

    /**
     * Format attendance task for DOCX: if taskAsBullets, split by ; or newline and prefix each line with bullet.
     */
    private function formatTaskForDocx(array $row): string
    {
        $task = (string) ($row['task'] ?? '');
        if (trim($task) === '') {
            return '-';
        }
        if (!empty($row['taskAsBullets'])) {
            $lines = preg_split('/[;\n]+/', $task, -1, PREG_SPLIT_NO_EMPTY);
            $lines = array_map('trim', array_filter($lines));
            if ($lines === []) {
                return '-';
            }
            $bullet = "\xE2\x80\xA2"; // Unicode bullet U+2022
            return $this->clean(implode("\n", array_map(function ($line) use ($bullet) {
                return $bullet . ' ' . $line;
            }, $lines)));
        }
        return $this->clean($task);
    }

    private function setReportsRows(\PhpOffice\PhpWord\TemplateProcessor $tp, array $report): void
    {
        $rows = $report['reportsItems'] ?? [];
        $first = $rows[0] ?? null;
        $this->setValue($tp, 'REP_REPORT', $first ? $this->formatReportForDocx($first) : '-');
        $this->setValue($tp, 'REP_REMARKS', $first ? $this->clean($first['remarks'] ?? '') : '-');
        for ($i = 1; $i <= self::MAX_REPORTS; $i++) {
            $r = $rows[$i - 1] ?? null;
            $this->setValue($tp, 'REP_REPORT#' . $i, $r ? $this->formatReportForDocx($r) : '-');
            $this->setValue($tp, 'REP_REMARKS#' . $i, $r ? $this->clean($r['remarks'] ?? '') : '-');
        }
    }

    /**
     * Format reports row "report" field for DOCX: if reportAsBullets, split by ; or newline and prefix with bullet.
     */
    private function formatReportForDocx(array $row): string
    {
        $report = (string) ($row['report'] ?? '');
        if (trim($report) === '') {
            return '-';
        }
        if (!empty($row['reportAsBullets'])) {
            $lines = preg_split('/[;\n]+/', $report, -1, PREG_SPLIT_NO_EMPTY);
            $lines = array_map('trim', array_filter($lines));
            if ($lines === []) {
                return '-';
            }
            $bullet = "\xE2\x80\xA2";
            return $this->clean(implode("\n", array_map(function ($line) use ($bullet) {
                return $bullet . ' ' . $line;
            }, $lines)));
        }
        return $this->clean($report);
    }

    private function setCommunicationRows(\PhpOffice\PhpWord\TemplateProcessor $tp, array $report): void
    {
        $rows = $report['communicationRows'] ?? [];
        $first = $rows[0] ?? null;
        $this->setValue($tp, 'COMM_PARTICULARS', $first ? $this->clean($first['particulars'] ?? '') : '-');
        $this->setValue($tp, 'COMM_NO', $first ? $this->clean((string) ($first['noOfItems'] ?? '')) : '-');
        $this->setValue($tp, 'COMM_CONTACT', $first ? $this->clean($first['contact'] ?? '') : '-');
        $this->setValue($tp, 'COMM_STATUS', $first ? $this->clean($first['status'] ?? '') : '-');
        for ($i = 1; $i <= self::MAX_COMMUNICATION; $i++) {
            $r = $rows[$i - 1] ?? null;
            $this->setValue($tp, 'COMM_PARTICULARS#' . $i, $r ? $this->clean($r['particulars'] ?? '') : '-');
            $this->setValue($tp, 'COMM_NO#' . $i, $r ? $this->clean((string) ($r['noOfItems'] ?? '')) : '-');
            $this->setValue($tp, 'COMM_CONTACT#' . $i, $r ? $this->clean($r['contact'] ?? '') : '-');
            $this->setValue($tp, 'COMM_STATUS#' . $i, $r ? $this->clean($r['status'] ?? '') : '-');
        }
    }

    private function setOtherItemsRows(\PhpOffice\PhpWord\TemplateProcessor $tp, array $report): void
    {
        $rows = $report['otherItemsRows'] ?? [];
        $first = $rows[0] ?? null;
        $this->setValue($tp, 'OTH_PARTICULARS', $first ? $this->clean($first['particulars'] ?? '') : '-');
        $this->setValue($tp, 'OTH_NO', $first ? $this->clean((string) ($first['noOfItems'] ?? '')) : '-');
        $this->setValue($tp, 'OTH_STATUS', $first ? $this->clean($first['status'] ?? '') : '-');
        for ($i = 1; $i <= self::MAX_OTHER_ITEMS; $i++) {
            $r = $rows[$i - 1] ?? null;
            $this->setValue($tp, 'OTH_PARTICULARS#' . $i, $r ? $this->clean($r['particulars'] ?? '') : '-');
            $this->setValue($tp, 'OTH_NO#' . $i, $r ? $this->clean((string) ($r['noOfItems'] ?? '')) : '-');
            $this->setValue($tp, 'OTH_STATUS#' . $i, $r ? $this->clean($r['status'] ?? '') : '-');
        }
    }

    private function setOtherAdminRows(\PhpOffice\PhpWord\TemplateProcessor $tp, array $report): void
    {
        $rows = $report['otherAdminRows'] ?? [];
        $first = $rows[0] ?? null;
        $this->setValue($tp, 'ADM_CONCERN', $first ? $this->clean($first['concern'] ?? '') : '-');
        for ($i = 1; $i <= self::MAX_OTHER_ADMIN; $i++) {
            $r = $rows[$i - 1] ?? null;
            $this->setValue($tp, 'ADM_CONCERN#' . $i, $r ? $this->clean($r['concern'] ?? '') : '-');
        }
    }

    private function setEndorsedItemsRows(\PhpOffice\PhpWord\TemplateProcessor $tp, array $report): void
    {
        $rows = $report['endorsedItemsRows'] ?? [];
        $first = $rows[0] ?? null;
        $this->setValue($tp, 'END_ITEM', $first ? $this->clean($first['item'] ?? '') : '-');
        for ($i = 1; $i <= self::MAX_ENDORSED; $i++) {
            $r = $rows[$i - 1] ?? null;
            $this->setValue($tp, 'END_ITEM#' . $i, $r ? $this->clean($r['item'] ?? '') : '-');
        }
    }

    private function setValue(\PhpOffice\PhpWord\TemplateProcessor $tp, string $key, string $value): void
    {
        try {
            $tp->setValue($key, $value);
        } catch (\Throwable $e) {
            // placeholder not in template; ignore
        }
    }

    private function clean($value): string
    {
        if ($value === null) {
            return '';
        }
        $s = (string) $value;
        // Remove control characters that break XML
        $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s);
        // Escape XML entities so Word can open the file (e.g. & < > in data would corrupt the DOCX)
        $s = htmlspecialchars($s, ENT_XML1 | ENT_SUBSTITUTE | ENT_HTML401, 'UTF-8');
        return $s;
    }
}
