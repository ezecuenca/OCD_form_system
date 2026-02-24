import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';
import SuccessNotification from './SuccessNotification';
import FailNotification from './FailNotification';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1 = email verification, 2 = set new password
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [noticeMessage, setNoticeMessage] = useState('');
    const [showFailNotification, setShowFailNotification] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setShowFailNotification(false);

        try {
            setIsSubmitting(true);
            await axios.post('/api/auth/verify-email', { email });
            setStep(2);
            setNoticeMessage('Email verified. Please enter your new password.');
            setShowSuccessNotification(true);
        } catch (err) {
            const response = err?.response?.data;
            let errorMsg = 'Failed to verify email.';
            if (response?.message) {
                errorMsg = response.message;
            } else if (response?.errors) {
                const firstError = Object.values(response.errors).flat()[0];
                errorMsg = firstError || errorMsg;
            }
            setErrorMessage(errorMsg);
            setShowFailNotification(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setShowFailNotification(false);

        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            setShowFailNotification(true);
            return;
        }

        if (newPassword.length < 8) {
            setErrorMessage('Password must be at least 8 characters.');
            setShowFailNotification(true);
            return;
        }

        try {
            setIsSubmitting(true);
            await axios.post('/api/auth/reset-password', {
                email,
                password: newPassword,
                password_confirmation: confirmPassword
            });
            setNoticeMessage('Password reset successfully! Redirecting to login...');
            setShowSuccessNotification(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const response = err?.response?.data;
            let errorMsg = 'Failed to reset password.';
            if (response?.message) {
                errorMsg = response.message;
            } else if (response?.errors) {
                const firstError = Object.values(response.errors).flat()[0];
                errorMsg = firstError || errorMsg;
            }
            setErrorMessage(errorMsg);
            setShowFailNotification(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) {
        return <LoadingScreen message={step === 1 ? 'Verifying email...' : 'Resetting password...'} />;
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <Link to="/login" className="login-form__back-link">
                    ← Back to Login
                </Link>
                <div className="login-logo">
                    <img src="/images/ocd_logo.svg" alt="OCD Logo" />
                </div>
                <div className="login-title">
                    <h1>OFFICE OF CIVIL DEFENSE</h1>
                    <h2>Caraga Region</h2>
                </div>
                <div className="login-subtitle">
                    {step === 1 ? 'Verify your email' : 'Set new password'}
                </div>
                <form className="login-form" onSubmit={step === 1 ? handleVerifyEmail : handleResetPassword}>
                    {noticeMessage && step === 2 && (
                        <div className="login-form__notice">
                            {noticeMessage}
                        </div>
                    )}
                    <div className="login-form__group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={step === 2}
                        />
                    </div>
                    {step === 2 && (
                        <>
                            <div className="login-form__group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            <div className="login-form__group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                        </>
                    )}
                    <button type="submit" className="login-form__button">
                        {step === 1 ? 'Verify Email' : 'Reset Password'}
                    </button>
                    <div className="login-form__signup">
                        Remember your password? <Link to="/login" className="login-form__signup-link">Login</Link> here.
                    </div>
                    <div className="login-form__back">
                        <Link to="/login" className="login-form__back-link">← Back to Login</Link>
                    </div>
                </form>
                <FailNotification 
                    message={errorMessage} 
                    isVisible={showFailNotification}
                    onClose={() => setShowFailNotification(false)}
                />
                <SuccessNotification 
                    message={noticeMessage} 
                    isVisible={showSuccessNotification && step === 2}
                    onClose={() => setShowSuccessNotification(false)}
                />
            </div>
        </div>
    );
}

export default ForgotPassword;
