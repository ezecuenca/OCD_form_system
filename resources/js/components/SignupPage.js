import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';

function SignupPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [section, setSection] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [noticeMessage, setNoticeMessage] = useState('');
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [isLoadingSections, setIsLoadingSections] = useState(false);

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

    useEffect(() => {
        let isMounted = true;
        setIsLoadingSections(true);
        axios.get('/api/section')
            .then((res) => {
                if (!isMounted) return;
                const options = Array.isArray(res?.data) ? res.data : [];
                setSectionOptions(options);
            })
            .catch(() => {
                if (!isMounted) return;
                setSectionOptions([]);
            })
            .finally(() => {
                if (!isMounted) return;
                setIsLoadingSections(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        try {
            setIsSubmitting(true);
            await axios.get('/sanctum/csrf-cookie');
            await axios.post('/api/auth/register', {
                name: fullName.trim(),
                username,
                email,
                password,
                section_id: section || null,
            });
            navigate('/login');
        } catch (err) {
            const response = err?.response?.data;
            if (response?.errors) {
                const firstError = Object.values(response.errors).flat()[0];
                setErrorMessage(firstError || 'Could not create account.');
            } else {
                setErrorMessage(response?.message || 'Could not create account.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCheckingAuth) {
        return <LoadingScreen message="Checking your session..." />;
    }

    if (isSubmitting) {
        return <LoadingScreen message="Creating your account..." />;
    }

    return (
        <div className="login-page">
            <div className="login-container login-container--signup">
                <h2 className="signup-title">Create Account</h2>
                <form className="login-form login-form--signup" onSubmit={handleSubmit}>
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
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
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
                        <label htmlFor="section">Section</label>
                        <select
                            id="section"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            className="login-form__select"
                            disabled={isLoadingSections}
                            required
                        >
                            <option value="">{isLoadingSections ? 'Loading sections...' : 'Choose your section'}</option>
                            {sectionOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="login-form__group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
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
                    <div className="login-form__group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    <button type="submit" className="login-form__button">
                        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                    </button>
                    <div className="login-form__signup">
                        Already have an account? <Link to="/login" className="login-form__signup-link">Login</Link> here.
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignupPage;
