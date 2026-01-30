import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';

function DocumentViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { getReport } = useFormContext();
    const report = getReport(parseInt(id));
    const from = location.state?.from;

    if (!report) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Document not found</p>
                <button onClick={() => navigate('/adr-reports')}>Back to Reports</button>
            </div>
        );
    }

    const dash = (v) => {
        if (v == null || v === '') return '-';
        if (typeof v === 'number') return v;
        const s = String(v).trim();
        return s !== '' ? s : '-';
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="document-viewer">
            <div className="document-viewer__actions">
                <button
                    onClick={() => {
                        if (from === 'form') {
                            navigate('/adr-reports/create', { state: { report } });
                        } else if (from === 'archived') {
                            navigate('/archived-reports');
                        } else {
                            navigate('/adr-reports');
                        }
                    }}
                    className="document-viewer__back-btn"
                >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {from === 'form' ? 'Back to Form' : 'Back to Reports'}
                </button>
            </div>

            <div className="document-viewer__content">
                <h2 className="document-viewer__title">RDRRMOC DUTY REPORT</h2>
                
                <div className="document-viewer__metadata">
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
                                <span> After Duty Report for the Period Covered <span className="document-viewer__datetime-bold">{dash(report.dateTime)}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="document-viewer__divider"></div>

                <div className="document-viewer__status-section">
                    <div className="document-viewer__status-item">
                        <span className="document-viewer__status-number">1.</span>
                        <span className="document-viewer__status-text">
                            RDRRMC Operations Center is on <span className="document-viewer__status-alert">{dash(report.alertStatus) === '-' ? 'WHITE ALERT' : report.alertStatus}</span>.
                        </span>
                    </div>
                </div>

                {report.attendanceItems && report.attendanceItems.length > 0 && (
                    <div className="document-viewer__section">
                        <h3 className="document-viewer__section-title">2. Attendance:</h3>
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
                                    <tr key={item.id || index}>
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
                        <h3 className="document-viewer__section-title">3. Reports and Advisories released and issued (NDRRMC Dashboard, Website, SMS, E-mail, Viber, social media)</h3>
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
                                    <tr key={item.id || index}>
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
                    <h3 className="document-viewer__section-title">4. Administrative Matters:</h3>

                    {report.communicationRows && report.communicationRows.length > 0 && (
                        <div className="document-viewer__subsection">
                            <h4 className="document-viewer__subsection-title">A. Status of Communication Lines</h4>
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
                                        <tr key={row.id || index}>
                                            <td>{dash(row.particulars)}</td>
                                            <td className="document-viewer__table-items">{row.noOfItems !== undefined && row.noOfItems !== null && row.noOfItems !== '' ? row.noOfItems : '-'}</td>
                                            <td>{dash(row.contact)}</td>
                                            <td>{dash(row.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="document-viewer__legend">Legend: Status - operational / non-operational / prepaid status of mobile phones</p>
                        </div>
                    )}

                    {report.otherItemsRows && report.otherItemsRows.length > 0 && (
                        <div className="document-viewer__subsection">
                            <h4 className="document-viewer__subsection-title">B. Status of Other Items</h4>
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
                                        <tr key={row.id || index}>
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
                            <h4 className="document-viewer__subsection-title">C. Other Administrative Matters:</h4>
                            <p className="document-viewer__admin-note">(List down administrative concerns such as but not limited to: Duty driver on-call, vehicle activities, internet or other ICT equipment issues, parcel or documents received/delivered, untoward incidents that should be elevated to the management level).</p>
                            <ul className="document-viewer__admin-list">
                                {report.otherAdminRows.map((row, index) => (
                                    <li key={row.id || index}>{dash(row.concern)}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="document-viewer__subsection">
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

                <div className="document-viewer__signatures">
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
        </div>
    );
}

export default DocumentViewer;
