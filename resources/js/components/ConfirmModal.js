import React from 'react';

function ConfirmModal({ isOpen, message, onConfirm, onCancel, showCancel = true }) {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-modal__content">
                    <p className="confirm-modal__message">{message}</p>
                    <div className="confirm-modal__buttons">
                        <button 
                            className="confirm-modal__btn confirm-modal__btn--confirm" 
                            onClick={onConfirm}
                        >
                            Confirm
                        </button>
                        {showCancel && (
                            <button 
                                className="confirm-modal__btn confirm-modal__btn--cancel" 
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
