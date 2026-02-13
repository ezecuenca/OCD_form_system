import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function SignupPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [section, setSection] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [isLoadingSections, setIsLoadingSections] = useState(false);

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
            await axios.post('/api/auth/register', {
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

    return (
        <div className="login-page">
            <div className="login-container login-container--signup">
                <h2 className="signup-title">Create Account</h2>
                <form className="login-form login-form--signup" onSubmit={handleSubmit}>
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
