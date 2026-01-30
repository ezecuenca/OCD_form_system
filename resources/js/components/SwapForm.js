import React from 'react';
import { NavLink } from 'react-router-dom';

function SwapForm() {
    // No state, no effects, no handlers left

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
                            <th>Actions</th>
                            <th>Documents</th>
                            <th>Status</th>
                            <th>Created at</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                No forms yet.
                            </td>
                        </tr>
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