import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            setIsSubmitting(true);
            await axios.post('/api/auth/login', {
                username,
                password,
            });
            navigate('/dashboard');
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
