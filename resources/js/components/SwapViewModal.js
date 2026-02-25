import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SwapViewModal = ({ isOpen, onClose, swapId }) => {
    const [swapData, setSwapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [exportError, setExportError] = useState(null);

    useEffect(() => {
        if (isOpen && swapId) {
            fetchSwapData();
        }
    }, [isOpen, swapId]);

    const fetchSwapData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/swapping-requests/${swapId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setSwapData(response.data);
        } catch (err) {
            console.error('Error fetching swap data:', err);
            setError('Failed to load swap request details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusKey = (status || 'pending').toLowerCase();
        const labelMap = {
            pending: 'Pending',
            approved: 'Approved',
            denied: 'Denied',
            cancelled: 'Cancelled'
        };
        const label = labelMap[statusKey] || labelMap.pending;
        return (
            <span className={`swap-view-modal__status swap-view-modal__status--${statusKey}`}>
                {label}
            </span>
        );
    };

    const handleExportWord = () => {
        if (!swapId) return;
        setExportError(null);
        setExportLoading(true);
        const url = `/api/swapping-requests/${swapId}/export`;
        window.location.assign(url);
        setTimeout(() => setExportLoading(false), 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="swap-view-modal">
            <div className="swap-view-modal__overlay" onClick={onClose}></div>
            <div className="swap-view-modal__container">
                {/* Header */}
                <div className="swap-view-modal__header">
                    <h2 className="swap-view-modal__title">
                        Swap Request Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="swap-view-modal__close"
                    >
                        &times;
                    </button>
                </div>

                {/* Content */}
                <div className="swap-view-modal__content">
                    {loading && (
                        <div className="swap-view-modal__loading">
                            Loading...
                        </div>
                    )}

                    {error && (
                        <div className="swap-view-modal__error">
                            {error}
                        </div>
                    )}

                    {!loading && !error && swapData && (
                        <div className="swap-view-modal__grid">
                            {/* Status */}
                            <div className="swap-view-modal__card swap-view-modal__card--status">
                                <span className="swap-view-modal__label">Status</span>
                                {getStatusBadge(swapData.status)}
                            </div>

                            {/* Date */}
                            <div className="swap-view-modal__card">
                                <span className="swap-view-modal__label">Date Created: </span>
                                <span className="swap-view-modal__value">{swapData.current_date || 'N/A'}</span>
                            </div>

                            {/* Requester Info */}
                            <div className="swap-view-modal__card swap-view-modal__card--outline">
                                <h3 className="swap-view-modal__section-title">
                                    Requester
                                </h3>
                                <div className="swap-view-modal__details">
                                    <div className="swap-view-modal__row">
                                        <strong>Name:</strong> {swapData.requester_name || 'N/A'}
                                    </div>
                                    <div className="swap-view-modal__row">
                                        <strong>Task:</strong> {swapData.requester_task || 'N/A'}
                                    </div>
                                    <div className="swap-view-modal__row">
                                        <strong>Date:</strong> {swapData.from_date || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="swap-view-modal__arrow">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="swap-view-modal__arrow-icon">
                                    <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>

                            {/* Target Info */}
                            <div className="swap-view-modal__card swap-view-modal__card--outline">
                                <h3 className="swap-view-modal__section-title">
                                    Target
                                </h3>
                                <div className="swap-view-modal__details">
                                    <div className="swap-view-modal__row">
                                        <strong>Name:</strong> {swapData.target_name || 'N/A'}
                                    </div>
                                    <div className="swap-view-modal__row">
                                        <strong>Task:</strong> {swapData.target_task || 'N/A'}
                                    </div>
                                    <div className="swap-view-modal__row">
                                        <strong>Date:</strong> {swapData.to_date || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="swap-view-modal__footer">
                    {exportError && (
                        <span className="swap-view-modal__export-error" role="alert">{exportError}</span>
                    )}
                    <button
                        onClick={handleExportWord}
                        className="swap-view-modal__btn swap-view-modal__btn--primary"
                        disabled={exportLoading || !swapData}
                        title="Export as Word document"
                    >
                        {exportLoading ? 'Exporting…' : 'Export Word'}
                    </button>
                    <button
                        onClick={onClose}
                        className="swap-view-modal__btn"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SwapViewModal;
