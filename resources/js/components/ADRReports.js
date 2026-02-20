import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';
import ConfirmModal from './ConfirmModal';
import SuccessNotification from './SuccessNotification';
import DocumentViewModal from './DocumentViewModal';

function ADRReports() {
    const navigate = useNavigate();
    const location = useLocation();
    const { reports, reportsLoaded, deleteReport, archiveReport, getReport } = useFormContext();
    const [selectedReports, setSelectedReports] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [selectedYear, setSelectedYear] = useState('All Years');
    const [selectedMonth, setSelectedMonth] = useState('All Months');
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState(null);
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
        if (location.state?.success) {
            setSuccessMessage(location.state.message || 'Document saved successfully!');
            setShowSuccessNotification(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    // Open document modal when redirected from /adr-reports/view/:id or from form/archived
    useEffect(() => {
        const openId = location.state?.openDocumentId;
        if (openId != null) {
            setSelectedReportId(openId);
            setShowDocumentModal(true);
            navigate('/adr-reports', { replace: true, state: {} });
        }
    }, [location.state?.openDocumentId, navigate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000); // Update every second

        return () => clearInterval(timer);
    }, []);

    const handleCreateClick = () => {
        navigate('/adr-reports/create');
    };
    
    const handleViewDocument = (id) => {
        setSelectedReportId(id);
        setShowDocumentModal(true);
    };
    
    const handleEditReport = (id) => {
        const report = getReport(id);
        if (report) {
            navigate('/adr-reports/create', { state: { report } });
        }
    };
    
    const handleDeleteSingle = (id) => {
        setConfirmMessage('Are you sure you want to archive (1) document?');
        setConfirmAction(() => () => {
            archiveReport(id);
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
    
    const handleDelete = () => {
        if (selectedReports.length === 0) {
            alert('Please select reports to archive');
            return;
        }
        
        setConfirmMessage(`Are you sure you want to archive (${selectedReports.length}) documents?`);
        setConfirmAction(() => () => {
            selectedReports.forEach(id => archiveReport(id));
            setSelectedReports([]);
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
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

    const years = ['All Years', '2026', '2025', '2024', '2023', '2022'];
    const months = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Generate dynamic years based on reports
    const getYearsFromReports = () => {
        const yearsSet = new Set();
        
        if (reports && reports.length > 0) {
            const active = reports.filter(r => r.status === 'Active');
            active.forEach(report => {
                if (report.createdAt) {
                    const year = new Date(report.createdAt).getFullYear();
                    yearsSet.add(year);
                }
            });
        }
        
        // Only add current year if there are active reports
        if (yearsSet.size > 0) {
            yearsSet.add(new Date().getFullYear());
        }
        
        const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
        return ['All Years', ...sortedYears.map(String)];
    };

    const filteredYears = getYearsFromReports();

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setShowYearDropdown(false);
    };

    const handleMonthSelect = (month) => {
        setSelectedMonth(month);
        setShowMonthDropdown(false);
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

    const activeReports = reports.filter(r => r.status === 'Active');

    if (!reportsLoaded) {
        return (
            <div className="adr-reports">
                <p style={{ padding: '2rem', textAlign: 'center' }}>Loading reports...</p>
            </div>
        );
    }

    const filteredReports = activeReports.filter((report) => {
        const created = new Date(report.createdAt);
        const reportYear = created.getFullYear().toString();
        const reportMonthIndex = created.getMonth();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const reportMonthName = monthNames[reportMonthIndex];

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

    return (
        <div className="adr-reports">
            <div className="adr-reports__search-bar">
                <div className="adr-reports__search-bar-input">
                    <img src={`${window.location.origin}/images/search_icon.svg`} alt="Search" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="adr-reports__datetime">
                    <img src={`${window.location.origin}/images/date_time.svg`} alt="Date Time" className="adr-reports__datetime-icon" />
                    <span className="adr-reports__datetime-text">
                        <span className="adr-reports__datetime-date">{formatCurrentDateTime().date}</span>
                        <span className="adr-reports__datetime-time">{formatCurrentDateTime().time}</span>
                    </span>
                </div>
            </div>

            <div className="adr-reports__controls">
                <div className="adr-reports__actions">
                    <button onClick={handleDelete} disabled={selectedReports.length < 2}>
                        <img src={`${window.location.origin}/images/delete_icon.svg`} alt="Archive" />
                        Archive
                    </button>
                </div>
                <div className="adr-reports__filters">
                    <div className="adr-reports__filter-dropdown" ref={yearDropdownRef}>
                        <button onClick={() => setShowYearDropdown(!showYearDropdown)}>
                            {selectedYear}
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        {showYearDropdown && (
                            <div className="adr-reports__dropdown-menu">
                                {filteredYears.map((year) => (
                                    <div 
                                        key={year} 
                                        className="adr-reports__dropdown-item"
                                        onClick={() => handleYearSelect(year)}
                                    >
                                        {year}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="adr-reports__filter-dropdown" ref={monthDropdownRef}>
                        <button onClick={() => setShowMonthDropdown(!showMonthDropdown)}>
                            {selectedMonth}
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        {showMonthDropdown && (
                            <div className="adr-reports__dropdown-menu">
                                {months.map((month) => (
                                    <div 
                                        key={month} 
                                        className="adr-reports__dropdown-item"
                                        onClick={() => handleMonthSelect(month)}
                                    >
                                        {month}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="adr-reports__create-btn" onClick={handleCreateClick}>
                        <img src={`${window.location.origin}/images/create_icon.svg`} alt="Create" />
                        Create New
                    </button>
                </div>
            </div>

            <div className="adr-reports__table">
                <table>
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox" 
                                    checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedReports(filteredReports.map(r => r.id));
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
                        {filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    {activeReports.length === 0 ? 'No reports yet. Click "Create New" to add one.' : 'No reports match the current filters.'}
                                </td>
                            </tr>
                        ) : (
                            filteredReports.map(report => (
                                <tr key={report.id}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedReports.includes(report.id)}
                                            onChange={() => handleSelectReport(report.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="adr-reports__action-buttons">
                                            <button 
                                                className="adr-reports__action-btn adr-reports__action-btn--view"
                                                onClick={() => handleViewDocument(report.id)}
                                                title="View"
                                            >
                                                <img src={`${window.location.origin}/images/view_icon.svg`} alt="View" />
                                            </button>
                                            <button 
                                                className="adr-reports__action-btn adr-reports__action-btn--edit"
                                                onClick={() => handleEditReport(report.id)}
                                                title="Edit"
                                            >
                                                <img src={`${window.location.origin}/images/edit_icon.svg`} alt="Edit" />
                                            </button>
                                            <button 
                                                className="adr-reports__action-btn adr-reports__action-btn--delete"
                                                onClick={() => handleDeleteSingle(report.id)}
                                                title="Archive"
                                            >
                                                <img src={`${window.location.origin}/images/delete_icon.svg`} alt="Archive" />
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        {report.documentName || 'Untitled Document'}
                                    </td>
                                    <td>
                                        <div className="adr-reports__table-datetime">
                                            <div className="date">{formatDate(report.createdAt).date}</div>
                                            <div className="time">{formatDate(report.createdAt).time}</div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="adr-reports__pagination">
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

            <DocumentViewModal
                isOpen={showDocumentModal}
                reportId={selectedReportId}
                onClose={() => {
                    setShowDocumentModal(false);
                    setSelectedReportId(null);
                }}
            />
        </div>
    );
}

export default ADRReports;
