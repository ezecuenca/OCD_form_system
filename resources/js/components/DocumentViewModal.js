import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFormContext } from '../context/FormContext';
import HeaderDocument from './HeaderDocument';
import FooterDocument from './FooterDocument';

const PAGE_HEIGHT_MM = 297;
const PAGE_HEIGHT_PX_FALLBACK = Math.round((297 * 96) / 25.4);
const HEADER_HEIGHT_PX = 165;
const FOOTER_HEIGHT_PX = 100;
const CONTENT_AREA_FALLBACK = PAGE_HEIGHT_PX_FALLBACK - HEADER_HEIGHT_PX - FOOTER_HEIGHT_PX;

function getBreakPoints(contentEl, bodyHeight) {
    if (!contentEl || bodyHeight <= 0) return [0, bodyHeight];
    const contentRect = contentEl.getBoundingClientRect();
    const breakSet = new Set([0]);
    contentEl.querySelectorAll('[data-break-point]').forEach((el) => {
        const elRect = el.getBoundingClientRect();
        const top = Math.round(elRect.top - contentRect.top);
        const bottom = Math.round(elRect.bottom - contentRect.top) + 6;
        if (top > 0 && top < bodyHeight) breakSet.add(top);
        if (bottom > 0 && bottom < bodyHeight) breakSet.add(bottom);
    });
    breakSet.add(bodyHeight);
    return [...breakSet].sort((a, b) => a - b);
}

function computePageRanges(bodyHeight, contentArea, breakPoints) {
    if (bodyHeight <= 0 || contentArea <= 0) return [{ start: 0, end: bodyHeight }];
    const minFillRatio = 0.5;
    const ranges = [];
    let start = 0;
    while (start < bodyHeight) {
        const candidates = breakPoints.filter((b) => b > start && b <= start + contentArea);
        let end = candidates.length ? Math.max(...candidates) : Math.min(start + contentArea, bodyHeight);
        if (candidates.length > 0 && (end - start) < contentArea * minFillRatio) {
            const nextCandidates = breakPoints.filter((b) => b > end && b <= start + contentArea);
            if (nextCandidates.length > 0) end = Math.max(...nextCandidates);
        }
        const actualEnd = Math.max(end, start + 1);
        ranges.push({ start, end: actualEnd });
        start = actualEnd;
    }
    if (ranges.length === 0) ranges.push({ start: 0, end: bodyHeight });
    return ranges;
}

