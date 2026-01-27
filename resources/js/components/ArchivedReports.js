import React from 'react';

function ArchivedReports() {
    return (
        <div className="archived-reports">
            <div className="archived-reports__search-bar">
                <div className="archived-reports__search-bar-input">
                    <img src={`${window.location.origin}/images/search_icon.svg`} alt="Search" />
                    <input type="text" placeholder="Search..." />
                </div>
            </div>

            <div className="archived-reports__controls">
                <div className="archived-reports__actions">
                    <button>
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
                </div>
                <div className="archived-reports__filters">
                    <button>
                        Year
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button>
                        Month
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="archived-reports__table">
                <table>
                    <thead>
                        <tr>
                            <th>Actions</th>
                            <th>Documents</th>
                            <th>Date/Time</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
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
        </div>
    );
}

export default ArchivedReports;
