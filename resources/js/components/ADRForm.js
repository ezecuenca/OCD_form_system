import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ADRForm() {
    const navigate = useNavigate();
    const [attendanceItems, setAttendanceItems] = useState([{ id: 1, name: '', task: '' }]);
    const [reportsItems, setReportsItems] = useState([{ id: 1, report: '', remarks: '' }]);
    const [showCommunicationModal, setShowCommunicationModal] = useState(false);
    const [communicationRows, setCommunicationRows] = useState([
        { id: 1, particulars: '', noOfItems: 0, contact: '', status: '' }
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

    return (
        <div className="adr-form">
            <div className="adr-form__header">
                <div className="adr-form__header-left">
                    <h1 className="adr-form__title">ADR Form</h1>
                    <button className="adr-form__header-btn">
                        <img src={`${window.location.origin}/images/create_icon.svg`} alt="Create" />
                        Create
                    </button>
                    <button className="adr-form__header-btn">
                        <img src={`${window.location.origin}/images/view_icon.svg`} alt="PDF" />
                        PDF
                    </button>
                </div>
                <button className="adr-form__header-btn adr-form__header-btn--return" onClick={handleReturn}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Return
                </button>
            </div>

            <div className="adr-form__content">
                <div className="adr-form__top-fields">
                    <div className="adr-form__field">
                        <label>For:</label>
                        <input type="text" />
                    </div>
                    <div className="adr-form__field">
                        <label>Thru:</label>
                        <input type="text" />
                    </div>
                    <div className="adr-form__field">
                        <label>From:</label>
                        <input type="text" />
                    </div>
                    <div className="adr-form__field">
                        <label>Subject:</label>
                        <input type="text" />
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

                <div className="adr-form__section adr-form__section--grey adr-form__section--reports">
                    <label className="adr-form__section-label">3. Reports and Advisories</label>
                    <div className="adr-form__reports-list">
                        {reportsItems.map((item, index) => (
                            <div className="adr-form__reports-item" key={item.id}>
                                {reportsItems.length > 1 && (
                                    <button 
                                        className="adr-form__remove-btn" 
                                        type="button"
                                        onClick={() => removeReportsItem(item.id)}
                                    >
                                        −
                                    </button>
                                )}
                                <div className="adr-form__field">
                                    <label>Reports and Advisories released:</label>
                                    <textarea rows="3"></textarea>
                                </div>
                                <div className="adr-form__field">
                                    <label>Remarks:</label>
                                    <input type="text" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="adr-form__add-line">
                        <hr />
                        <button className="adr-form__add-btn adr-form__add-btn--reports" type="button" onClick={addReportsItem}>
                            <img src={`${window.location.origin}/images/create_icon.svg`} alt="Add" />
                        </button>
                    </div>
                </div>

                <div className="adr-form__section adr-form__section--grey adr-form__section--attendance">
                    <label className="adr-form__section-label">2. Attendance</label>
                    <div className="adr-form__attendance-list">
                        {attendanceItems.map((item, index) => (
                            <div className="adr-form__attendance-item" key={item.id}>
                                {attendanceItems.length > 1 && (
                                    <button 
                                        className="adr-form__remove-btn" 
                                        type="button"
                                        onClick={() => removeAttendanceItem(item.id)}
                                    >
                                        −
                                    </button>
                                )}
                                <div className="adr-form__field">
                                    <label>Name:</label>
                                    <input type="text" />
                                </div>
                                <div className="adr-form__field">
                                    <label>Task:</label>
                                    <textarea rows="2"></textarea>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="adr-form__add-line">
                        <hr />
                        <button className="adr-form__add-btn adr-form__add-btn--attendance" type="button" onClick={addAttendanceItem}>
                            <img src={`${window.location.origin}/images/create_icon.svg`} alt="Add" />
                        </button>
                    </div>
                </div>

                <div className="adr-form__section">
                    <label className="adr-form__section-label">4. Administrative</label>
                    <div className="adr-form__customize-group">
                        <label>Status of Communication Lines</label>
                        <button className="adr-form__customize-btn" type="button" onClick={() => setShowCommunicationModal(true)}>
                            CUSTOMIZE
                        </button>
                    </div>
                    <div className="adr-form__customize-group">
                        <label>Status of Other Items</label>
                        <button className="adr-form__customize-btn" type="button">
                            CUSTOMIZE
                        </button>
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

            <div className="adr-form__signature-fields">
                <div className="adr-form__signature-item">
                    <div className="adr-form__field">
                        <label>Prepared By:</label>
                        <input type="text" />
                    </div>
                    <div className="adr-form__field">
                        <label>Position:</label>
                        <input type="text" className="adr-form__position-line" />
                    </div>
                </div>
                <div className="adr-form__signature-item">
                    <div className="adr-form__field">
                        <label>Received By:</label>
                        <input type="text" />
                    </div>
                    <div className="adr-form__field">
                        <label>Position:</label>
                        <input type="text" className="adr-form__position-line" />
                    </div>
                </div>
                <div className="adr-form__signature-item">
                    <div className="adr-form__field">
                        <label>Noted By:</label>
                        <input type="text" />
                    </div>
                    <div className="adr-form__field">
                        <label>Position:</label>
                        <input type="text" className="adr-form__position-line" />
                    </div>
                </div>
                <div className="adr-form__signature-item">
                    <div className="adr-form__field">
                        <label>Approved By:</label>
                        <input type="text" />
                    </div>
                    <div className="adr-form__field">
                        <label>Position:</label>
                        <input type="text" className="adr-form__position-line" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ADRForm;