function DocumentViewModal({ isOpen, reportId, report: reportProp, onClose }) {
    const { getReport } = useFormContext();
    const [reportFromId, setReportFromId] = useState(null);
    const measureRef = useRef(null);
    const measureWrapperRef = useRef(null);
    const headerRef = useRef(null);
    const footerRef = useRef(null);
    const pageHeightRef = useRef(null);
    const [totalPages, setTotalPages] = useState(1);
    const [pageHeightPx, setPageHeightPx] = useState(null);
    const [contentAreaHeightPx, setContentAreaHeightPx] = useState(null);
    const [pageRanges, setPageRanges] = useState([]);

    const report = reportProp != null ? reportProp : reportFromId;

    useEffect(() => {
        if (isOpen && reportId && reportProp == null) {
            const foundReport = getReport(reportId);
            setReportFromId(foundReport);
        } else {
            setReportFromId(null);
        }
    }, [isOpen, reportId, reportProp, getReport]);

    const updatePages = () => {
        if (!measureRef.current) return;
        const measureWrapper = measureRef.current;
        const contentEl = measureWrapper.querySelector('.document-viewer__content');
        if (!contentEl) return;

        const docRoot = document.querySelector('.document-modal .document-viewer__document');
        const visibleContent = docRoot?.querySelector('.document-viewer__page--sheet:not(.document-viewer__measure) .document-viewer__page-slice .document-viewer__content');
        const fromMeasure = Math.max(contentEl.scrollHeight || 0, contentEl.offsetHeight || 0);
        const fromVisible = visibleContent ? Math.max(visibleContent.scrollHeight || 0, visibleContent.offsetHeight || 0) : 0;
        const bodyHeight = Math.max(fromMeasure, fromVisible, 1);

        const pH = pageHeightRef.current?.offsetHeight ?? 0;
        const pageHeight = pH > 0 ? pH : PAGE_HEIGHT_PX_FALLBACK;
        const contentArea = Math.max(1, pageHeight - HEADER_HEIGHT_PX - FOOTER_HEIGHT_PX);
        if (pageHeight <= 0) return;

        const breakPoints = getBreakPoints(contentEl, bodyHeight);
        const ranges = computePageRanges(bodyHeight, contentArea, breakPoints);

        setPageHeightPx(pageHeight);
        setContentAreaHeightPx(contentArea);
        setTotalPages(ranges.length);
        setPageRanges(ranges);
    };

    useEffect(() => {
        if (!report) return;
        const t1 = setTimeout(updatePages, 50);
        const t2 = setTimeout(updatePages, 250);
        const t3 = setTimeout(updatePages, 600);
        const t4 = setTimeout(updatePages, 1200);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [report]);

    useEffect(() => {
        if (!report) return;
        const observer = new ResizeObserver(updatePages);
        if (measureRef.current) observer.observe(measureRef.current);
        if (measureWrapperRef.current) observer.observe(measureWrapperRef.current);
        if (pageHeightRef.current) observer.observe(pageHeightRef.current);
        return () => observer.disconnect();
    }, [report]);

    const handlePrint = () => {
        const docRoot = document.querySelector('.document-modal .document-viewer__document');
        const measureContent = docRoot?.querySelector('.document-viewer__measure .document-viewer__content');
        const firstSheet = docRoot?.querySelector('.document-viewer__page--sheet:not(.document-viewer__measure)');
        const contentSource = measureContent || firstSheet?.querySelector('.document-viewer__page-slice .document-viewer__content');
        if (!contentSource || !firstSheet) {
            updatePages();
            setTimeout(() => window.print(), 300);
            return;
        }
        const bodyHeight = Math.max(contentSource.scrollHeight, contentSource.offsetHeight, 1);
        const contentArea = Math.max(1, CONTENT_AREA_FALLBACK);
        const breakPoints = getBreakPoints(contentSource, bodyHeight);
        const ranges = computePageRanges(bodyHeight, contentArea, breakPoints);
        const headerEl = firstSheet.querySelector('.header-document');
        const footerEl = firstSheet.querySelector('.footer-document');
        const headerHTML = headerEl ? headerEl.outerHTML : '';
        const footerHTML = footerEl ? footerEl.outerHTML : '';
        const contentHTML = contentSource.innerHTML;
        const stylesheetLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .map((l) => l.href)
            .filter((href) => href && (href.startsWith('http') || href.startsWith('//')));
        if (stylesheetLinks.length === 0) {
            stylesheetLinks.push(`${window.location.origin}/css/app.css`);
        }
        const styleTags = stylesheetLinks.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n');
        const SLICE_TOP_BUFFER_PX = 12;
        const pageBlocks = ranges.map((range, index) => {
            const SLICE_SAFETY_PX = 8;
            const startAdjusted = index > 0 ? Math.max(0, range.start - SLICE_TOP_BUFFER_PX) : range.start;
            const sliceHeightPx = range.end - startAdjusted;
            const sliceHeightCapped = Math.min(sliceHeightPx, Math.max(1, contentArea - SLICE_SAFETY_PX));
            return `
            <div class="document-viewer__page document-viewer__page--sheet document-viewer__page--print" style="display:flex;flex-direction:column;position:relative;height:${PAGE_HEIGHT_MM}mm;box-sizing:border-box;padding-left:0.5in;overflow:hidden;">
                <div class="page-header-fixed" style="flex:0 0 ${HEADER_HEIGHT_PX}px;max-height:${HEADER_HEIGHT_PX}px;overflow:hidden;">${headerHTML}</div>
                <div class="page-content-area" style="flex:1 1 0;min-height:0;overflow:hidden;position:relative;">
                    <div class="document-viewer__sheet-body" style="height:${sliceHeightCapped}px;max-height:100%;overflow:hidden;position:relative;">
                        <div class="document-viewer__page-slice" style="transform:translateY(-${startAdjusted}px);position:relative;width:100%;">
                            <div class="document-viewer__content document-viewer__content--compact">${contentHTML}</div>
                        </div>
                    </div>
                </div>
                <div class="page-footer-fixed" style="flex:0 0 ${FOOTER_HEIGHT_PX}px;max-height:${FOOTER_HEIGHT_PX}px;overflow:hidden;">${footerHTML}</div>
            </div>`;
        }).join('');
        const printDoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<base href="${window.location.origin}/">
<title>RDRRMC Duty Report</title>
${styleTags}
<style>
@page{size:210mm 297mm;margin:0;}
*,*::before,*::after{box-sizing:border-box;}
html,body{margin:0!important;padding:0!important;background:#fff!important;font-family:Arial,sans-serif!important;width:210mm!important;}
body.document-print-source{max-width:210mm!important;margin:0 auto!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
.document-viewer__document{width:210mm!important;max-width:210mm!important;margin:0 auto!important;padding:0!important;background:white!important;}
.document-viewer__page--sheet{
    position:relative!important;
    height:297mm!important;
    min-height:297mm!important;
    max-height:297mm!important;
    width:210mm!important;
    margin:0!important;
    padding-left:0.5in!important;
    box-sizing:border-box!important;
    overflow:hidden!important;
    page-break-after:always!important;
    page-break-inside:avoid!important;
    background:white;
}
.document-viewer__page--sheet:last-child{page-break-after:auto!important;}
.document-viewer__page--print.document-viewer__page--sheet{display:flex!important;flex-direction:column!important;}
.document-viewer__page--print .page-header-fixed{
    position:relative!important;top:auto!important;left:auto!important;right:auto!important;
    flex:0 0 165px!important;max-height:165px!important;overflow:hidden!important;width:100%!important;z-index:10!important;
}
.document-viewer__page--print .page-content-area{
    flex:1 1 0!important;min-height:0!important;
    height:calc(297mm - 165px - 100px)!important;
    max-height:calc(297mm - 165px - 100px)!important;
    overflow:hidden!important;
}
.document-viewer__page--print .page-footer-fixed{
    position:relative!important;bottom:auto!important;left:auto!important;right:auto!important;
    flex:0 0 100px!important;max-height:100px!important;overflow:hidden!important;width:100%!important;z-index:10!important;
}
.page-header-fixed{
    position:absolute!important;
    top:0!important;
    left:0!important;
    right:0!important;
    width:100%!important;
    z-index:10!important;
}
.page-header-fixed .header-document{
    padding:0.3in 0.6in 0.28in!important;
}
.page-header-fixed .header-document__line{
    height:3px!important;background:#2563eb!important;margin:0.35rem auto 0.25rem!important;max-width:410px!important;
    -webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;
}
.page-header-fixed .header-document__republic,.page-header-fixed .header-document__department{font-size:9pt!important;}
.page-header-fixed .header-document__office{font-size:18pt!important;}
.page-header-fixed .header-document__region{font-size:14pt!important;}
.page-header-fixed .header-document__address{font-size:9pt!important;}
.page-content-area{
    position:relative!important;
    z-index:1!important;
    box-sizing:border-box!important;
}
.document-viewer__content--compact{padding:0.4in 0.5in!important;font-size:10pt!important;line-height:1.35!important;}
body.document-print-source .document-viewer__content--compact{padding-top:0.28in!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__title{font-size:11pt!important;margin-top:-0.3rem!important;margin-bottom:1rem!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__metadata{margin:0.6rem 0!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__field{margin-bottom:0.55rem!important;font-size:10.5pt!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__label{width:4.5rem!important;min-width:4.5rem!important;font-size:10.5pt!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__value,
body.document-print-source .document-viewer__content--compact .document-viewer__name,
body.document-print-source .document-viewer__content--compact .document-viewer__position,
body.document-print-source .document-viewer__content--compact .document-viewer__subject{font-size:11pt!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__divider{margin:0.6rem 0!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__section{margin:0.5rem 0!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__section-title{font-size:9pt!important;margin-bottom:0.4rem!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__subsection{margin:0.5rem 0!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__subsection-title{font-size:9pt!important;margin-bottom:0.35rem!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__status-section,
body.document-print-source .document-viewer__content--compact .document-viewer__status-item{margin:0.35rem 0!important;font-size:9pt!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__admin-note,
body.document-print-source .document-viewer__content--compact .document-viewer__admin-text,
body.document-print-source .document-viewer__content--compact .document-viewer__admin-list,
body.document-print-source .document-viewer__content--compact .document-viewer__endorsed-list{font-size:9pt!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__legend{font-size:7.5pt!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__table{font-size:8pt!important;margin:0.25rem 0 0.65rem 0!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__table thead th,
body.document-print-source .document-viewer__content--compact .document-viewer__table tbody td{padding:0.2rem!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__signatures{margin:1rem 0!important;gap:1rem 1.25rem!important;}
body.document-print-source .document-viewer__content--compact .document-viewer__signature-label{margin-bottom:4rem!important;}
.document-viewer__sheet-body{overflow:hidden!important;position:relative!important;}
.document-viewer__page-slice{position:relative!important;width:100%!important;}
.page-footer-fixed{
    position:absolute!important;
    bottom:0!important;
    left:0!important;
    right:0!important;
    width:100%!important;
    z-index:10!important;
}
.page-footer-fixed .footer-document{
    break-inside:avoid!important;
    page-break-inside:avoid!important;
    padding:0.2in 0.6in 0.2in!important;
    margin:0!important;
}
.document-viewer__page--print .page-footer-fixed .footer-document{padding:0.2in 0.6in 0.2in!important;}
.document-viewer__page--sheet .footer-document__line{height:2px!important;margin:0 0 0.25rem!important;background:#2563eb!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
.document-viewer__page--sheet .footer-document__slogan{margin:0 0 0.12rem!important;font-size:9pt!important;font-weight:bold!important;line-height:1.2!important;}
.document-viewer__page--sheet .footer-document__info{font-size:6.5pt!important;margin:0!important;line-height:1.25!important;}
.document-viewer__page--sheet .footer-document__info p{margin:0.06rem 0!important;}
.document-viewer__page--sheet .document-viewer__signature-item{page-break-inside:avoid!important;}
.document-viewer__page--sheet .document-viewer__signature-label{font-size:9pt!important;visibility:visible!important;display:block!important;min-height:1em!important;}
.document-viewer__page--sheet .document-viewer__signature-name{font-size:11pt!important;font-weight:bold!important;line-height:1!important;margin-bottom:0.15rem!important;}
.document-viewer__page--sheet .document-viewer__signature-position{font-size:9pt!important;line-height:1!important;margin-top:0!important;margin-bottom:0!important;}
.document-viewer__page--sheet .document-viewer__table tbody td,.document-viewer__page--sheet .document-viewer__table thead th{line-height:1!important;}
.document-viewer__page--sheet .document-viewer__table .document-viewer__task-list,.document-viewer__page--sheet .document-viewer__table .document-viewer__report-text{line-height:1!important;}
.document-viewer__page--sheet .document-viewer__table .document-viewer__task-list li{margin-bottom:0.1rem!important;line-height:1!important;}
.document-viewer__page--sheet .document-viewer__table .document-viewer__report-text div{margin-bottom:0.1rem!important;}
@media print{
html,body{margin:0!important;padding:0!important;}
.document-viewer__document{width:210mm!important;margin:0 auto!important;}
}
</style></head><body class="document-print-source"><div class="document-viewer__document">${pageBlocks}</div></body></html>`;
        const iframe = document.createElement('iframe');
        iframe.setAttribute('title', 'Print');
        iframe.style.cssText = 'position:absolute;left:-9999px;width:210mm;height:4000px;border:none;visibility:hidden;';
        document.body.appendChild(iframe);
        const iframeWin = iframe.contentWindow;
        iframeWin.document.open();
        iframeWin.document.write(printDoc);
        iframeWin.document.close();
        const doPrint = () => {
            try {
                iframeWin.print();
            } finally {
                document.body.removeChild(iframe);
            }
        };
        if (iframeWin.document.readyState === 'complete') {
            setTimeout(doPrint, 600);
        } else {
            iframeWin.onload = () => setTimeout(doPrint, 600);
        }
    };

    const dash = (val) => (val && String(val).trim() !== '') ? val : '-';

    const signatureNameDisplay = (report, slots) => {
        const seen = new Set();
        return slots.map((name) => {
            const n = name ? String(name).trim() : '';
            if (!n || n === '-') return dash(name);
            const key = n.toUpperCase();
            if (seen.has(key)) return '—';
            seen.add(key);
            return name;
        });
    };

    const renderMultiline = (text, asBullets) => {
        if (!text?.trim()) return '-';
        if (asBullets) {
            const items = text.split(/[;\n]/).filter(s => s.trim());
            if (items.length === 0) return '-';
            return (
                <ul className="document-viewer__task-list">
                    {items.map((item, i) => <li key={i}>{item.trim()}</li>)}
                </ul>
            );
        }
        return (
            <div className="document-viewer__report-text">
                {text.split(/\n/).map((line, i) => (
                    line.trim() ? <div key={i}>{line.trim()}</div> : <br key={i} />
                ))}
            </div>
        );
    };

    const renderBodyContent = () => {
        if (!report) return null;

        return (
            <div className="document-viewer__content document-viewer__content--compact">
                <h2 className="document-viewer__title" data-break-point>RDRRMC DUTY REPORT</h2>
                
                <div className="document-viewer__metadata" data-break-point>
                    <div className="document-viewer__field">
                        <span className="document-viewer__label">FOR</span>
                        <span className="document-viewer__colon">:</span>
                        <div className="document-viewer__value">
                            <div className="document-viewer__name">{dash(report.forName)}</div>
                            {report.forPosition?.trim() ? report.forPosition.split('\n').map((line, index) => (
                                line.trim() ? <div key={index} className="document-viewer__position">{line.trim()}</div> : null
                            )) : <div className="document-viewer__position">-</div>}
                        </div>
                    </div>
                    <div className="document-viewer__field">
                        <span className="document-viewer__label">THRU</span>
                        <span className="document-viewer__colon">:</span>
                        <div className="document-viewer__value">
                            <div className="document-viewer__name">{dash(report.thruName)}</div>
                            {report.thruPosition?.trim() ? report.thruPosition.split('\n').map((line, index) => (
                                line.trim() ? <div key={index} className="document-viewer__position">{line.trim()}</div> : null
                            )) : <div className="document-viewer__position">-</div>}
                        </div>
                    </div>
                    <div className="document-viewer__field">
                        <span className="document-viewer__label">FROM</span>
                        <span className="document-viewer__colon">:</span>
                        <div className="document-viewer__value">
                            <div className="document-viewer__name">{dash(report.fromName)}</div>
                            {report.fromPosition?.trim() ? report.fromPosition.split('\n').map((line, index) => (
                                line.trim() ? <div key={index} className="document-viewer__position">{line.trim()}</div> : null
                            )) : <div className="document-viewer__position">-</div>}
                        </div>
                    </div>
                    <div className="document-viewer__field">
                        <span className="document-viewer__label">SUBJECT</span>
                        <span className="document-viewer__colon">:</span>
                        <div className="document-viewer__value">
                            <div className="document-viewer__subject">
                                {report.subject?.trim() ? (
                                    <span>{report.subject} <span className="document-viewer__datetime-bold">{dash(report.dateTime)}</span></span>
                                ) : (
                                    <span> After Duty Report for the Period Covered <span className="document-viewer__datetime-bold">{dash(report.dateTime)}</span></span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="document-viewer__divider" data-break-point></div>

                <div className="document-viewer__status-section" data-break-point>
                    <div className="document-viewer__status-item">
                        <span className="document-viewer__status-number">1.</span>
                        <span className="document-viewer__status-text">
                            RDRRMC Operations Center is on <span className="document-viewer__status-alert">{dash(report.alertStatus) === '-' ? 'WHITE ALERT' : report.alertStatus}</span>.
                        </span>
                    </div>
                </div>

                {report.attendanceItems && report.attendanceItems.length > 0 && (
                    <div className="document-viewer__section">
                        <h3 className="document-viewer__section-title" data-break-point>2. Attendance:</h3>
                        <table className="document-viewer__table">
                            <thead>
                                <tr>
                                    <th className="document-viewer__table-num"></th>
                                    <th className="document-viewer__table-name">Name</th>
                                    <th className="document-viewer__table-tasks">Tasks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.attendanceItems.map((item, index) => (
                                    <tr key={item.id || index} data-break-point>
                                        <td className="document-viewer__table-num">{index + 1}</td>
                                        <td className="document-viewer__table-name">{dash(item.name)}</td>
                                        <td className="document-viewer__table-tasks">
                                            {item.task?.trim() ? (
                                                item.taskAsBullets ? (
                                                    <ul className="document-viewer__task-list">
                                                        {item.task.split(/[;\n]/).map((task, i) => (
                                                            task.trim() ? <li key={i}>{task.trim()}</li> : null
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="document-viewer__report-text">
                                                        {item.task.split(/\n/).map((line, i) => (
                                                            line.trim() ? <div key={i}>{line.trim()}</div> : <br key={i} />
                                                        ))}
                                                    </div>
                                                )
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {report.reportsItems && report.reportsItems.length > 0 && (
                    <div className="document-viewer__section">
                        <h3 className="document-viewer__section-title" data-break-point>3. Reports and Advisories released and issued (NDRRMC Dashboard, Website, SMS, E-mail, Viber, social media)</h3>
                        <table className="document-viewer__table document-viewer__table--reports">
                            <thead>
                                <tr>
                                    <th className="document-viewer__table-num">#</th>
                                    <th className="document-viewer__table-report">Reports and Advisories released</th>
                                    <th className="document-viewer__table-remarks">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.reportsItems.map((item, index) => (
                                    <tr key={item.id || index} data-break-point>
                                        <td className="document-viewer__table-num">{index + 1}</td>
                                        <td className="document-viewer__table-report">
                                            {item.report?.trim() ? (
                                                item.reportAsBullets ? (
                                                    <ul className="document-viewer__task-list">
                                                        {item.report.split(/[;\n]/).map((line, i) => (
                                                            line.trim() ? <li key={i}>{line.trim()}</li> : null
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="document-viewer__report-text">
                                                        {item.report.split(/\n/).map((line, i) => (
                                                            line.trim() ? <div key={i}>{line.trim()}</div> : <br key={i} />
                                                        ))}
                                                    </div>
                                                )
                                            ) : '-'}
                                        </td>
                                        <td className="document-viewer__table-remarks">{dash(item.remarks)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="document-viewer__section">
                    <h3 className="document-viewer__section-title" data-break-point>4. Administrative Matters:</h3>
                    
                    {report.communicationRows && report.communicationRows.length > 0 && (
                        <div className="document-viewer__subsection">
                            <h4 className="document-viewer__subsection-title" data-break-point>A. Status of Communication Lines</h4>
                            <table className="document-viewer__table document-viewer__table--communication">
                                <thead>
                                    <tr>
                                        <th>Particulars</th>
                                        <th className="document-viewer__table-items">No. of Items</th>
                                        <th>Contact No. / Freq / Channel</th>
                                        <th>Status / Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.communicationRows.map((row, index) => (
                                        <tr key={row.id || index} data-break-point>
                                            <td>{renderMultiline(row.particulars, false)}</td>
                                            <td className="document-viewer__table-items">{row.noOfItems !== undefined && row.noOfItems !== null && row.noOfItems !== '' ? row.noOfItems : '-'}</td>
                                            <td>{renderMultiline(row.contact, row.contactAsBullets)}</td>
                                            <td>{renderMultiline(row.status, row.statusAsBullets)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="document-viewer__legend" data-break-point>Legend: Status - operational / non-operational / prepaid status of mobile phones</p>
                        </div>
                    )}

                    {report.otherItemsRows && report.otherItemsRows.length > 0 && (
                        <div className="document-viewer__subsection">
                            <h4 className="document-viewer__subsection-title" data-break-point>B. Status of Other Items</h4>
                            <table className="document-viewer__table document-viewer__table--other-items">
                                <thead>
                                    <tr>
                                        <th>Particulars</th>
                                        <th className="document-viewer__table-items">No. of Items</th>
                                        <th>Status / Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.otherItemsRows.map((row, index) => (
                                        <tr key={row.id || index} data-break-point>
                                            <td>{renderMultiline(row.particulars, false)}</td>
                                            <td className="document-viewer__table-items">{row.noOfItems !== undefined && row.noOfItems !== null && row.noOfItems !== '' ? row.noOfItems : '-'}</td>
                                            <td>{renderMultiline(row.status, row.statusAsBullets)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {report.otherAdminRows && report.otherAdminRows.length > 0 && (
                        <div className="document-viewer__subsection">
                            <h4 className="document-viewer__subsection-title" data-break-point>C. Other Administrative Matters:</h4>
                            <p className="document-viewer__admin-note" data-break-point>(List down administrative concerns such as but not limited to: Duty driver on-call, vehicle activities, internet or other ICT equipment issues, parcel or documents received/delivered, untoward incidents that should be elevated to the management level).</p>
                            <ul className="document-viewer__admin-list" data-break-point>
                                {report.otherAdminRows.map((row, index) => (
                                    <li key={row.id || index}>{renderMultiline(row.concern, false)}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="document-viewer__subsection">
                        <p className="document-viewer__admin-text" data-break-point>1. The following were endorsed to incoming Operations Duty Staff:</p>
                        {report.endorsedItemsRows && report.endorsedItemsRows.length > 0 && (
                            <ol className="document-viewer__endorsed-list">
                                {report.endorsedItemsRows.map((row, index) => (
                                    <li key={row.id || index} data-break-point>{renderMultiline(row.item, row.itemAsBullets)}</li>
                                ))}
                            </ol>
                        )}
                        <p className="document-viewer__admin-text" data-break-point>2. For information of the OCD Officer-In-Charge.</p>
                    </div>
                </div>

                {(() => {
                    const sigNames = signatureNameDisplay(report, [report.preparedBy, report.receivedBy, report.notedBy, report.approvedBy]);
                    return (
                <div className="document-viewer__signatures">
                    <div className="document-viewer__signature-row">
                        <div className="document-viewer__signature-item" data-break-point>
                            <div className="document-viewer__signature-label" data-break-point>Prepared by:</div>
                            <div className="document-viewer__signature-name">{sigNames[0]}</div>
                            <div className="document-viewer__signature-position">{dash(report.preparedPosition)}</div>
                        </div>
                        <div className="document-viewer__signature-item" data-break-point>
                            <div className="document-viewer__signature-label" data-break-point>Received by:</div>
                            <div className="document-viewer__signature-name">{sigNames[1]}</div>
                            <div className="document-viewer__signature-position">{dash(report.receivedPosition)}</div>
                        </div>
                    </div>
                    <div className="document-viewer__signature-item document-viewer__signature-item--full" data-break-point>
                        <div className="document-viewer__signature-label" data-break-point>Noted by:</div>
                        <div className="document-viewer__signature-name">{sigNames[2]}</div>
                        <div className="document-viewer__signature-position">{dash(report.notedPosition)}</div>
                    </div>
                    <div className="document-viewer__signature-item document-viewer__signature-item--full" data-break-point>
                        <div className="document-viewer__signature-label" data-break-point>Approved:</div>
                        <div className="document-viewer__signature-name">{sigNames[3]}</div>
                        <div className="document-viewer__signature-position">{dash(report.approvedPosition)}</div>
                    </div>
                </div>
                    );
                })()}
            </div>
        );
    };

    if (!isOpen || !report) return null;

    const modalContent = (
        <div className="document-modal">
            <div className="document-modal__overlay" onClick={onClose}></div>
            <div className="document-modal__container">
                <div className="document-modal__header">
                    <h2>Document Preview</h2>
                    <div className="document-modal__actions">
                        <button onClick={handlePrint} className="document-modal__print-btn">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 14h12v8H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Print / PDF
                        </button>
                        <button onClick={onClose} className="document-modal__close-btn">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="document-modal__content">
                    <div className="document-viewer__document">
                        <div ref={measureWrapperRef} className="document-viewer__measure document-viewer__measure--layout document-viewer__page--sheet" aria-hidden="true">
                            <HeaderDocument ref={headerRef} compact />
                            <div ref={measureRef}>{renderBodyContent()}</div>
                            <FooterDocument ref={footerRef} />
                        </div>
                        <div
                            ref={pageHeightRef}
                            className="document-viewer__page-height-ref"
                            style={{ height: `${PAGE_HEIGHT_MM}mm` }}
                            aria-hidden="true"
                        />

                        {Array.from({ length: totalPages }, (_, i) => {
                            const range = pageRanges[i];
                            const useRange = range && contentAreaHeightPx != null;
                            const height = useRange ? range.end - range.start : (contentAreaHeightPx ?? undefined);
                            const transform = useRange ? `translateY(-${range.start}px)` : (contentAreaHeightPx != null ? `translateY(-${i * contentAreaHeightPx}px)` : undefined);
                            
                            return (
                                <div
                                    key={i}
                                    className="document-viewer__page document-viewer__page--sheet"
                                    style={{ position: 'relative', width: '210mm', height: `${PAGE_HEIGHT_MM}mm`, overflow: 'hidden', boxSizing: 'border-box', paddingLeft: '0.5in' }}
                                >
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
                                        <HeaderDocument compact />
                                    </div>
                                    <div style={{ paddingTop: `${HEADER_HEIGHT_PX}px`, paddingBottom: `${FOOTER_HEIGHT_PX}px` }}>
                                        <div
                                            className="document-viewer__sheet-body"
                                            style={{
                                                height: `${height ?? contentAreaHeightPx ?? 0}px`,
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}
                                        >
                                            <div
                                                className="document-viewer__page-slice"
                                                style={{
                                                    transform: transform ?? 'translateY(0)',
                                                    position: 'relative',
                                                    width: '100%'
                                                }}
                                            >
                                                {renderBodyContent()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
                                        <FooterDocument />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

export default DocumentViewModal;
