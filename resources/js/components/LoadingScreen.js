import React from 'react';

function LoadingScreen({ message = 'Loading...' }) {
    return (
        <div className="auth-loading">
            <div className="auth-loading__card">
                <img
                    src="/images/ocd_logo.svg"
                    alt="OCD Logo"
                    className="auth-loading__logo"
                />
                <div className="auth-loading__spinner" aria-hidden="true" />
                <div className="auth-loading__message">{message}</div>
            </div>
        </div>
    );
}

export default LoadingScreen;
