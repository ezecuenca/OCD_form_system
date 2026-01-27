import React from 'react';
import { useNavigate } from 'react-router-dom';

function ADRReports() {
    const navigate = useNavigate();

    const handleCreateClick = () => {
        navigate('/adr-reports/create');
    };

    return (
        <div className="adr-reports">
            <div className="adr-reports__search-bar">
                <div className="adr-reports__search-bar-input">
                    <img src={`${window.location.origin}/images/search_icon.svg`} alt="Search" />
                    <input type="text" placeholder="Search..." />
                </div>
            </div>

            <div className="adr-reports__controls">
                <div className="adr-reports__actions">
                    <button>
                        <img src={`${window.location.origin}/images/delete_icon.svg`} alt="Delete" />
                        Delete
                    </button>
                </div>
                <div className="adr-reports__filters">
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
                            <th>Actions</th>
                            <th>Documents</th>
                            <th>Date/Time</th>
                        </tr>
                    </thead>
                    <tbody>
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
        </div>
    );
}

export default ADRReports;
