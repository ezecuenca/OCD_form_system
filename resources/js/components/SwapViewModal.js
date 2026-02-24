import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SwapViewModal = ({ isOpen, onClose, swapId }) => {
    const [swapData, setSwapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        const statusConfig = {
            'pending': { bg: '#fff3cd', color: '#856404', label: 'Pending' },
            'approved': { bg: '#d4edda', color: '#155724', label: 'Approved' },
            'denied': { bg: '#f8d7da', color: '#721c24', label: 'Denied' },
            'cancelled': { bg: '#e2e3e5', color: '#383d41', label: 'Cancelled' }
        };
        
        const config = statusConfig[status?.toLowerCase()] || statusConfig['pending'];
        
        return (
            <span style={{
                backgroundColor: config.bg,
                color: config.color,
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'inline-block'
            }}>
                {config.label}
            </span>
        );
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        color: '#333',
                        fontWeight: '600'
                    }}>
                        Swap Request Details
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#666',
                            padding: '4px',
                            lineHeight: 1
                        }}
                    >
                        &times;
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: '24px',
                    maxHeight: 'calc(90vh - 140px)',
                    overflowY: 'auto'
                }}>
                    {loading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#666'
                        }}>
                            Loading...
                        </div>
                    )}

                    {error && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#dc3545'
                        }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && swapData && (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {/* Status */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            }}>
                                <span style={{ fontWeight: '600', color: '#333' }}>Status</span>
                                {getStatusBadge(swapData.status)}
                            </div>

                            {/* Date */}
                            <div style={{
                                padding: '12px 16px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            }}>
                                <span style={{ fontWeight: '600', color: '#333' }}>Date Created: </span>
                                <span style={{ color: '#555' }}>{swapData.current_date || 'N/A'}</span>
                            </div>

                            {/* Requester Info */}
                            <div style={{
                                padding: '16px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px'
                            }}>
                                <h3 style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '1rem',
                                    color: '#333',
                                    fontWeight: '600'
                                }}>
                                    Requester
                                </h3>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <div style={{ fontSize: '0.95rem', color: '#555' }}>
                                        <strong>Name:</strong> {swapData.requester_name || 'N/A'}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: '#555' }}>
                                        <strong>Task:</strong> {swapData.requester_task || 'N/A'}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: '#555' }}>
                                        <strong>Date:</strong> {swapData.from_date || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div style={{
                                textAlign: 'center',
                                padding: '8px',
                                color: '#666'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(90deg)' }}>
                                    <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>

                            {/* Target Info */}
                            <div style={{
                                padding: '16px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px'
                            }}>
                                <h3 style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '1rem',
                                    color: '#333',
                                    fontWeight: '600'
                                }}>
                                    Target
                                </h3>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <div style={{ fontSize: '0.95rem', color: '#555' }}>
                                        <strong>Name:</strong> {swapData.target_name || 'N/A'}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: '#555' }}>
                                        <strong>Task:</strong> {swapData.target_task || 'N/A'}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: '#555' }}>
                                        <strong>Date:</strong> {swapData.to_date || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            backgroundColor: 'white',
                            color: '#333',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SwapViewModal;
