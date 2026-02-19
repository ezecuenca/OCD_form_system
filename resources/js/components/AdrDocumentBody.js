import React from 'react';

function dash(val) {
    return (val != null && String(val).trim() !== '') ? val : '-';
}

function signatureNameDisplay(report, slots, emptyVal = '-') {
    const seen = new Set();
    const empty = emptyVal !== undefined ? emptyVal : dash(null);
    return slots.map((name) => {
        const n = name ? String(name).trim() : '';
        if (!n || n === '-') return empty;
        const key = n.toUpperCase();
        if (seen.has(key)) return '—';
        seen.add(key);
        return name;
    });
}

function signatureNameWithBreaks(name, emptyDisplay = '-') {
    if (name == null || name === '—' || name === '-' || String(name).trim() === '') return emptyDisplay;
    const s = String(name).trim();
    if (!s) return emptyDisplay;
    if (s.includes('\n')) {
        return (
            <span className="document-viewer__signature-name-multiline">
                {s.split('\n').map((line, i) => (
                    <span key={i} className="document-viewer__signature-name-line">{line.trim() || '\u00A0'}</span>
                ))}
            </span>
        );
    }
    return s;
}

/** Strip leading hyphen and/or "1.1 ", "1.2 ", etc. so list numbering is not duplicated and no stray hyphen shows. */
function stripEndorsedNumber(item) {
    if (item == null || typeof item !== 'string') return item;
    const s = item
        .replace(/^\s*(-\s*)?(1\.\d+\s*)?/i, '')
        .trim();
    return s || item.trim();
}

