import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormContext } from "../context/FormContext";
import ConfirmModal from "./ConfirmModal";

function SwapForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { forms, deleteForm, archiveForm, getForm } = useFormContext();
    const [selectedForms, setSelectedForms] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [selectedYear, setSelectedYear] = useState('All Years');
    const [selectedMonth, setSelectedMonth] = useState('All Months');
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const yearDropdownRef = useRef(null);
    const monthDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
                setShowYearDropdown(false);
            }
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
                setShowMonthDropdown(false);
            }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000); // Update every second
    
        return () => clearInterval(timer);
    }, []);
    
    const handleViewDocument = (id) => {
        navigate(`/swap-form/view/${id}`);
    };
    
    const handleDelete = () => {
        if (selectedForms.length === 0) {
            alert('Please select forms to archive');
            return;
        }
        
        setConfirmMessage(`Are you sure you want to archive (${selectedForms.length}) documents?`);
        setConfirmAction(() => () => {
            selectedForms.forEach(id => archiveForm(id));
            setSelectedForms([]);
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };
    
    const handleDeleteSingle = (id) => {
        setConfirmMessage('Are you sure you want to archive (1) document?');
        setConfirmAction(() => () => {
            archiveForm(id);
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };
    
    const handleSelectForm = (id) => {
        setSelectedForms(prev => {
            if (prev.includes(id)) {
                return prev.filter(formId => formId !== id);
            } else {
                return [...prev, id];
            }
        });
    };
    
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const dateStr = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
        });
    return { date: dateStr, time: timeStr };
    };
    
    const formatCurrentDateTime = () => {
        const dateStr = currentDateTime.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
               year: 'numeric'
        });
        const timeStr = currentDateTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        return { date: dateStr, time: timeStr };
    };
    
    const years = ['All Years', '2026', '2025', '2024', '2023', '2022'];
    const months = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setShowYearDropdown(false);
    };

    const handleMonthSelect = (month) => {
        setSelectedMonth(month);
        setShowMonthDropdown(false);
    };

    const swapForms = forms.filter(r => r.status === 'Active');

    return (
        <div className="swap-form">
            <div className="swap-form__search-bar">
                <div className="swap-form__search-bar-input">
                    <img src={`${window.location.origin}/images/search_icon.svg`} alt="Search" />
                    <input type="text" placeholder="Search..." />
                </div>
                <div className="swap-form__datetime">
                    <img src={`${window.location.origin}/images/date_time.svg`} alt="Date Time" className="swap-form__datetime-icon" />
                    <span className="swap-form__datetime-text">
                        <span className="swap-form__datetime-date">{formatCurrentDateTime().date}</span>
                        <span className="swap-form__datetime-time">{formatCurrentDateTime().time}</span>
                    </span>
                </div>
            </div>

            <div className="swap-form__controls">
                <div className="swap-form__actions">
                    <button onClick={handleDelete} disabled={selectedForms.length < 2}>
                        <img src={`${window.location.origin}/images/delete_icon.svg`} alt="Archive" />
                        Archive
                    </button>
                </div>
                <div className="swap-form__filters">
                    <div className="swap-form__filter-dropdown" ref={yearDropdownRef}>
                        <button onClick={() => setShowYearDropdown(!showYearDropdown)}>
                            Year
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        {showYearDropdown && (
                            <div className="swap-form__dropdown-menu">
                                {years.map((year) => (
                                    <div 
                                        key={year} 
                                        className="swap-form__dropdown-item"
                                        onClick={() => handleYearSelect(year)}
                                    >
                                        {year}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="swap-form__filter-dropdown" ref={monthDropdownRef}>
                        <button onClick={() => setShowMonthDropdown(!showMonthDropdown)}>
                            Month
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        {showMonthDropdown && (
                            <div className="swap-form__dropdown-menu">
                                {months.map((month) => (
                                    <div 
                                        key={month} 
                                        className="swap-form__dropdown-item"
                                        onClick={() => handleMonthSelect(month)}
                                    >
                                        {month}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="swap-form__create-btn" onClick={handleCreateClick}>
                        <img src={`${window.location.origin}/images/create_icon.svg`} alt="Create" />
                        Create New
                    </button>
                </div>
            </div>

            <div className="swap-form__table">
                <table>
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox" 
                                    checked={selectedForms.length === activeForms.length && activeForms.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedForms(activeForms.map(f => f.id));
                                        } else {
                                            setSelectedForms([]);
                                        }
                                    }}
                                />
                            </th>
                            <th>Actions</th>
                            <th>Documents</th>
                            <th>Created at</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeForms.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    No forms yet. Click "Create New" to add one.
                                </td>
                            </tr>
                        ) : (
                            activeForms.map(form => (
                                <tr key={form.id}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedForms.includes(form.id)}
                                            onChange={() => handleSelectForm(form.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="swap-form__action-buttons">
                                            <button 
                                                className="swap-form__action-btn swap-form__action-btn--view"
                                                onClick={() => handleViewDocument(form.id)}
                                                title="View"
                                            >
                                                <img src={`${window.location.origin}/images/view_icon.svg`} alt="View" />
                                            </button>
                                            <button 
                                                className="swap-form__action-btn swap-form__action-btn--edit"
                                                onClick={() => handleEditForm(form.id)}
                                                title="Edit"
                                            >
                                                <img src={`${window.location.origin}/images/edit_icon.svg`} alt="Edit" />
                                            </button>
                                            <button 
                                                className="swap-form__action-btn swap-form__action-btn--delete"
                                                onClick={() => handleDeleteSingle(form.id)}
                                                title="Archive"
                                            >
                                                <img src={`${window.location.origin}/images/delete_icon.svg`} alt="Archive" />
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        {form.documentName || 'Untitled Document'}
                                    </td>
                                    <td>
                                        <div className="swap-form__table-datetime">
                                            <div className="date">{formatDate(form.createdAt).date}</div>
                                            <div className="time">{formatDate(form.createdAt).time}</div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="swap-form__pagination">
                <button>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 17L6 12L11 7M18 17L13 12L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 17L18 12L13 7M6 17L11 12L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                message={confirmMessage}
                onConfirm={confirmAction}
                onCancel={() => setShowConfirmModal(false)}
            />

            <SuccessNotification
                message={successMessage}
                isVisible={showSuccessNotification}
                onClose={() => setShowSuccessNotification(false)}
            />
        </div>
    );
}

export default SwapForm;