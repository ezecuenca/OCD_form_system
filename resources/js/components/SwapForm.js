import React, { useState, useEffect, useRef } from 'react';
import { getSwapRequests, updateSwapRequestStatus, executeSwapRequest, archiveSwapRequest } from '../utils/swapRequests';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateOnly(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function SwapForm() {
    const [swapRequests, setSwapRequests] = useState([]);
    const navigate = useNavigate();
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [selectedYear, setSelectedYear] = useState('All Years');
    const [selectedMonth, setSelectedMonth] = useState('All Months');
    const yearDropdownRef = useRef(null);
    const monthDropdownRef = useRef(null);
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        message: '',
        onConfirm: null
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const loadSwapRequests = () => setSwapRequests(getSwapRequests().filter(r => r.status !== 'archived'));

    useEffect(() => {
        loadSwapRequests();
        const handleStorage = () => loadSwapRequests();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const handleReturn = () => {
        navigate('/schedule');
    };

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
    }, [showYearDropdown, showMonthDropdown]);

    const handleDeny = (id) => {
        if (window.confirm('Deny this swap request?')) {
            updateSwapRequestStatus(id, 'denied');
            loadSwapRequests();
        }
    };

    const handleApprove = (id) => {
        const success = executeSwapRequest(id);
        if (success) {
            loadSwapRequests();
        } else {
            alert('Could not execute swap. The task may have been modified or removed.');
        }
    };

    const handleArchive = (id) => {
        setConfirmState({
            isOpen: true,
            message: 'Archive this swap request?',
            onConfirm: () => {
                if (archiveSwapRequest(id)) {
                    setSelectedRequests(prev => prev.filter(i => i !== id));
                    loadSwapRequests();
                }
                setConfirmState({ isOpen: false, message: '', onConfirm: null });
            }
        });
    };

    const handleBulkArchive = () => {
        const toArchive = selectedRequests.filter(id => {
            const req = swapRequests.find(r => r.id === id);
            return req && (req.status === 'approved' || req.status === 'denied');
        });
        if (toArchive.length === 0) {
            alert('Please select approved or denied requests to archive.');
            return;
        }
        setConfirmState({
            isOpen: true,
            message: `Archive ${toArchive.length} request${toArchive.length === 1 ? '' : 's'}?`,
            onConfirm: () => {
                toArchive.forEach(id => archiveSwapRequest(id));
                setSelectedRequests([]);
                loadSwapRequests();
                setConfirmState({ isOpen: false, message: '', onConfirm: null });
            }
        });
    };

    const handleSelectRequest = (id) => {
        setSelectedRequests(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            return [...prev, id];
        });
    };

    // Generate dynamic years based on swap requests
    const getYearsFromRequests = () => {
        const currentYear = new Date().getFullYear();
        const yearsSet = new Set([currentYear]);
        
        swapRequests.forEach(req => {
            if (req.createdAt) {
                const year = new Date(req.createdAt).getFullYear();
                yearsSet.add(year);
            }
        });
        
        const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
        return ['All Years', ...sortedYears.map(String)];
    };

    const years = getYearsFromRequests();
    const months = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setShowYearDropdown(false);
    };

    const handleMonthSelect = (month) => {
        setSelectedMonth(month);
        setShowMonthDropdown(false);
    };

    // Pagination calculations
    const totalPages = Math.ceil(swapRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRequests = swapRequests.slice(startIndex, endIndex);

    const goToFirstPage = () => setCurrentPage(1);
    const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
    const goToLastPage = () => setCurrentPage(totalPages);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [swapRequests.length, currentPage, totalPages]);

    const getRequestDescription = (req) => {
        if (req.targetTaskName) {
            return `"${req.taskName}" (${formatDateOnly(req.fromDate)}) => "${req.targetTaskName}" (${formatDateOnly(req.toDate)})`;
        }
        return `"${req.taskName}" (${formatDateOnly(req.fromDate)}) => (${formatDateOnly(req.toDate)})`;
    };

    return (
        <div className="swap-form">
            <div className="swap-form__search-bar">
                <div className="swap-form__search-bar-input">
                    <img src={`${window.location.origin}/images/search_icon.svg`} alt="Search" />
                    <input type="text" placeholder="Search..." disabled />
                </div>
                <div className="swap-form__datetime">
                    <button className="adr-form__return-btn" onClick={handleReturn}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Return
                    </button>
                </div>
            </div>

            <div className="swap-form__controls">
                <div className="swap-form__actions">
                    <button
                        onClick={handleBulkArchive}
                        disabled={selectedRequests.length === 0 || !selectedRequests.some(id => {
                            const req = swapRequests.find(r => r.id === id);
                            return req && (req.status === 'approved' || req.status === 'denied');
                        })}
                    >
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
                </div>
            </div>

            <div className="swap-form__table">
                <table>
                    <thead>
                        <tr>
                            <th>
                                <input 
                                type="checkbox" 
                                checked={selectedRequests.length === paginatedRequests.length && paginatedRequests.length > 0}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedRequests(paginatedRequests.map(r => r.id));
                                    } else {
                                        setSelectedRequests([]);
                                    }
                                }}
                                />
                            </th>
                            <th>Task / Request</th>
                            <th>Status</th>
                            <th>Created at</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {swapRequests.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    No swap requests yet. View a task on the Schedule and click &quot;Request Swap&quot; to create one.
                                </td>
                            </tr>
                        ) : (
                            paginatedRequests.map((req) => (
                                <tr key={req.id}>
                                    <td>
                                        <input type="checkbox"
                                            checked={selectedRequests.includes(req.id)}
                                            onChange={() => handleSelectRequest(req.id)}
                                            disabled={req.status !== 'approved' && req.status !== 'denied'}
                                        />
                                    </td>
                                    <td>
                                        <div className="swap-form__table-document">
                                            {getRequestDescription(req)}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            backgroundColor: req.status === 'pending' ? '#fff8e1' : req.status === 'denied' ? '#ffebee' : '#e8f5e9',
                                            color: req.status === 'pending' ? '#f57c00' : req.status === 'denied' ? '#c62828' : '#2e7d32'
                                        }}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="swap-form__table-datetime">
                                        {formatDate(req.createdAt)}
                                    </td>
                                    <td>
                                        <div className="swap-form__table-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {req.status === 'pending' ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApprove(req.id)}
                                                        title="Approve &amp; swap task"
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                    >
                                                        <img src={`${window.location.origin}/images/approve_icon.svg`} alt="Approve" style={{ width: 20, height: 20 }} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeny(req.id)}
                                                        title="Deny request"
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                    >
                                                        <img src={`${window.location.origin}/images/deny_icon.svg`} alt="Deny" style={{ width: 20, height: 20 }} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleArchive(req.id)}
                                                    title="Archive"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                >
                                                    <img src={`${window.location.origin}/images/delete_icon.svg`} alt="Archive" style={{ width: 20, height: 20 }} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="swap-form__pagination">
                <button onClick={goToFirstPage} disabled={currentPage === 1} title="First page">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 17L6 12L11 7M18 17L13 12L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button onClick={goToPrevPage} disabled={currentPage === 1} title="Previous page">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <span className="swap-form__pagination-info">{swapRequests.length > 0 ? `Page ${currentPage} of ${totalPages}` : 'No data'}</span>
                <button onClick={goToNextPage} disabled={currentPage === totalPages || swapRequests.length === 0} title="Next page">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button onClick={goToLastPage} disabled={currentPage === totalPages || swapRequests.length === 0} title="Last page">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 17L18 12L13 7M6 17L11 12L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>

            <ConfirmModal
                isOpen={confirmState.isOpen}
                message={confirmState.message}
                onConfirm={confirmState.onConfirm || (() => {})}
                onCancel={() => setConfirmState({ isOpen: false, message: '', onConfirm: null })}
            />
        </div>
    );
}

export default SwapForm;