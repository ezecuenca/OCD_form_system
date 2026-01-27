import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';

function ADRReports() {
    const navigate = useNavigate();
    const { reports, deleteReport, archiveReport } = useFormContext();
    const [selectedReports, setSelectedReports] = useState([]);

    const handleCreateClick = () => {
        navigate('/adr-reports/create');
    };
    
    const handleViewDocument = (id) => {
        window.open(`/adr-reports/view/${id}`, '_blank');
    };
    
    const handleEditReport = (id) => {
        // Navigate to edit form (functionality to be implemented)
        navigate(`/adr-reports/edit/${id}`);
    };
    
    const handleDeleteSingle = (id) => {
        if (confirm('Are you sure you want to archive this report?')) {
            archiveReport(id);
        }
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
        
        if (confirm(`Are you sure you want to archive ${selectedReports.length} report(s)?`)) {
            selectedReports.forEach(id => archiveReport(id));
            setSelectedReports([]);
        }
    };
    
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const activeReports = reports.filter(r => r.status === 'Active');

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
                    <button onClick={handleDelete} disabled={selectedReports.length === 0}>
                        <img src={`${window.location.origin}/images/delete_icon.svg`} alt="Archive" />
                        Archive
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
                            <th>
                                <input 
                                    type="checkbox" 
                                    checked={selectedReports.length === activeReports.length && activeReports.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedReports(activeReports.map(r => r.id));
                                        } else {
                                            setSelectedReports([]);
                                        }
                                    }}
                                />
                            </th>
                            <th>Actions</th>
                            <th>Documents</th>
                            <th>Date/Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeReports.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                    No reports yet. Click "Create New" to add one.
                                </td>
                            </tr>
                        ) : (
                            activeReports.map(report => (
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
                                    <td>{formatDate(report.createdAt)}</td>
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
        </div>
    );
}

export default ADRReports;
