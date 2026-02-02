import React, { useState, useEffect, useRef } from 'react';
import { useFormContext } from '../context/FormContext';
import HeaderDocument from './HeaderDocument';
import FooterDocument from './FooterDocument';

const PAGE_HEIGHT_MM = 297;

function DocumentViewModal({ isOpen, reportId, onClose }) {
    const { getReport } = useFormContext();
    const [report, setReport] = useState(null);
    
    const measureRef = useRef(null);
    const headerRef = useRef(null);
    const footerRef = useRef(null);
    const pageHeightRef = useRef(null);
    const [totalPages, setTotalPages] = useState(1);
    const [pageHeightPx, setPageHeightPx] = useState(null);
    const [contentAreaHeightPx, setContentAreaHeightPx] = useState(null);
    const [pageRanges, setPageRanges] = useState([]);

    useEffect(() => {
        if (isOpen && reportId) {
            const foundReport = getReport(reportId);
            setReport(foundReport);
        } else {
            setReport(null);
        }
    }, [isOpen, reportId, getReport]);

    const updatePages = () => {
        if (!measureRef.current || !pageHeightRef.current || !headerRef.current || !footerRef.current) return;
        const measureWrapper = measureRef.current;
        const contentEl = measureWrapper.querySelector('.document-viewer__content');
        if (!contentEl) return;
        
        const bodyHeight = contentEl.offsetHeight;
        const pH = pageHeightRef.current.offsetHeight;
        const headerH = headerRef.current.offsetHeight;
        const footerH = footerRef.current.offsetHeight;
        // Buffer so content never cuts into footer; enough for padding + line + borders
        const footerPaddingBuffer = 35;
        const contentArea = Math.max(1, pH - headerH - footerH - footerPaddingBuffer);
        if (pH <= 0) return;

        const breakEls = contentEl.querySelectorAll('[data-break-point]');
        const contentRect = contentEl.getBoundingClientRect();
        const breakSet = new Set([0]);
        breakEls.forEach((el) => {
            const elRect = el.getBoundingClientRect();
            // Add buffer so full row/element shows; avoid any partial cut at bottom
            const bottom = Math.round(elRect.bottom - contentRect.top) + 6;
            if (bottom > 0 && bottom < bodyHeight) breakSet.add(bottom);
        });
        breakSet.add(bodyHeight);
        const breakPoints = [...breakSet].sort((a, b) => a - b);

        const ranges = [];
        let start = 0;
        while (start < bodyHeight) {
            const candidates = breakPoints.filter((b) => b > start && b <= start + contentArea);
            const end = candidates.length
                ? Math.max(...candidates)
                : Math.min(start + contentArea, bodyHeight);
            const actualEnd = Math.max(end, start + 1);
            ranges.push({ start, end: actualEnd });
            start = actualEnd;
        }
        if (ranges.length === 0) ranges.push({ start: 0, end: bodyHeight });

        setPageHeightPx(pH);
        setContentAreaHeightPx(contentArea);
        setTotalPages(ranges.length);
        setPageRanges(ranges);
    };

    useEffect(() => {
        if (!report) return;
        const timer = setTimeout(updatePages, 100);
        return () => clearTimeout(timer);
    }, [report]);

    useEffect(() => {
        if (!report) return;
        const observer = new ResizeObserver(updatePages);
        if (measureRef.current) observer.observe(measureRef.current);
        if (pageHeightRef.current) observer.observe(pageHeightRef.current);
        return () => observer.disconnect();
    }, [report]);

    const handlePrint = () => {
        window.print();
    };

    const dash = (val) => (val && String(val).trim() !== '') ? val : '-';

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
                                                <ul className="document-viewer__task-list">
                                                    {item.task.split(/[;\n]/).map((task, i) => (
                                                        task.trim() ? <li key={i}>{task.trim()}</li> : null
                                                    ))}
                                                </ul>
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
                                            <td>{dash(row.particulars)}</td>
                                            <td className="document-viewer__table-items">{row.noOfItems !== undefined && row.noOfItems !== null && row.noOfItems !== '' ? row.noOfItems : '-'}</td>
                                            <td>{dash(row.contact)}</td>
                                            <td>{dash(row.status)}</td>
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
                                            <td>{dash(row.particulars)}</td>
                                            <td className="document-viewer__table-items">{row.noOfItems !== undefined && row.noOfItems !== null && row.noOfItems !== '' ? row.noOfItems : '-'}</td>
                                            <td>{dash(row.status)}</td>
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
                            <ul className="document-viewer__admin-list">
                                {report.otherAdminRows.map((row, index) => (
                                    <li key={row.id || index}>{dash(row.concern)}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="document-viewer__subsection" data-break-point>
                        <p className="document-viewer__admin-text">1. The following were endorsed to incoming Operations Duty Staff:</p>
                        {report.endorsedItemsRows && report.endorsedItemsRows.length > 0 && (
                            <ol className="document-viewer__endorsed-list">
                                {report.endorsedItemsRows.map((row, index) => (
                                    <li key={row.id || index}>{dash(row.item)}</li>
                                ))}
                            </ol>
                        )}
                        <p className="document-viewer__admin-text">2. For information of the OCD Officer-In-Charge.</p>
                    </div>
                </div>

                <div className="document-viewer__signatures" data-break-point>
                    <div className="document-viewer__signature-row">
                        <div className="document-viewer__signature-item">
                            <div className="document-viewer__signature-label">Prepared by:</div>
                            <div className="document-viewer__signature-name">{dash(report.preparedBy)}</div>
                            <div className="document-viewer__signature-position">{dash(report.preparedPosition)}</div>
                        </div>
                        <div className="document-viewer__signature-item">
                            <div className="document-viewer__signature-label">Received by:</div>
                            <div className="document-viewer__signature-name">{dash(report.receivedBy)}</div>
                            <div className="document-viewer__signature-position">{dash(report.receivedPosition)}</div>
                        </div>
                    </div>
                    <div className="document-viewer__signature-item document-viewer__signature-item--full">
                        <div className="document-viewer__signature-label">Noted by:</div>
                        <div className="document-viewer__signature-name">{dash(report.notedBy)}</div>
                        <div className="document-viewer__signature-position">{dash(report.notedPosition)}</div>
                    </div>
                    <div className="document-viewer__signature-item document-viewer__signature-item--full">
                        <div className="document-viewer__signature-label">Approved:</div>
                        <div className="document-viewer__signature-name">{dash(report.approvedBy)}</div>
                        <div className="document-viewer__signature-position">{dash(report.approvedPosition)}</div>
                    </div>
                </div>
            </div>
        );
    };

    if (!isOpen || !report) return null;

    return (
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
                        <div className="document-viewer__measure document-viewer__measure--layout document-viewer__page--sheet" aria-hidden="true">
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
                                    style={{ height: `${PAGE_HEIGHT_MM}mm`, display: 'flex', flexDirection: 'column' }}
                                >
                                    <HeaderDocument compact />
                                    <div
                                        className="document-viewer__sheet-body"
                                        style={{
                                            flex: `0 0 ${height ?? contentAreaHeightPx ?? 0}px`,
                                            overflow: 'hidden',
                                            position: 'relative',
                                            minHeight: 0
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
                                    <div style={{ flex: '1 0 0' }} />
                                    <FooterDocument />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DocumentViewModal;
