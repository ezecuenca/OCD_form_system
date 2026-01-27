import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';

function DocumentViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { reports } = useFormContext();
    
    let reportData;
    
    if (id === 'preview') {
        const previewData = sessionStorage.getItem('previewReport');
        reportData = previewData ? JSON.parse(previewData) : null;
    } else {
        reportData = reports.find(r => r.id === parseInt(id));
    }
    
    if (!reportData) {
        return (
            <div className="document-viewer">
                <div className="document-viewer__error">
                    <h2>Report not found</h2>
                    <button onClick={() => navigate('/adr-reports')}>Back to Reports</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="document-viewer">
            <div className="document-viewer__actions">
                <button className="document-viewer__btn" onClick={() => window.print()}>Print</button>
                <button className="document-viewer__btn" onClick={() => window.close()}>Close</button>
            </div>
            
            <div className="document-viewer__page">
                {/* Header */}
                <div className="doc-header">
                    <div className="doc-header__logo doc-header__logo--left">
                        <img src="/images/ocd_logo.png" alt="OCD Logo" />
                    </div>
                    <div className="doc-header__title">
                        <div className="doc-header__republic">REPUBLIC OF THE PHILIPPINES</div>
                        <div className="doc-header__department">DEPARTMENT OF NATIONAL DEFENSE</div>
                        <div className="doc-header__office">OFFICE OF CIVIL DEFENSE</div>
                        <div className="doc-header__region">Caraga Region</div>
                        <div className="doc-header__address">CAMP ROMUALDO C RUBI, BANCASI, BUTUAN CITY 8600, PHILIPPINES</div>
                    </div>
                    <div className="doc-header__logo doc-header__logo--right">
                        <img src="/images/bagong_pilipinas.png" alt="Bagong Pilipinas" />
                    </div>
                </div>
                
                {/* Report Title */}
                <div className="doc-title">RDRRMOC DUTY REPORT</div>
                
                {/* Top Section */}
                <div className="doc-top-section">
                    <div className="doc-field">
                        <span className="doc-field__label">FOR</span>
                        <span className="doc-field__colon">:</span>
                        <div className="doc-field__content">
                            <div className="doc-field__name">{reportData.forName || ''}</div>
                            <div className="doc-field__position">{reportData.forPosition || ''}</div>
                        </div>
                    </div>
                    
                    <div className="doc-field">
                        <span className="doc-field__label">THRU</span>
                        <span className="doc-field__colon">:</span>
                        <div className="doc-field__content">
                            <div className="doc-field__name">{reportData.thruName || ''}</div>
                            <div className="doc-field__position">{reportData.thruPosition || ''}</div>
                        </div>
                    </div>
                    
                    <div className="doc-field">
                        <span className="doc-field__label">FROM</span>
                        <span className="doc-field__colon">:</span>
                        <div className="doc-field__content">
                            <div className="doc-field__name">{reportData.fromName || ''}</div>
                            <div className="doc-field__position">{reportData.fromPosition || ''}</div>
                        </div>
                    </div>
                    
                    <div className="doc-field">
                        <span className="doc-field__label">SUBJECT</span>
                        <span className="doc-field__colon">:</span>
                        <div className="doc-field__content">
                            <div className="doc-field__name">After Duty Report for the Period Covered <strong>{reportData.dateTime || ''}</strong></div>
                        </div>
                    </div>
                </div>
                
                <div className="doc-divider"></div>
                
                {/* Status Section */}
                <div className="doc-section">
                    <div className="doc-section__number">1.</div>
                    <div className="doc-section__content">
                        RDRRMOC Operations Center is on <strong>{reportData.status}</strong>.
                    </div>
                </div>
                
                {/* Attendance Section */}
                {reportData.attendanceItems && reportData.attendanceItems.length > 0 && (
                    <div className="doc-section">
                        <div className="doc-section__number">2.</div>
                        <div className="doc-section__content">
                            <div className="doc-section__title">Attendance:</div>
                            <table className="doc-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Tasks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.attendanceItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{item.task}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* Reports and Advisories Section */}
                {reportData.reportsItems && reportData.reportsItems.length > 0 && (
                    <div className="doc-section">
                        <div className="doc-section__number">3.</div>
                        <div className="doc-section__content">
                            <div className="doc-section__title">Reports and Advisories released and issued (NDRRMC Dashboard, Website, SMS, E-mail, Viber, social media)</div>
                            <table className="doc-table">
                                <thead>
                                    <tr>
                                        <th>Reports and Advisories released</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.reportsItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.report}</td>
                                            <td>{item.remarks}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* Administrative Matters Section */}
                <div className="doc-section">
                    <div className="doc-section__number">4.</div>
                    <div className="doc-section__content">
                        <div className="doc-section__title">Administrative Matters:</div>
                        
                        {/* Communication Lines */}
                        {reportData.communicationRows && reportData.communicationRows.length > 0 && (
                            <div className="doc-subsection">
                                <div className="doc-subsection__title">A. Status of Communication Lines</div>
                                <table className="doc-table">
                                    <thead>
                                        <tr>
                                            <th>Particulars</th>
                                            <th>No. of Items</th>
                                            <th>Contact No. / Freq / Channel</th>
                                            <th>Status / Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.communicationRows.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.particulars}</td>
                                                <td>{row.noOfItems}</td>
                                                <td>{row.contact}</td>
                                                <td>{row.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {/* Other Items */}
                        {reportData.otherItemsRows && reportData.otherItemsRows.length > 0 && (
                            <div className="doc-subsection">
                                <div className="doc-subsection__title">B. Status of Other Items</div>
                                <table className="doc-table">
                                    <thead>
                                        <tr>
                                            <th>Particulars</th>
                                            <th>No. of Items</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.otherItemsRows.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.particulars}</td>
                                                <td>{row.noOfItems}</td>
                                                <td>{row.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Signatures Section */}
                <div className="doc-signatures">
                    <div className="doc-signature">
                        <div className="doc-signature__label">Prepared by:</div>
                        <div className="doc-signature__name">{reportData.preparedBy || ''}</div>
                        <div className="doc-signature__position">{reportData.preparedPosition || ''}</div>
                    </div>
                    
                    <div className="doc-signature">
                        <div className="doc-signature__label">Received by:</div>
                        <div className="doc-signature__name">{reportData.receivedBy || ''}</div>
                        <div className="doc-signature__position">{reportData.receivedPosition || ''}</div>
                    </div>
                    
                    <div className="doc-signature">
                        <div className="doc-signature__label">Noted by:</div>
                        <div className="doc-signature__name">{reportData.notedBy || ''}</div>
                        <div className="doc-signature__position">{reportData.notedPosition || ''}</div>
                    </div>
                    
                    <div className="doc-signature">
                        <div className="doc-signature__label">Approved:</div>
                        <div className="doc-signature__name">{reportData.approvedBy || ''}</div>
                        <div className="doc-signature__position">{reportData.approvedPosition || ''}</div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="doc-footer">
                    <div className="doc-footer__motto">SERVING THE NATION, PROTECTING THE PEOPLE</div>
                    <div className="doc-footer__office">Office of Civil Defense Caraga Regional Office</div>
                    <div className="doc-footer__email">Email Address: civildefensecaraga@gmail.com</div>
                    <div className="doc-footer__contact">Hotline: (085) 817-1209 / 0947-946-8145</div>
                    <div className="doc-footer__social">Facebook Page: Civil Defense Caraga</div>
                </div>
            </div>
        </div>
    );
}

export default DocumentViewer;
