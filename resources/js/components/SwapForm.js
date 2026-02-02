import React, { useState, useEffect } from 'react';
import { getSwapRequests, updateSwapRequestStatus, executeSwapRequest } from '../utils/swapRequests';

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

    useEffect(() => {
        setSwapRequests(getSwapRequests());
        const handleStorage = () => setSwapRequests(getSwapRequests());
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const handleDeny = (id) => {
        if (window.confirm('Deny this swap request?')) {
            updateSwapRequestStatus(id, 'denied');
            setSwapRequests(getSwapRequests());
        }
    };

    const handleApprove = (id) => {
        const success = executeSwapRequest(id);
        if (success) {
            setSwapRequests(getSwapRequests());
        } else {
            alert('Could not execute swap. The task may have been modified or removed.');
        }
    };

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
                    <img src={`${window.location.origin}/images/date_time.svg`} alt="Date Time" className="swap-form__datetime-icon" />
                    <span className="swap-form__datetime-text">
                        <span className="swap-form__datetime-date">January 30, 2026</span>
                        <span className="swap-form__datetime-time">11:22 AM</span>
                    </span>
                </div>
            </div>

            <div className="swap-form__controls">
                <div className="swap-form__actions">
                    <button disabled>
                        <img src={`${window.location.origin}/images/delete_icon.svg`} alt="Archive" />
                        Archive
                    </button>
                </div>

                <div className="swap-form__filters">
                    {/* Year dropdown - visual only */}
                    <div className="swap-form__filter-dropdown">
                        <button disabled>
                            Year
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        {/* Dropdown content shown statically for design preview */}
                        <div className="swap-form__dropdown-menu" style={{ display: 'none' }}>
                            <div className="swap-form__dropdown-item">All Years</div>
                            <div className="swap-form__dropdown-item">2026</div>
                            <div className="swap-form__dropdown-item">2025</div>
                            <div className="swap-form__dropdown-item">2024</div>
                        </div>
                    </div>

                    {/* Month dropdown - visual only */}
                    <div className="swap-form__filter-dropdown">
                        <button disabled>
                            Month
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        {/* Dropdown content shown statically for design preview */}
                        <div className="swap-form__dropdown-menu" style={{ display: 'none' }}>
                            <div className="swap-form__dropdown-item">All Months</div>
                            <div className="swap-form__dropdown-item">January</div>
                            <div className="swap-form__dropdown-item">February</div>
                            <div className="swap-form__dropdown-item">March</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="swap-form__table">
                <table>
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" disabled />
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
                            swapRequests.map((req) => (
                                <tr key={req.id}>
                                    <td>
                                        <input type="checkbox" disabled />
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
                                                <>
                                                    <button
                                                        type="button"
                                                        title="View"
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                    >
                                                        <img src={`${window.location.origin}/images/view_icon.svg`} alt="View" style={{ width: 20, height: 20 }} />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        title="Archive"
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                    >
                                                        <img src={`${window.location.origin}/images/delete_icon.svg`} alt="Archive" style={{ width: 20, height: 20 }} />
                                                    </button>
                                                </>
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
                <button disabled>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 17L6 12L11 7M18 17L13 12L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button disabled>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button disabled>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button disabled>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 17L18 12L13 7M6 17L11 12L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>

            {/* Modals kept but permanently closed */}
            {/* <ConfirmModal isOpen={false} message="" onConfirm={() => {}} onCancel={() => {}} /> */}
            {/* <SuccessNotification message="" isVisible={false} onClose={() => {}} /> */}
        </div>
    );
}

export default SwapForm;