function renderMultiline(text, asBullets) {
    if (!text?.trim()) return '-';
    const useBullets = asBullets || (text && text.includes('\n'));
    if (useBullets) {
        const skipAsBullet = ['and', 'or', 'the'];
        const items = text
            .split(/[;\n]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !skipAsBullet.includes(s.toLowerCase()));
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
}

/**
 * Renders the ADR document body (same structure as ADR_template).
 * Pass a report object; use getBlankAdrReport() for template preview with all fields blank.
 * When blankPlaceholders is true, empty fields show nothing (no "-").
 */
function AdrDocumentBody({ report, blankPlaceholders = false }) {
    if (!report) return null;

    const blank = (val) => (val != null && String(val).trim() !== '') ? val : (blankPlaceholders ? '' : '-');
    const dash = blankPlaceholders ? blank : ((val) => (val != null && String(val).trim() !== '') ? val : '-');
    const emptyDisplay = blankPlaceholders ? '' : '-';

    const sigNames = signatureNameDisplay(report, [report.preparedBy, report.receivedBy, report.notedBy, report.approvedBy], emptyDisplay);

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
                        )) : <div className="document-viewer__position">{emptyDisplay}</div>}
                    </div>
                </div>
                <div className="document-viewer__field">
                    <span className="document-viewer__label">THRU</span>
                    <span className="document-viewer__colon">:</span>
                    <div className="document-viewer__value">
                        <div className="document-viewer__name">{dash(report.thruName)}</div>
                        {report.thruPosition?.trim() ? report.thruPosition.split('\n').map((line, index) => (
                            line.trim() ? <div key={index} className="document-viewer__position">{line.trim()}</div> : null
                        )) : <div className="document-viewer__position">{emptyDisplay}</div>}
                    </div>
                </div>
                <div className="document-viewer__field">
                    <span className="document-viewer__label">FROM</span>
                    <span className="document-viewer__colon">:</span>
                    <div className="document-viewer__value">
                        <div className="document-viewer__name">{dash(report.fromName)}</div>
                        {report.fromPosition?.trim() ? report.fromPosition.split('\n').map((line, index) => (
                            line.trim() ? <div key={index} className="document-viewer__position">{line.trim()}</div> : null
                        )) : <div className="document-viewer__position">{emptyDisplay}</div>}
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
                        {report.attendanceItems && report.attendanceItems.length > 0 ? report.attendanceItems.map((item, index) => (
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
                                    ) : emptyDisplay}
                                </td>
                            </tr>
                        )) : (
                            <tr data-break-point>
                                <td className="document-viewer__table-num"></td>
                                <td className="document-viewer__table-name">{emptyDisplay}</td>
                                <td className="document-viewer__table-tasks">{emptyDisplay}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                        {report.reportsItems && report.reportsItems.length > 0 ? report.reportsItems.map((item, index) => (
                            <tr key={`reports-${index}-${item.id ?? ''}`} data-break-point>
                                <td className="document-viewer__table-num">{index + 1}</td>
                                <td className="document-viewer__table-report" style={{ textAlign: item.alignReport || 'left' }}>
                                    {item.report?.trim() ? (
                                        <div className="document-viewer__report-text">
                                            {item.report
                                                .split(/\n/)
                                                .map((line) => line.trim())
                                                .filter((line) => line !== '')
                                                .map((line, i) => (
                                                    <div key={i}>{line}</div>
                                                ))}
                                        </div>
                                    ) : emptyDisplay}
                                </td>
                                <td className="document-viewer__table-remarks" style={{ textAlign: item.alignRemarks || 'left' }}>{dash(item.remarks)}</td>
                            </tr>
                        )) : (
                            <tr data-break-point>
                                <td className="document-viewer__table-num">1</td>
                                <td className="document-viewer__table-report">{emptyDisplay}</td>
                                <td className="document-viewer__table-remarks">{emptyDisplay}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="document-viewer__section">
                <h3 className="document-viewer__section-title" data-break-point>4. Administrative Matters:</h3>

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
                            {report.communicationRows && report.communicationRows.length > 0 ? report.communicationRows.map((row, index) => (
                                <tr key={row.id || index} data-break-point>
                                    <td>{renderMultiline(row.particulars, false)}</td>
                                    <td className="document-viewer__table-items">{row.noOfItems !== undefined && row.noOfItems !== null && row.noOfItems !== '' ? row.noOfItems : emptyDisplay}</td>
                                    <td>{renderMultiline(row.contact, row.contactAsBullets)}</td>
                                    <td>{renderMultiline(row.status, row.statusAsBullets)}</td>
                                </tr>
                            )) : (
                                <tr data-break-point>
                                    <td>{emptyDisplay}</td>
                                    <td className="document-viewer__table-items">{emptyDisplay}</td>
                                    <td>{emptyDisplay}</td>
                                    <td>{emptyDisplay}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <p className="document-viewer__legend" data-break-point>Legend: Status - operational / non-operational / prepaid status of mobile phones</p>
                </div>

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
                            {report.otherItemsRows && report.otherItemsRows.length > 0 ? report.otherItemsRows.map((row, index) => (
                                <tr key={row.id || index} data-break-point>
                                    <td>{renderMultiline(row.particulars, false)}</td>
                                    <td className="document-viewer__table-items">{row.noOfItems !== undefined && row.noOfItems !== null && row.noOfItems !== '' ? row.noOfItems : emptyDisplay}</td>
                                    <td>{renderMultiline(row.status, row.statusAsBullets)}</td>
                                </tr>
                            )) : (
                                <tr data-break-point>
                                    <td>{emptyDisplay}</td>
                                    <td className="document-viewer__table-items">{emptyDisplay}</td>
                                    <td>{emptyDisplay}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="document-viewer__subsection">
                    <h4 className="document-viewer__subsection-title" data-break-point>C. Other Administrative Matters:</h4>
                    <p className="document-viewer__admin-note" data-break-point>(List down administrative concerns such as but not limited to: Duty driver on-call, vehicle activities, internet or other ICT equipment issues, parcel or documents received/delivered, untoward incidents that should be elevated to the management level).</p>
                    {report.otherAdminRows && report.otherAdminRows.length > 0 ? (
                        <ul className="document-viewer__admin-list" data-break-point>
                            {report.otherAdminRows.map((row, index) => (
                                <li key={row.id || index}>{renderMultiline(row.concern, true)}</li>
                            ))}
                        </ul>
                    ) : null}
                </div>

                <div className="document-viewer__subsection">
                    <p className="document-viewer__admin-text" data-break-point>1. The following were endorsed to incoming Operations Duty Staff:</p>
                    {report.endorsedItemsRows && report.endorsedItemsRows.length > 0 ? (
                        <ol className="document-viewer__endorsed-list">
                            {report.endorsedItemsRows
                                .filter((row) => (row.item || '').trim() !== '')
                                .map((row, index) => {
                                    const stripped = stripEndorsedNumber(row.item);
                                    const isEmpty = !stripped || stripped.trim() === '-';
                                    return (
                                        <li key={row.id || index} data-break-point>
                                            {!isEmpty ? renderMultiline(stripped, row.itemAsBullets) : '\u00A0'}
                                        </li>
                                    );
                                })}
                        </ol>
                    ) : null}
                    <p className="document-viewer__admin-text" data-break-point>2. For information of the OCD Officer-In-Charge.</p>
                </div>
            </div>

            <div className="document-viewer__signatures">
                <div className="document-viewer__signature-row">
                    <div className="document-viewer__signature-item" data-break-point>
                        <div className="document-viewer__signature-label" data-break-point>Prepared by:</div>
                        <div className="document-viewer__signature-name">{signatureNameWithBreaks(sigNames[0], emptyDisplay)}</div>
                        <div className="document-viewer__signature-position">{dash(report.preparedPosition)}</div>
                    </div>
                    <div className="document-viewer__signature-item" data-break-point>
                        <div className="document-viewer__signature-label" data-break-point>Received by:</div>
                        <div className="document-viewer__signature-name">{signatureNameWithBreaks(sigNames[1], emptyDisplay)}</div>
                        <div className="document-viewer__signature-position">{dash(report.receivedPosition)}</div>
                    </div>
                </div>
                <div className="document-viewer__signature-item document-viewer__signature-item--full" data-break-point>
                    <div className="document-viewer__signature-label" data-break-point>Noted by:</div>
                    <div className="document-viewer__signature-name">{signatureNameWithBreaks(sigNames[2], emptyDisplay)}</div>
                    <div className="document-viewer__signature-position">{dash(report.notedPosition)}</div>
                </div>
                <div className="document-viewer__signature-item document-viewer__signature-item--full" data-break-point>
                    <div className="document-viewer__signature-label" data-break-point>Approved:</div>
                    <div className="document-viewer__signature-name">{signatureNameWithBreaks(sigNames[3], emptyDisplay)}</div>
                    <div className="document-viewer__signature-position">{dash(report.approvedPosition)}</div>
                </div>
            </div>
        </div>
    );
}

/** Blank report for ADR template preview (all inputs blank, no placeholders). */
export function getBlankAdrReport() {
    return {
        forName: '',
        thruName: '',
        fromName: '',
        forPosition: '',
        thruPosition: '',
        fromPosition: '',
        subject: '',
        dateTime: '',
        alertStatus: '',
        attendanceItems: [],
        reportsItems: [],
        communicationRows: [],
        otherItemsRows: [],
        otherAdminRows: [],
        endorsedItemsRows: [],
        preparedBy: '',
        receivedBy: '',
        notedBy: '',
        approvedBy: '',
        preparedPosition: '',
        receivedPosition: '',
        notedPosition: '',
        approvedPosition: '',
    };
}

export default AdrDocumentBody;
