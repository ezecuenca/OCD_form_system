<?php
/**
 * One-off script to check ADR_template.docx for placeholders.
 * Run: php check_template.php
 */
$templatePath = __DIR__ . '/resources/templates/ADR_template.docx';
if (!is_readable($templatePath)) {
    echo "Template not found: $templatePath\n";
    exit(1);
}
$zip = new ZipArchive();
if ($zip->open($templatePath, ZipArchive::RDONLY) !== true) {
    echo "Cannot open template as ZIP\n";
    exit(1);
}
$xml = $zip->getFromName('word/document.xml');
$zip->close();
if ($xml === false) {
    echo "No word/document.xml in template\n";
    exit(1);
}

$expected = [
    'scalars' => ['documentName', 'headerAddress', 'forName', 'forPosition', 'thruName', 'thruPosition', 'fromName', 'fromPosition', 'subject', 'dateTime', 'alertStatus', 'preparedBy', 'preparedPosition', 'receivedBy', 'receivedPosition', 'notedBy', 'notedPosition', 'approvedBy', 'approvedPosition'],
    'attendance' => ['ATT_NUM', 'ATT_NAME', 'ATT_TASK'],
    'reports' => ['REP_REPORT', 'REP_REMARKS'],
    'communication' => ['COMM_PARTICULARS', 'COMM_NO', 'COMM_CONTACT', 'COMM_STATUS'],
    'other_items' => ['OTH_PARTICULARS', 'OTH_NO', 'OTH_STATUS'],
    'other_admin' => ['ADM_CONCERN'],
    'endorsed' => ['END_ITEM'],
];

echo "=== ADR_template.docx placeholder check ===\n\n";

// Find any ${...} pattern in the XML (placeholders can be split across <w:t> so look for marker without $)
$found = [];
foreach ($expected as $group => $names) {
    foreach ($names as $name) {
        if (strpos($xml, $name) !== false) {
            $found[$group][] = $name;
        }
    }
}

// Also detect if ATT_NAME#2 or second row exists (should not)
$hasSecondAttRow = (strpos($xml, 'ATT_NAME#2') !== false) || (preg_match('/ATT_NAME.*ATT_NAME/', $xml) && substr_count($xml, 'ATT_NAME') > 2);
$hasAttNum = isset($found['attendance']) && in_array('ATT_NUM', $found['attendance']);

$missingScalars = array_diff($expected['scalars'], $found['scalars'] ?? []);
echo "Scalars found: " . (isset($found['scalars']) ? implode(', ', $found['scalars']) : 'none') . "\n";
if (!empty($missingScalars)) {
    echo "Scalars MISSING (add in template): " . implode(', ', $missingScalars) . "\n";
}
echo "Attendance placeholders: " . (isset($found['attendance']) ? implode(', ', $found['attendance']) : 'none') . "\n";
echo "ATT_NUM in template: " . ($hasAttNum ? 'yes' : 'NO (add ${ATT_NUM} in the row-number column)') . "\n";
echo "Extra ATT row (#2) in template: " . ($hasSecondAttRow ? 'YES - remove extra row with #2' : 'no (OK)') . "\n";
echo "Reports: " . (isset($found['reports']) ? implode(', ', $found['reports']) : 'none') . "\n";
echo "Communication: " . (isset($found['communication']) ? implode(', ', $found['communication']) : 'none') . "\n";
echo "Other items: " . (isset($found['other_items']) ? implode(', ', $found['other_items']) : 'none') . "\n";
echo "Other admin: " . (isset($found['other_admin']) ? implode(', ', $found['other_admin']) : 'none') . "\n";
echo "Endorsed: " . (isset($found['endorsed']) ? implode(', ', $found['endorsed']) : 'none') . "\n";

// Count how many times ATT_NAME appears (if 2+, might be multiple rows)
$attNameCount = substr_count($xml, 'ATT_NAME');
echo "\nATT_NAME occurrence count: $attNameCount (expect 1 or 2 for one data row - 2 if #1 variant)\n";

echo "\nDone.\n";
