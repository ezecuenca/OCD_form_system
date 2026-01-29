import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';

function DocumentViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getReport } = useFormContext();
    const report = getReport(parseInt(id));

    if (!report) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Document not found</p>
                <button onClick={() => navigate('/adr-reports')}>Back to Reports</button>
            </div>
        );
    }

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
                <button onClick={() => navigate('/adr-reports/create', { state: { report } })} className="document-viewer__back-btn">Back to Form</button>
            </div>

            <div className="document-viewer__content">
                <h2 className="document-viewer__title">RDRRMOC DUTY REPORT</h2>
                
                <div className="document-viewer__metadata">
                    <div className="document-viewer__field">
                        <span className="document-viewer__label">FOR</span>
                        <span className="document-viewer__colon">:</span>
                        <div className="document-viewer__value">
                            <div className="document-viewer__name">{report.forName || ''}</div>
                            {report.forPosition && report.forPosition.split('\n').map((line, index) => (
                                line.trim() && (
                                    <div key={index} className="document-viewer__position">{line.trim()}</div>
                                )
                            ))}
                        </div>
                    </div>
                    <div className="document-viewer__field">
                        <span className="document-viewer__label">THRU</span>
                        <span className="document-viewer__colon">:</span>
                        <div className="document-viewer__value">
                            <div className="document-viewer__name">{report.thruName || ''}</div>
                            {report.thruPosition && report.thruPosition.split('\n').map((line, index) => (
                                line.trim() && (
                                    <div key={index} className="document-viewer__position">{line.trim()}</div>
                                )
                            ))}
                        </div>
                    </div>
                    <div className="document-viewer__field">
                        <span className="document-viewer__label">FROM</span>
                        <span className="document-viewer__colon">:</span>
                        <div className="document-viewer__value">
                            <div className="document-viewer__name">{report.fromName || ''}</div>
                            {report.fromPosition && report.fromPosition.split('\n').map((line, index) => (
                                line.trim() && (
                                    <div key={index} className="document-viewer__position">{line.trim()}</div>
                                )
                            ))}
                        </div>
                    </div>
                    <div className="document-viewer__field">
                        <span className="document-viewer__label">SUBJECT</span>
                        <span className="document-viewer__colon">:</span>
                        <div className="document-viewer__value">
                            <div className="document-viewer__subject">
                                {report.subject || 'After Duty Report'}
                                {report.dateTime && (
                                    <span> for the Period Covered <span className="document-viewer__datetime-bold">{report.dateTime}</span></span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="document-viewer__divider"></div>

                <div className="document-viewer__status-section">
                    <div className="document-viewer__status-item">
                        <span className="document-viewer__status-number">1.</span>
                        <span className="document-viewer__status-text">
                            RDRRMC Operations Center is on <span className="document-viewer__status-alert">{report.alertStatus || 'WHITE ALERT'}</span>.
                        </span>
                    </div>
                </div>

                {report.attendanceItems && report.attendanceItems.length > 0 && (
                    <div className="document-viewer__section">
                        <h3 className="document-viewer__section-title">2. Attendance:</h3>
                        <table className="document-viewer__table">
                            <thead>
                                <tr>
                                    <th className="document-viewer__table-num">#</th>
                                    <th className="document-viewer__table-name">Name</th>
                                    <th className="document-viewer__table-tasks">Tasks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.attendanceItems.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td className="document-viewer__table-num">{index + 1}</td>
                                        <td className="document-viewer__table-name">{item.name || ''}</td>
                                        <td className="document-viewer__table-tasks">
                                            {item.task ? (
                                                <ul className="document-viewer__task-list">
                                                    {item.task.split(/[;\n]/).map((task, i) => (
                                                        task.trim() && <li key={i}>{task.trim()}</li>
                                                    ))}
                                                </ul>
                                            ) : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DocumentViewer;
