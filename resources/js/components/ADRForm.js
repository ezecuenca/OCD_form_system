import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';
import ConfirmModal from './ConfirmModal';

function ADRForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { addReport, updateReport, getReport } = useFormContext();
    
    // Check if we're editing an existing report
    const reportToEdit = location.state?.report;
    const isEditing = !!reportToEdit;
    
    // Document name
    const [documentName, setDocumentName] = useState(reportToEdit?.documentName || '');
    
    // Top fields
    const [forName, setForName] = useState(reportToEdit?.forName || '');
    const [forPosition, setForPosition] = useState(reportToEdit?.forPosition || '');
    const [thruName, setThruName] = useState(reportToEdit?.thruName || '');
    const [thruPosition, setThruPosition] = useState(reportToEdit?.thruPosition || '');
    const [fromName, setFromName] = useState(reportToEdit?.fromName || '');
    const [fromPosition, setFromPosition] = useState(reportToEdit?.fromPosition || '');
    const [subject, setSubject] = useState(reportToEdit?.subject || '');
    const [dateTime, setDateTime] = useState(reportToEdit?.dateTime || '');
    
    // Status
    const [status, setStatus] = useState(reportToEdit?.alertStatus || (reportToEdit?.status && reportToEdit?.status !== 'Active' && reportToEdit?.status !== 'Archived' ? reportToEdit?.status : 'WHITE ALERT'));
    
    // Attendance and Reports
    const [attendanceItems, setAttendanceItems] = useState(reportToEdit?.attendanceItems || [{ id: 1, name: '', task: '' }]);
    const [reportsItems, setReportsItems] = useState(reportToEdit?.reportsItems || [{ id: 1, report: '', remarks: '' }]);
    
    // Modals
    const [showCommunicationModal, setShowCommunicationModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [showOtherItemsModal, setShowOtherItemsModal] = useState(false);
    const [showOtherAdminModal, setShowOtherAdminModal] = useState(false);
    const [showEndorsedItemsModal, setShowEndorsedItemsModal] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const [errorField, setErrorField] = useState('');
    
    // Communication and Other Items
    const [communicationRows, setCommunicationRows] = useState(reportToEdit?.communicationRows || [
        { id: 1, particulars: '', noOfItems: 0, contact: '', status: '' }
    ]);
    const [otherItemsRows, setOtherItemsRows] = useState(reportToEdit?.otherItemsRows || [
        { id: 1, particulars: '', noOfItems: 0, status: '' }
    ]);
    const [otherAdminRows, setOtherAdminRows] = useState(reportToEdit?.otherAdminRows || [
        { id: 1, concern: '' }
    ]);
    const [endorsedItemsRows, setEndorsedItemsRows] = useState(reportToEdit?.endorsedItemsRows || [
        { id: 1, item: '' }
    ]);
    
    // Signatures
    const [preparedBy, setPreparedBy] = useState(reportToEdit?.preparedBy || '');
    const [preparedPosition, setPreparedPosition] = useState(reportToEdit?.preparedPosition || '');
    const [receivedBy, setReceivedBy] = useState(reportToEdit?.receivedBy || '');
    const [receivedPosition, setReceivedPosition] = useState(reportToEdit?.receivedPosition || '');
    const [notedBy, setNotedBy] = useState(reportToEdit?.notedBy || '');
    const [notedPosition, setNotedPosition] = useState(reportToEdit?.notedPosition || '');
    const [approvedBy, setApprovedBy] = useState(reportToEdit?.approvedBy || '');
    const [approvedPosition, setApprovedPosition] = useState(reportToEdit?.approvedPosition || '');

    const handleReturn = () => {
        navigate('/adr-reports');
    };
    
    const handleConfirm = () => {
        // Validation temporarily disabled for template work
        // TODO: Re-enable validation after template is complete
        
        const formData = {
            documentName,
            forName,
            forPosition,
            thruName,
            thruPosition,
            fromName,
            fromPosition,
            subject,
            dateTime,
            status,
            attendanceItems,
            reportsItems,
            communicationRows,
            otherItemsRows,
            otherAdminRows,
            endorsedItemsRows,
            preparedBy,
            preparedPosition,
            receivedBy,
            receivedPosition,
            notedBy,
            notedPosition,
            approvedBy,
            approvedPosition
        };
        
        if (isEditing && reportToEdit && reportToEdit.id) {
            updateReport(reportToEdit.id, formData);
            navigate('/adr-reports', { state: { success: true, message: 'Document updated successfully!' } });
        } else {
            const newReport = addReport(formData);
            navigate('/adr-reports', { state: { success: true, message: 'Document created successfully!' } });
        }
    };
    
    const handleViewDocument = () => {
        if (isEditing && reportToEdit && reportToEdit.id) {
            navigate('/adr-reports', { state: { openDocumentId: reportToEdit.id, from: 'form' } });
        } else {
            const formData = {
                documentName,
                forName,
                forPosition,
                thruName,
                thruPosition,
                fromName,
                fromPosition,
                subject,
                dateTime,
                status,
                attendanceItems,
                reportsItems,
                communicationRows,
                otherItemsRows,
                otherAdminRows,
                endorsedItemsRows,
                preparedBy,
                preparedPosition,
                receivedBy,
                receivedPosition,
                notedBy,
                notedPosition,
                approvedBy,
                approvedPosition
            };
            
            const newReport = addReport(formData);
            navigate('/adr-reports', { state: { openDocumentId: newReport.id, from: 'form' } });
        }
    };

    const addAttendanceItem = () => {
        setAttendanceItems(prev => {
            const newId = Math.max(...prev.map(item => Number(item.id) || 0), 0) + 1;
            return [...prev, { id: newId, name: '', task: '' }];
        });
    };

    const removeAttendanceItem = (id) => {
        setAttendanceItems(prev => {
            if (prev.length <= 1) return prev;
            return prev.filter(item => Number(item.id) !== Number(id));
        });
    };

    const addReportsItem = () => {
        setReportsItems(prev => {
            const newId = Math.max(...prev.map(item => Number(item.id) || 0), 0) + 1;
            return [...prev, { id: newId, report: '', remarks: '' }];
        });
    };

    const removeReportsItem = (id) => {
        setReportsItems(prev => {
            if (prev.length <= 1) return prev;
            return prev.filter(item => Number(item.id) !== Number(id));
        });
    };

    const addCommunicationRow = () => {
        const newId = Math.max(...communicationRows.map(row => row.id), 0) + 1;
        setCommunicationRows([...communicationRows, { id: newId, particulars: '', noOfItems: 0, contact: '', status: '' }]);
    };

    const removeCommunicationRow = (id) => {
        setCommunicationRows(communicationRows.filter(row => row.id !== id));
    };

    const updateCommunicationRow = (id, field, value) => {
        setCommunicationRows(communicationRows.map(row => 
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const incrementCounter = (id) => {
        setCommunicationRows(communicationRows.map(row => 
            row.id === id ? { ...row, noOfItems: row.noOfItems + 1 } : row
        ));
    };

    const decrementCounter = (id) => {
        setCommunicationRows(communicationRows.map(row => 
            row.id === id && row.noOfItems > 0 ? { ...row, noOfItems: row.noOfItems - 1 } : row
        ));
    };

    const addOtherItemsRow = () => {
        const newId = Math.max(...otherItemsRows.map(row => row.id), 0) + 1;
        setOtherItemsRows([...otherItemsRows, { id: newId, particulars: '', noOfItems: 0, status: '' }]);
    };

    const removeOtherItemsRow = (id) => {
        setOtherItemsRows(otherItemsRows.filter(row => row.id !== id));
    };

    const updateOtherItemsRow = (id, field, value) => {
        setOtherItemsRows(otherItemsRows.map(row => 
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const incrementOtherItemsCounter = (id) => {
        setOtherItemsRows(otherItemsRows.map(row => 
            row.id === id ? { ...row, noOfItems: row.noOfItems + 1 } : row
        ));
    };

    const decrementOtherItemsCounter = (id) => {
        setOtherItemsRows(otherItemsRows.map(row => 
            row.id === id && row.noOfItems > 0 ? { ...row, noOfItems: row.noOfItems - 1 } : row
        ));
    };

    const addOtherAdminRow = () => {
        const newId = Math.max(...otherAdminRows.map(row => row.id), 0) + 1;
        setOtherAdminRows([...otherAdminRows, { id: newId, concern: '' }]);
    };

    const removeOtherAdminRow = (id) => {
        setOtherAdminRows(otherAdminRows.filter(row => row.id !== id));
    };

    const updateOtherAdminRow = (id, field, value) => {
        setOtherAdminRows(otherAdminRows.map(row => 
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const addEndorsedItemsRow = () => {
        const newId = Math.max(...endorsedItemsRows.map(row => row.id), 0) + 1;
        setEndorsedItemsRows([...endorsedItemsRows, { id: newId, item: '' }]);
    };

    const removeEndorsedItemsRow = (id) => {
        setEndorsedItemsRows(endorsedItemsRows.filter(row => row.id !== id));
    };

    const updateEndorsedItemsRow = (id, field, value) => {
        setEndorsedItemsRows(endorsedItemsRows.map(row => 
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    return (
        <div className="adr-form">
            <div className="adr-form__top">
                <div className="adr-form__top-left">
                    <h1 className="adr-form__title">RDRRMOC DUTY REPORT</h1>
                    <input 
                        type="text" 
                        className={`adr-form__document-name ${errorField === 'documentName' ? 'adr-form__input-error' : ''}`}
                        placeholder="Enter document name..." 
                        value={documentName}
                        onChange={(e) => {
                            setDocumentName(e.target.value);
                            if (errorField === 'documentName') setErrorField('');
                        }}
                    />
                </div>
                <div className="adr-form__top-right">
                    <button className="adr-form__return-btn" onClick={handleReturn}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Return
                    </button>
                    <div className="adr-form__actions">
                        <button className="adr-form__action-btn adr-form__action-btn--confirm" onClick={handleConfirm}>
                            <img src={`${window.location.origin}/images/confirm_icon.svg`} alt="Confirm" />
                            {isEditing ? 'Update' : 'Confirm'}
                        </button>
                        {!isEditing && (
                            <button className="adr-form__action-btn adr-form__action-btn--view" onClick={handleViewDocument}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                View document
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="adr-form__content">
                <div className="adr-form__top-fields">
                    <div className="adr-form__field-group">
                        <div className="adr-form__field">
                            <label>For:</label>
                            <input 
                                type="text" 
                                className={errorField === 'forName' ? 'adr-form__input-error' : ''}
                                value={forName} 
                                onChange={(e) => {
                                    setForName(e.target.value);
                                    if (errorField === 'forName') setErrorField('');
                                }}
                            />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={forPosition} onChange={(e) => setForPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__field-group">
                        <div className="adr-form__field">
                            <label>Thru:</label>
                            <input 
                                type="text" 
                                className={errorField === 'thruName' ? 'adr-form__input-error' : ''}
                                value={thruName} 
                                onChange={(e) => {
                                    setThruName(e.target.value);
                                    if (errorField === 'thruName') setErrorField('');
                                }}
                            />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={thruPosition} onChange={(e) => setThruPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__field-group">
                        <div className="adr-form__field">
                            <label>From:</label>
                            <input 
                                type="text" 
                                className={errorField === 'fromName' ? 'adr-form__input-error' : ''}
                                value={fromName} 
                                onChange={(e) => {
                                    setFromName(e.target.value);
                                    if (errorField === 'fromName') setErrorField('');
                                }}
                            />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={fromPosition} onChange={(e) => setFromPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__field-group adr-form__field-group--subject">
                        <div className="adr-form__subject-header">
                            <label>Subject:</label>
                            <span className="adr-form__subject-text">After Duty Report for the Period Covered</span>
                            <input type="text" className="adr-form__subject-input" placeholder="Date and Time" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="adr-form__section">
                    <label className="adr-form__section-label">1. Status</label>
                    <select className="adr-form__select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option>WHITE ALERT</option>
                        <option>BLUE ALERT</option>
                        <option>RED ALERT</option>
                    </select>
                </div>

                <div className="adr-form__section">
                    <label className="adr-form__section-label">3. Reports and Advisories:</label>
                    <div className="adr-form__customize-group">
                        <label>Reports and Advisories List</label>
                        <button className="adr-form__customize-btn" type="button" onClick={() => setShowReportsModal(true)}>
                            CUSTOMIZE
                        </button>
                    </div>
                </div>

                <div className="adr-form__section">
                    <label className="adr-form__section-label">2. Attendance:</label>
                    <div className="adr-form__customize-group">
                        <label>Attendance List</label>
                        <button className="adr-form__customize-btn" type="button" onClick={() => setShowAttendanceModal(true)}>
                            CUSTOMIZE
                        </button>
                    </div>
                </div>

                <div className="adr-form__section">
                    <label className="adr-form__section-label">4. Administrative Matters:</label>
                    <div className="adr-form__customize-group">
                        <label>A. Status of Communication Lines</label>
                        <button className="adr-form__customize-btn" type="button" onClick={() => setShowCommunicationModal(true)}>
                            CUSTOMIZE
                        </button>
                    </div>
                    <div className="adr-form__customize-group">
                        <label>B. Status of Other Items</label>
                        <button className="adr-form__customize-btn" type="button" onClick={() => setShowOtherItemsModal(true)}>
                            CUSTOMIZE
                        </button>
                    </div>
                    <div className="adr-form__customize-group">
                        <label>C. Other Administrative Matters:</label>
                        <button className="adr-form__customize-btn" type="button" onClick={() => setShowOtherAdminModal(true)}>
                            CUSTOMIZE
                        </button>
                    </div>
                    <div className="adr-form__other-admin-content">
                        <div className="adr-form__other-admin-item">
                            <span>(List down administrative concerns such as but not limited to: Duty driver on-call, vehicle activities, internet or other ICT equipment issues, parcel or documents received/delivered, untoward incidents that should be elevated to the management level).</span>
                        </div>
                        <div className="adr-form__other-admin-item">
                            <span>1. The following were endorsed to incoming Operations Duty Staff:</span>
                            <button className="adr-form__customize-btn" type="button" onClick={() => setShowEndorsedItemsModal(true)}>
                                CUSTOMIZE
                            </button>
                        </div>
                        <div className="adr-form__other-admin-item">
                            <span>2. For information of the OCD Officer-In-Charge.</span>
                        </div>
                    </div>
                </div>

                <div className="adr-form__signature-fields">
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Prepared By:</label>
                            <input type="text" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={preparedPosition} onChange={(e) => setPreparedPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Received By:</label>
                            <input type="text" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={receivedPosition} onChange={(e) => setReceivedPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Noted By:</label>
                            <input type="text" value={notedBy} onChange={(e) => setNotedBy(e.target.value)} />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={notedPosition} onChange={(e) => setNotedPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Approved:</label>
                            <input type="text" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={approvedPosition} onChange={(e) => setApprovedPosition(e.target.value)}></textarea>
                    </div>
                </div>
            </div>

            {showCommunicationModal && (
                <div className="adr-form__modal adr-form__modal--active" onClick={() => setShowCommunicationModal(false)}>
                    <div className="adr-form__modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="adr-form__modal-header">
                            <h2>Status of Communication Lines</h2>
                            <button className="adr-form__modal-close" type="button" onClick={() => setShowCommunicationModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="adr-form__modal-body">
                            <table className="adr-form__modal-table">
                                <thead>
                                    <tr>
                                        <th>Particulars</th>
                                        <th>No. of Items</th>
                                        <th>Contact No. / Freq / Channel</th>
                                        <th>Status / Remarks</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="adr-form__modal-table-body">
                                    {communicationRows.map((row) => (
                                        <tr className="adr-form__modal-table-row" key={row.id}>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="adr-form__modal-input" 
                                                    placeholder="Enter particulars"
                                                    value={row.particulars}
                                                    onChange={(e) => updateCommunicationRow(row.id, 'particulars', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <div className="adr-form__counter">
                                                    <button 
                                                        className="adr-form__counter-btn" 
                                                        type="button"
                                                        onClick={() => decrementCounter(row.id)}
                                                    >
                                                        −
                                                    </button>
                                                    <input 
                                                        type="number" 
                                                        className="adr-form__counter-input" 
                                                        value={row.noOfItems} 
                                                        min="0"
                                                        onChange={(e) => updateCommunicationRow(row.id, 'noOfItems', parseInt(e.target.value) || 0)}
                                                    />
                                                    <button 
                                                        className="adr-form__counter-btn" 
                                                        type="button"
                                                        onClick={() => incrementCounter(row.id)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="adr-form__modal-input" 
                                                    placeholder="Enter contact/freq/channel"
                                                    value={row.contact}
                                                    onChange={(e) => updateCommunicationRow(row.id, 'contact', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="adr-form__modal-input" 
                                                    placeholder="Enter status/remarks"
                                                    value={row.status}
                                                    onChange={(e) => updateCommunicationRow(row.id, 'status', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <button 
                                                    className="adr-form__modal-action-btn" 
                                                    type="button"
                                                    onClick={() => removeCommunicationRow(row.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="adr-form__modal-add-row" type="button" onClick={addCommunicationRow}>
                                Add Row
                            </button>
                        </div>
                        <div className="adr-form__modal-footer">
                            <button className="adr-form__modal-confirm" type="button" onClick={() => setShowCommunicationModal(false)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAttendanceModal && (
                <div className="adr-form__modal adr-form__modal--active" onClick={() => setShowAttendanceModal(false)}>
                    <div className="adr-form__modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="adr-form__modal-header">
                            <h2>Attendance List</h2>
                            <button className="adr-form__modal-close" type="button" onClick={() => setShowAttendanceModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="adr-form__modal-body">
                            <table className="adr-form__modal-table">
                                <thead>
                                    <tr>
                                        <th className="adr-form__modal-table-number">#</th>
                                        <th>Name</th>
                                        <th>Task</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="adr-form__modal-table-body">
                                    {attendanceItems.map((item, index) => (
                                        <tr className="adr-form__modal-table-row" key={item.id}>
                                            <td className="adr-form__modal-table-number">{index + 1}</td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="adr-form__modal-input" 
                                                    placeholder="Enter name"
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setAttendanceItems(prev => prev.map(i => 
                                                            i.id === item.id ? { ...i, name: value } : i
                                                        ));
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <textarea 
                                                    className="adr-form__modal-input adr-form__modal-textarea" 
                                                    placeholder="Enter task"
                                                    rows="2"
                                                    value={item.task}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setAttendanceItems(prev => prev.map(i => 
                                                            i.id === item.id ? { ...i, task: value } : i
                                                        ));
                                                    }}
                                                ></textarea>
                                            </td>
                                            <td>
                                                <button 
                                                    className="adr-form__modal-action-btn" 
                                                    type="button"
                                                    onClick={() => removeAttendanceItem(item.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="adr-form__modal-add-row" type="button" onClick={addAttendanceItem}>
                                Add Row
                            </button>
                        </div>
                        <div className="adr-form__modal-footer">
                            <button className="adr-form__modal-confirm" type="button" onClick={() => setShowAttendanceModal(false)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReportsModal && (
                <div className="adr-form__modal adr-form__modal--active" onClick={() => setShowReportsModal(false)}>
                    <div className="adr-form__modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="adr-form__modal-header">
                            <h2>Reports and Advisories</h2>
                            <button className="adr-form__modal-close" type="button" onClick={() => setShowReportsModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="adr-form__modal-body">
                            <table className="adr-form__modal-table">
                                <thead>
                                    <tr>
                                        <th className="adr-form__modal-table-number">#</th>
                                        <th>Reports and Advisories Released</th>
                                        <th>Remarks</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="adr-form__modal-table-body">
                                    {reportsItems.map((item, index) => (
                                        <tr className="adr-form__modal-table-row" key={item.id}>
                                            <td className="adr-form__modal-table-number">{index + 1}</td>
                                            <td>
                                                <textarea 
                                                    className="adr-form__modal-input adr-form__modal-textarea" 
                                                    placeholder="Enter reports and advisories released"
                                                    rows="3"
                                                    value={item.report}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setReportsItems(prev => prev.map(i => 
                                                            i.id === item.id ? { ...i, report: value } : i
                                                        ));
                                                    }}
                                                ></textarea>
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="adr-form__modal-input" 
                                                    placeholder="Enter remarks"
                                                    value={item.remarks}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setReportsItems(prev => prev.map(i => 
                                                            i.id === item.id ? { ...i, remarks: value } : i
                                                        ));
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <button 
                                                    className="adr-form__modal-action-btn" 
                                                    type="button"
                                                    onClick={() => removeReportsItem(item.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="adr-form__modal-add-row" type="button" onClick={addReportsItem}>
                                Add Row
                            </button>
                        </div>
                        <div className="adr-form__modal-footer">
                            <button className="adr-form__modal-confirm" type="button" onClick={() => setShowReportsModal(false)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showOtherItemsModal && (
                <div className="adr-form__modal adr-form__modal--active" onClick={() => setShowOtherItemsModal(false)}>
                    <div className="adr-form__modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="adr-form__modal-header">
                            <h2>Status of Other Items</h2>
                            <button className="adr-form__modal-close" type="button" onClick={() => setShowOtherItemsModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="adr-form__modal-body">
                            <table className="adr-form__modal-table">
                                <thead>
                                    <tr>
                                        <th>Particulars</th>
                                        <th>No. of Items</th>
                                        <th>Status / Remarks</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="adr-form__modal-table-body">
                                    {otherItemsRows.map((row) => (
                                        <tr className="adr-form__modal-table-row" key={row.id}>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="adr-form__modal-input" 
                                                    placeholder="Enter particulars"
                                                    value={row.particulars}
                                                    onChange={(e) => updateOtherItemsRow(row.id, 'particulars', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <div className="adr-form__counter">
                                                    <button 
                                                        className="adr-form__counter-btn" 
                                                        type="button"
                                                        onClick={() => decrementOtherItemsCounter(row.id)}
                                                    >
                                                        −
                                                    </button>
                                                    <input 
                                                        type="number" 
                                                        className="adr-form__counter-input" 
                                                        value={row.noOfItems} 
                                                        min="0"
                                                        onChange={(e) => updateOtherItemsRow(row.id, 'noOfItems', parseInt(e.target.value) || 0)}
                                                    />
                                                    <button 
                                                        className="adr-form__counter-btn" 
                                                        type="button"
                                                        onClick={() => incrementOtherItemsCounter(row.id)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="adr-form__modal-input" 
                                                    placeholder="Enter status/remarks"
                                                    value={row.status}
                                                    onChange={(e) => updateOtherItemsRow(row.id, 'status', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <button 
                                                    className="adr-form__modal-action-btn" 
                                                    type="button"
                                                    onClick={() => removeOtherItemsRow(row.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="adr-form__modal-add-row" type="button" onClick={addOtherItemsRow}>
                                Add Row
                            </button>
                        </div>
                        <div className="adr-form__modal-footer">
                            <button className="adr-form__modal-confirm" type="button" onClick={() => setShowOtherItemsModal(false)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showOtherAdminModal && (
                <div className="adr-form__modal adr-form__modal--active" onClick={() => setShowOtherAdminModal(false)}>
                    <div className="adr-form__modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="adr-form__modal-header">
                            <h2>Administrative Concerns</h2>
                            <button className="adr-form__modal-close" type="button" onClick={() => setShowOtherAdminModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="adr-form__modal-body">
                            <table className="adr-form__modal-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}></th>
                                        <th>Concern</th>
                                        <th style={{ width: '60px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {otherAdminRows.map((row, index) => (
                                        <tr key={row.id}>
                                            <td>•</td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="adr-form__modal-input" 
                                                    placeholder="Enter administrative concern"
                                                    value={row.concern}
                                                    onChange={(e) => updateOtherAdminRow(row.id, 'concern', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <button 
                                                    className="adr-form__modal-action-btn" 
                                                    type="button"
                                                    onClick={() => removeOtherAdminRow(row.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="adr-form__modal-add-row" type="button" onClick={addOtherAdminRow}>
                                Add Row
                            </button>
                        </div>
                        <div className="adr-form__modal-footer">
                            <button className="adr-form__modal-confirm" type="button" onClick={() => setShowOtherAdminModal(false)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEndorsedItemsModal && (
                <div className="adr-form__modal adr-form__modal--active" onClick={() => setShowEndorsedItemsModal(false)}>
                    <div className="adr-form__modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="adr-form__modal-header">
                            <h2>Endorsed to Incoming Operations Duty Staff</h2>
                            <button className="adr-form__modal-close" type="button" onClick={() => setShowEndorsedItemsModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="adr-form__modal-body">
                            <table className="adr-form__modal-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '70px' }}></th>
                                        <th>Item</th>
                                        <th style={{ width: '60px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {endorsedItemsRows.map((row, index) => (
                                        <tr key={row.id}>
                                            <td>1.{index + 1}</td>
                                            <td>
                                                <input 
                                                    type="text" 
                                                    className="adr-form__modal-input" 
                                                    placeholder="Enter item"
                                                    value={row.item}
                                                    onChange={(e) => updateEndorsedItemsRow(row.id, 'item', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <button 
                                                    className="adr-form__modal-action-btn" 
                                                    type="button"
                                                    onClick={() => removeEndorsedItemsRow(row.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="adr-form__modal-add-row" type="button" onClick={addEndorsedItemsRow}>
                                Add Row
                            </button>
                        </div>
                        <div className="adr-form__modal-footer">
                            <button className="adr-form__modal-confirm" type="button" onClick={() => setShowEndorsedItemsModal(false)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showValidationModal}
                message={validationMessage}
                onConfirm={() => setShowValidationModal(false)}
                onCancel={() => setShowValidationModal(false)}
                showCancel={false}
            />
        </div>
    );
}

export default ADRForm;
