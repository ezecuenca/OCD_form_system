<?php
/**
 * Quick test script for DOCX export. Run: php test_export_docx.php
 */
require __DIR__ . '/vendor/autoload.php';

$templatePath = __DIR__ . '/resources/templates/ADR_template.docx';
if (!is_readable($templatePath)) {
    echo "FAIL: Template not found or not readable: $templatePath\n";
    exit(1);
}
echo "OK: Template file exists and is readable.\n";

if (!class_exists('ZipArchive')) {
    echo "FAIL: PHP Zip extension is missing. Enable it in php.ini:\n";
    echo "  - Windows: extension=zip (or extension=php_zip.dll)\n";
    echo "  - Linux: extension=zip\n";
    echo "Then restart the web server / PHP.\n";
    exit(1);
}
echo "OK: PHP Zip extension found.\n";

if (!class_exists('PhpOffice\PhpWord\TemplateProcessor')) {
    echo "FAIL: PHPWord TemplateProcessor class not found. Run: composer require phpoffice/phpword\n";
    exit(1);
}
echo "OK: PHPWord TemplateProcessor found.\n";

try {
    $tp = new \PhpOffice\PhpWord\TemplateProcessor($templatePath);
    $tp->setValue('forName', 'Test Name');
    $tp->setValue('dateTime', 'Jan 23, 2025');
    $out = __DIR__ . '/storage/app/test_export_output.docx';
    $tp->saveAs($out);
    echo "OK: Export succeeded. Output: $out\n";
    @unlink($out);
} catch (Throwable $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
    exit(1);
}

echo "All checks passed. Test the full export in the app: View document -> Export as Word.\n";
