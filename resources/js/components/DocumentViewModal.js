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
    const [exportLoading, setExportLoading] = useState(false);
    const [exportError, setExportError] = useState(null);
    const [viewMode, setViewMode] = useState('pdf');
    const [pdfViewUrl, setPdfViewUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(null);
    const measureRef = useRef(null);
    const measureWrapperRef = useRef(null);
    const headerRef = useRef(null);
    const footerRef = useRef(null);
    const pageHeightRef = useRef(null);
    const exportInProgressRef = useRef(false);
    const pdfViewUrlRef = useRef(null);
    const pdfCacheRef = useRef(Object.create(null)); // reportId -> blob URL for instant reopen
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

    useEffect(() => {
        pdfViewUrlRef.current = pdfViewUrl;
    }, [pdfViewUrl]);

    useEffect(() => {
        if (!isOpen) {
            exportInProgressRef.current = false;
            if (pdfViewUrlRef.current) {
                URL.revokeObjectURL(pdfViewUrlRef.current);
                pdfViewUrlRef.current = null;
            }
            setPdfViewUrl(null);
            setPdfError(null);
            setPdfLoading(false);
            const cache = pdfCacheRef.current;
            Object.keys(cache).forEach((id) => {
                try { URL.revokeObjectURL(cache[id]); } catch (_) {}
            });
            pdfCacheRef.current = Object.create(null);
        }
    }, [isOpen]);

    // Lock background scroll when modal is open (html, body, and main content area)
    useEffect(() => {
        if (!isOpen) return;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        const root = document.documentElement;
        const body = document.body;
        root.classList.add('document-modal-open');
        body.classList.add('document-modal-open');
        body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
        return () => {
            root.classList.remove('document-modal-open');
            body.classList.remove('document-modal-open');
            body.style.paddingRight = '';
        };
    }, [isOpen]);

    // When modal opens with a report, show cached PDF immediately if available, then fetch for latest.
    // For form preview (no report.id), use a content-based cache key so added rows (e.g. endorsed items) get a fresh PDF.
    useEffect(() => {
        if (!isOpen || !report) return;
        const id = report?.id ?? reportId ?? `form-${report?.endorsedItemsRows?.length ?? 0}-${report?.attendanceItems?.length ?? 0}-${report?.otherAdminRows?.length ?? 0}`;
        setViewMode('pdf');
        setPdfError(null);
        const reportPayload = {
            ...report,
            alertStatus: report.alertStatus || report.status || 'WHITE ALERT'
        };
        const cached = pdfCacheRef.current[id];
        if (cached) {
            setPdfViewUrl(cached);
            setPdfLoading(false);
        } else {
            setPdfLoading(true);
            setPdfViewUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
        }
        fetch('/api/adr/export-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/pdf', 'X-Requested-With': 'XMLHttpRequest' },
            body: JSON.stringify({ report: reportPayload })
        })
            .then((res) => {
                if (!res.ok) return res.text().then((t) => { throw new Error(res.status === 503 ? 'PDF preview requires LibreOffice.' : t || 'Failed to load PDF'); });
                return res.blob();
            })
            .then((blob) => {
                if (blob.type && blob.type.includes('pdf')) {
                    const url = URL.createObjectURL(blob);
                    const old = pdfCacheRef.current[id];
                    if (old) try { URL.revokeObjectURL(old); } catch (_) {}
                    pdfCacheRef.current[id] = url;
                    setPdfViewUrl(url);
                    setPdfError(null);
                } else {
                    setPdfError('Unexpected response.');
                }
            })
            .catch((err) => {
                setPdfError(err.message || 'Could not load PDF preview.');
            })
            .finally(() => setPdfLoading(false));
    }, [isOpen, report?.id, reportId]);

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

    const handleExportWord = () => {
        if (!report) return;
        if (exportInProgressRef.current) return;
        exportInProgressRef.current = true;
        setExportError(null);
        setExportLoading(true);
        const reportPayload = {
            ...report,
            alertStatus: report.alertStatus || report.status || 'WHITE ALERT'
        };
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/api/adr/export-docx';
        form.target = '_self';
        form.style.display = 'none';
        form.setAttribute('accept-charset', 'UTF-8');
        const input = document.createElement('input');
        input.name = 'report';
        input.type = 'hidden';
        input.value = JSON.stringify(reportPayload);
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        form.remove();
        setExportLoading(false);
        exportInProgressRef.current = false;
    };

    const handleExportPdf = async () => {
        if (!report) return;
        if (exportInProgressRef.current) return;
        exportInProgressRef.current = true;
        setExportError(null);
        setExportLoading(true);
        const reportPayload = {
            ...report,
            alertStatus: report.alertStatus || report.status || 'WHITE ALERT'
        };
        try {
            const res = await fetch('/api/adr/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/pdf', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ report: reportPayload })
            });
            const contentType = res.headers.get('Content-Type') || '';
            if (!res.ok) {
                const text = await res.text();
                let msg = res.status === 503 ? 'PDF export requires LibreOffice. Install LibreOffice and set LIBREOFFICE_PATH if needed.' : (res.status === 422 ? 'No report data.' : 'Export failed.');
                try {
                    const j = JSON.parse(text);
                    if (j && j.error) msg = j.error;
                } catch (_) {}
                setExportError(msg);
                setExportLoading(false);
                exportInProgressRef.current = false;
                return;
            }
            if (contentType.includes('application/pdf')) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                window.location.assign(url);
                URL.revokeObjectURL(url);
            } else {
                setExportError('Unexpected response from server.');
            }
        } catch (e) {
            setExportError(e.message || 'Export failed.');
        }
        setExportLoading(false);
        exportInProgressRef.current = false;
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
        // Show as bullets when checkbox was set OR when user used Enter (text has newlines) – only lines with real content become bullets
        const useBullets = asBullets || (text && text.includes('\n'));
        if (useBullets) {
            const skipAsBullet = ['and', 'or', 'the'];
            const items = text
                .split(/[;\n]/)
                .map(s => s.trim())
                .filter(s => s.length > 0 && !skipAsBullet.includes(s.toLowerCase()));
            if (items.length === 0) return '-';
            return (
                <ul className="document-viewer__task-list">
                    {items.map((item, i) => <li key={i}>{item}</li>)}
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
                                    <tr key={`attendance-${index}-${item.id ?? ''}`} data-break-point>
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
                                    <tr key={`reports-${index}-${item.id ?? ''}`} data-break-point>
                                        <td className="document-viewer__table-num">{index + 1}</td>
                                        <td className="document-viewer__table-report">
                                            {item.report?.trim() ? (
                                                <div className="document-viewer__report-text">
                                                    {item.report.split(/\n/).map((line, i) => (
                                                        line.trim() ? <div key={i}>{line.trim()}</div> : <br key={i} />
                                                    ))}
                                                </div>
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
                                    <li key={row.id || index}>{renderMultiline(row.concern, true)}</li>
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
                        <button onClick={handleExportWord} className="document-modal__print-btn" disabled={exportLoading || !report} title="Export as Word document">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {exportLoading ? 'Exporting…' : 'Export as Word'}
                        </button>
                        {exportError && <span className="document-modal__export-error" role="alert">{exportError}</span>}
                        <button onClick={onClose} className="document-modal__close-btn">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="document-modal__content">
                    {viewMode === 'pdf' && pdfViewUrl && (
                        <iframe
                            src={`${pdfViewUrl}#page=1`}
                            title="Document PDF"
                            className="document-modal__pdf-iframe"
                            style={{ width: '100%', height: '100%', minHeight: '70vh', border: 'none' }}
                        />
                    )}
                    {viewMode === 'pdf' && pdfLoading && !pdfViewUrl && (
                        <div className="document-modal__pdf-loading" aria-live="polite">
                            Loading PDF…
                        </div>
                    )}
                    {viewMode === 'pdf' && pdfError && !pdfLoading && (
                        <div className="document-modal__pdf-error">
                            <p>{pdfError}</p>
                            <button type="button" className="document-modal__pdf-show-layout" onClick={() => setViewMode('layout')}>
                                Show layout instead
                            </button>
                        </div>
                    )}
                    {viewMode === 'layout' && (
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
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

export default DocumentViewModal;
