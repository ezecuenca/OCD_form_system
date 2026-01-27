import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ADRForm() {
    const navigate = useNavigate();
    const [attendanceItems, setAttendanceItems] = useState([{ id: 1, name: '', task: '' }]);
    const [reportsItems, setReportsItems] = useState([{ id: 1, report: '', remarks: '' }]);
    const [showCommunicationModal, setShowCommunicationModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [showOtherItemsModal, setShowOtherItemsModal] = useState(false);
    const [communicationRows, setCommunicationRows] = useState([
        { id: 1, particulars: '', noOfItems: 0, contact: '', status: '' }
    ]);
    const [otherItemsRows, setOtherItemsRows] = useState([
        { id: 1, particulars: '', noOfItems: 0, status: '' }
    ]);

    const handleReturn = () => {
        navigate('/adr-reports');
    };

    const addAttendanceItem = () => {
        const newId = Math.max(...attendanceItems.map(item => item.id), 0) + 1;
        setAttendanceItems([...attendanceItems, { id: newId, name: '', task: '' }]);
    };

    const removeAttendanceItem = (id) => {
        if (attendanceItems.length > 1) {
            setAttendanceItems(attendanceItems.filter(item => item.id !== id));
        }
    };

    const addReportsItem = () => {
        const newId = Math.max(...reportsItems.map(item => item.id), 0) + 1;
        setReportsItems([...reportsItems, { id: newId, report: '', remarks: '' }]);
    };

    const removeReportsItem = (id) => {
        if (reportsItems.length > 1) {
            setReportsItems(reportsItems.filter(item => item.id !== id));
        }
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

    return (
        <div className="adr-form">
            <div className="adr-form__top">
                <div className="adr-form__top-left">
                    <h1 className="adr-form__title">RDRRMOC DUTY REPORT</h1>
                    <div className="adr-form__actions">
                        <button className="adr-form__action-btn adr-form__action-btn--confirm">
                            <img src={`${window.location.origin}/images/confirm_icon.svg`} alt="Confirm" />
                            Confirm
                        </button>
                        <button className="adr-form__action-btn adr-form__action-btn--view">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            View document
                        </button>
                    </div>
                </div>
                <button className="adr-form__return-btn" onClick={handleReturn}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Return
                </button>
            </div>

            <div className="adr-form__content">
                <div className="adr-form__top-fields">
                    <div className="adr-form__field-group">
                        <div className="adr-form__field">
                            <label>For:</label>
                            <input type="text" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2"></textarea>
                    </div>
                    <div className="adr-form__field-group">
                        <div className="adr-form__field">
                            <label>Thru:</label>
                            <input type="text" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2"></textarea>
                    </div>
                    <div className="adr-form__field-group">
                        <div className="adr-form__field">
                            <label>From:</label>
                            <input type="text" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2"></textarea>
                    </div>
                    <div className="adr-form__field-group adr-form__field-group--subject">
                        <div className="adr-form__subject-header">
                            <label>Subject:</label>
                            <span className="adr-form__subject-text">After Duty Report for the Period Covered</span>
                            <input type="text" className="adr-form__subject-input" placeholder="Date and Time" />
                        </div>
                    </div>
                </div>

                <div className="adr-form__section">
                    <label className="adr-form__section-label">1. Status</label>
                    <select className="adr-form__select">
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
                </div>

                <div className="adr-form__signature-fields">
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Prepared By:</label>
                            <input type="text" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2"></textarea>
                    </div>
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Received By:</label>
                            <input type="text" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2"></textarea>
                    </div>
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Noted By:</label>
                            <input type="text" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2"></textarea>
                    </div>
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Approved By:</label>
                            <input type="text" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2"></textarea>
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
                                                        setAttendanceItems(attendanceItems.map(i => 
                                                            i.id === item.id ? { ...i, name: e.target.value } : i
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
                                                        setAttendanceItems(attendanceItems.map(i => 
                                                            i.id === item.id ? { ...i, task: e.target.value } : i
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
                                                        setReportsItems(reportsItems.map(i => 
                                                            i.id === item.id ? { ...i, report: e.target.value } : i
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
                                                        setReportsItems(reportsItems.map(i => 
                                                            i.id === item.id ? { ...i, remarks: e.target.value } : i
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
        </div>
    );
}

export default ADRForm;
