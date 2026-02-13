import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';
import { getSwapRequests, restoreSwapRequest } from '../utils/swapRequests';
import ConfirmModal from './ConfirmModal';

function ArchivedReports() {
    const navigate = useNavigate();
    const { reports, reportsLoaded, deleteReport, restoreReport } = useFormContext();
    const [selectedReports, setSelectedReports] = useState([]);
    const [selectedSwapRequests, setSelectedSwapRequests] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const pendingRestoreSwapIdRef = useRef(null);
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [selectedYear, setSelectedYear] = useState('All Years');
    const [selectedMonth, setSelectedMonth] = useState('All Months');
    const [activeTab, setActiveTab] = useState('adr'); // 'adr' | 'swapped'
    const [archivedSwapRequests, setArchivedSwapRequests] = useState([]);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
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

    useEffect(() => {
        setArchivedSwapRequests(getSwapRequests().filter(r => r.status === 'archived'));
        setSelectedSwapRequests([]);
    }, [activeTab]);

    const handleViewDocument = (id) => {
        navigate('/adr-reports', { state: { openDocumentId: id, from: 'archived' } });
    };

    const handleRestore = () => {
        if (selectedReports.length === 0) {
            alert('Please select reports to restore');
            return;
        }

        setConfirmMessage(`Are you sure you want to restore (${selectedReports.length}) documents?`);
        setConfirmAction(() => () => {
            selectedReports.forEach(id => restoreReport(id));
            setSelectedReports([]);
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };

    const handleRestoreSwapRequests = () => {
        if (selectedSwapRequests.length === 0) {
            alert('Please select swap requests to restore');
            return;
        }

        setConfirmMessage(`Are you sure you want to restore (${selectedSwapRequests.length}) swap request${selectedSwapRequests.length === 1 ? '' : 's'}?`);
        setConfirmAction(() => () => {
            selectedSwapRequests.forEach(id => restoreSwapRequest(id));
            setArchivedSwapRequests(getSwapRequests().filter(r => r.status === 'archived'));
            setSelectedSwapRequests([]);
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };

    const handleRestoreSingle = (id) => {
        setConfirmMessage('Are you sure you want to restore (1) document?');
        setConfirmAction(() => () => {
            restoreReport(id);
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };

    const handleSelectReport = (id) => {
        setSelectedReports(prev => {
            if (prev.includes(id)) {
                return prev.filter(reportId => reportId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectSwapRequest = (id) => {
        setSelectedSwapRequests(prev => {
            if (prev.includes(id)) {
                return prev.filter(requestId => requestId !== id);
            }
            return [...prev, id];
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

    const formatDateOnly = (dateStr) => {
        if (!dateStr) return '—';
        const [y, m, d] = dateStr.split('-');
        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getSwapRequestDescription = (req) => {
        if (req.targetTaskName) {
            return `"${req.taskName}" (${formatDateOnly(req.fromDate)}) ⇄ "${req.targetTaskName}" (${formatDateOnly(req.toDate)})`;
        }
        return `"${req.taskName}" (${formatDateOnly(req.fromDate)}) → (${formatDateOnly(req.toDate)})`;
    };

    const handleRestoreSwapRequest = (id) => {
        pendingRestoreSwapIdRef.current = id;
        setConfirmMessage('Are you sure you want to restore this swap request?');
        setConfirmAction(() => () => {
            const idToRestore = pendingRestoreSwapIdRef.current;
            if (idToRestore) {
                restoreSwapRequest(idToRestore);
                setArchivedSwapRequests(getSwapRequests().filter(r => r.status === 'archived'));
                setSelectedSwapRequests(prev => prev.filter(requestId => requestId !== idToRestore));
                pendingRestoreSwapIdRef.current = null;
            }
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
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

    if (!reportsLoaded) {
        return (
            <div className="archived-reports">
                <p style={{ padding: '2rem', textAlign: 'center' }}>Loading reports...</p>
            </div>
        );
    }

    const archivedReports = reports.filter(r => r.status === 'Archived');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const filteredArchivedReports = archivedReports.filter((report) => {
        const created = new Date(report.createdAt);
        const reportYear = created.getFullYear().toString();
        const reportMonthName = monthNames[created.getMonth()];
        if (selectedYear !== 'All Years' && reportYear !== selectedYear) return false;
        if (selectedMonth !== 'All Months' && reportMonthName !== selectedMonth) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const docName = (report.documentName || 'Untitled Document').toLowerCase();
            const dateStr = formatDate(report.createdAt).date.toLowerCase();
            const timeStr = formatDate(report.createdAt).time.toLowerCase();
            if (!docName.includes(q) && !dateStr.includes(q) && !timeStr.includes(q)) return false;
        }
        return true;
    });

    const filteredArchivedSwapRequests = archivedSwapRequests.filter((req) => {
        const created = new Date(req.createdAt);
        const reportYear = created.getFullYear().toString();
        const reportMonthName = monthNames[created.getMonth()];
        if (selectedYear !== 'All Years' && reportYear !== selectedYear) return false;
        if (selectedMonth !== 'All Months' && reportMonthName !== selectedMonth) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const desc = getSwapRequestDescription(req).toLowerCase();
            const dateStr = formatDate(req.createdAt).date.toLowerCase();
            const timeStr = formatDate(req.createdAt).time.toLowerCase();
            if (!desc.includes(q) && !dateStr.includes(q) && !timeStr.includes(q)) return false;
        }
        return true;
    });

    return (
        <div className="archived-reports">
            <div className="archived-reports__search-bar">
                <div className="archived-reports__search-bar-input">
                    <img src={`${window.location.origin}/images/search_icon.svg`} alt="Search" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="archived-reports__datetime">
                    <img src={`${window.location.origin}/images/date_time.svg`} alt="Date Time" className="archived-reports__datetime-icon" />
                    <span className="archived-reports__datetime-text">
                        <span className="archived-reports__datetime-date">{formatCurrentDateTime().date}</span>
                        <span className="archived-reports__datetime-time">{formatCurrentDateTime().time}</span>
                    </span>
                </div>
            </div>

            <div className="archived-reports__tabs">
                <button
                    className={`archived-reports__tab ${activeTab === 'adr' ? 'archived-reports__tab--active' : ''}`}
                    onClick={() => setActiveTab('adr')}
                >
                    ADR Reports
                </button>
                <button
                    className={`archived-reports__tab ${activeTab === 'swapped' ? 'archived-reports__tab--active' : ''}`}
                    onClick={() => setActiveTab('swapped')}
                >
                    Swapped Forms
                </button>
            </div>

            <div className="archived-reports__controls">
                <div className="archived-reports__actions">
                    {activeTab === 'adr' && (
                    <button onClick={handleRestore} disabled={selectedReports.length < 2}>
                        <svg width="15" height="15" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_8_219)">
                                <path fillRule="evenodd" clipRule="evenodd" d="M14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9ZM12 0C7.03 0 3 4.03 3 9H0L4 13L8 9H5C5 5.13 8.13 2 12 2C15.87 2 19 5.13 19 9C19 12.87 15.87 16 12 16C10.49 16 9.09 15.51 7.94 14.7L6.52 16.14C8.04 17.3 9.94 18 12 18C16.97 18 21 13.97 21 9C21 4.03 16.97 0 12 0Z" fill="currentColor"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_8_219">
                                    <rect width="21" height="18" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                        Restore
                    </button>
                    )}
                    {activeTab === 'swapped' && (
                    <button onClick={handleRestoreSwapRequests} disabled={selectedSwapRequests.length < 2}>
                        <svg width="15" height="15" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_8_219)">
                                <path fillRule="evenodd" clipRule="evenodd" d="M14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9ZM12 0C7.03 0 3 4.03 3 9H0L4 13L8 9H5C5 5.13 8.13 2 12 2C15.87 2 19 5.13 19 9C19 12.87 15.87 16 12 16C10.49 16 9.09 15.51 7.94 14.7L6.52 16.14C8.04 17.3 9.94 18 12 18C16.97 18 21 13.97 21 9C21 4.03 16.97 0 12 0Z" fill="currentColor"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_8_219">
                                    <rect width="21" height="18" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                        Restore
                    </button>
                    )}
                </div>
                <div className="archived-reports__filters">
                    <div className="archived-reports__filter-dropdown" ref={yearDropdownRef}>
                        <button onClick={() => setShowYearDropdown(!showYearDropdown)}>
                            Year
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        {showYearDropdown && (
                            <div className="archived-reports__dropdown-menu">
                                {years.map((year) => (
                                    <div 
                                        key={year} 
                                        className="archived-reports__dropdown-item"
                                        onClick={() => handleYearSelect(year)}
                                    >
                                        {year}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="archived-reports__filter-dropdown" ref={monthDropdownRef}>
                        <button onClick={() => setShowMonthDropdown(!showMonthDropdown)}>
                            Month
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        {showMonthDropdown && (
                            <div className="archived-reports__dropdown-menu">
                                {months.map((month) => (
                                    <div 
                                        key={month} 
                                        className="archived-reports__dropdown-item"
                                        onClick={() => handleMonthSelect(month)}
                                    >
                                        {month}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="archived-reports__table">
                {activeTab === 'adr' ? (
                <table>
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox" 
                                    checked={selectedReports.length === filteredArchivedReports.length && filteredArchivedReports.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedReports(filteredArchivedReports.map(r => r.id));
                                        } else {
                                            setSelectedReports([]);
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
                        {filteredArchivedReports.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    {archivedReports.length === 0 ? 'No archived reports yet.' : 'No reports match the current filters.'}
                                </td>
                            </tr>
                        ) : (
                            filteredArchivedReports.map(report => (
                                <tr key={report.id}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedReports.includes(report.id)}
                                            onChange={() => handleSelectReport(report.id)}
                                        />
                                    </td>
                                    <td className="archived-reports__table-actions">
                                        <div className="archived-reports__action-buttons">
                                            <button 
                                                className="archived-reports__action-btn archived-reports__action-btn--view"
                                                onClick={() => handleViewDocument(report.id)}
                                                title="View"
                                            >
                                                <img src={`${window.location.origin}/images/view_icon.svg`} alt="View" />
                                            </button>
                                            <button 
                                                className="archived-reports__action-btn archived-reports__action-btn--restore"
                                                onClick={() => handleRestoreSingle(report.id)}
                                                title="Restore"
                                            >
                                                <img src={`${window.location.origin}/images/restore_icon.svg`} alt="Restore" />
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        {report.documentName || 'Untitled Document'}
                                    </td>
                                    <td>
                                        <div className="archived-reports__table-datetime">
                                            <div className="date">{formatDate(report.createdAt).date}</div>
                                            <div className="time">{formatDate(report.createdAt).time}</div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                ) : (
                <table>
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedSwapRequests.length === filteredArchivedSwapRequests.length && filteredArchivedSwapRequests.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedSwapRequests(filteredArchivedSwapRequests.map(r => r.id));
                                        } else {
                                            setSelectedSwapRequests([]);
                                        }
                                    }}
                                />
                            </th>
                            <th>Actions</th>
                            <th>Task / Request</th>
                            <th>Status</th>
                            <th>Created at</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArchivedSwapRequests.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    {archivedSwapRequests.length === 0 ? 'No archived swap requests yet.' : 'No swap requests match the current filters.'}
                                </td>
                            </tr>
                        ) : (
                            filteredArchivedSwapRequests.map(req => (
                                <tr key={req.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedSwapRequests.includes(req.id)}
                                            onChange={() => handleSelectSwapRequest(req.id)}
                                        />
                                    </td>
                                    <td className="archived-reports__table-actions">
                                        <div className="archived-reports__action-buttons">
                                            <button 
                                                className="archived-reports__action-btn archived-reports__action-btn--restore"
                                                onClick={() => handleRestoreSwapRequest(req.id)}
                                                title="Restore"
                                            >
                                                <img src={`${window.location.origin}/images/restore_icon.svg`} alt="Restore" />
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="archived-reports__table-document">
                                            {getSwapRequestDescription(req)}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            backgroundColor: req.archivedFromStatus === 'approved' ? '#e8f5e9' : '#ffebee',
                                            color: req.archivedFromStatus === 'approved' ? '#2e7d32' : '#c62828'
                                        }}>
                                            {req.archivedFromStatus || '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="archived-reports__table-datetime">
                                            <div className="date">{formatDate(req.createdAt).date}</div>
                                            <div className="time">{formatDate(req.createdAt).time}</div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                )}
            </div>

            <div className="archived-reports__pagination">
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
        </div>
    );
}

export default ArchivedReports;
