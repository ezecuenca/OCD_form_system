import React, { useEffect, useRef } from 'react';

function SuccessNotification({ message, isVisible, onClose, type = 'success' }) {
    const onCloseRef = useRef(onClose);
    
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onCloseRef.current();
            }, 1000); 

            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    if (!isVisible) return null;

    const notificationClass = type === 'error' ? 'success-notification success-notification--error' : 'success-notification';
    const iconColor = type === 'error' ? '#fff' : 'currentColor';

    return (
        <div className={notificationClass}>
            <div className="success-notification__content">
                {type === 'error' ? (
                    <svg className="success-notification__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                ) : (
                    <svg className="success-notification__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
                <span className="success-notification__message">{message}</span>
            </div>
        </div>
    );
}

export default SuccessNotification;
