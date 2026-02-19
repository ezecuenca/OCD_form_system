import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [noticeMessage, setNoticeMessage] = useState('');
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const reason = location?.state?.reason;
        if (reason === 'session-expired') {
            setNoticeMessage('Session expired. Please log in again.');
        }
    }, [location?.state?.reason]);

    useEffect(() => {
        let isMounted = true;
        axios.get('/api/auth/me')
            .then(() => {
                if (isMounted) navigate('/dashboard', { replace: true });
            })
            .catch(() => {
                if (isMounted) setIsCheckingAuth(false);
            });

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            setIsSubmitting(true);
            await axios.get('/sanctum/csrf-cookie');
            await axios.post('/api/auth/login', {
                username,
                password,
            });
            navigate('/schedule', { state: { loginSuccess: true } });
        } catch (err) {
            const response = err?.response?.data;
            if (response?.errors) {
                const firstError = Object.values(response.errors).flat()[0];
                setErrorMessage(firstError || 'Login failed.');
            } else {
                setErrorMessage(response?.message || 'Login failed.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCheckingAuth) {
        return <LoadingScreen message="Checking your session..." />;
    }

    if (isSubmitting) {
        return <LoadingScreen message="Signing you in..." />;
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-logo">
                    <img src="/images/ocd_logo.svg" alt="OCD Logo" />
                </div>
                <div className="login-title">
                    <h1>OFFICE OF CIVIL DEFENSE</h1>
                    <h2>Caraga Region</h2>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    {noticeMessage && (
                        <div className="login-form__notice">
                            {noticeMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="login-form__error">
                            {errorMessage}
                        </div>
                    )}
                    <div className="login-form__group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div className="login-form__group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="login-form__button">
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                    <div className="login-form__signup">
                        Don't have an account? <Link to="/signup" className="login-form__signup-link">Sign up</Link> here.
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;