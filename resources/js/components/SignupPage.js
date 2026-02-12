import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const sectionOptions = [
    { value: '', label: 'Choose your section' },
];

function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [section, setSection] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        console.log('Signup attempt:', { username, email, section, password });
    };

    return (
        <div className="login-page">
            <div className="login-container login-container--signup">
                <h2 className="signup-title">Create Account</h2>
                <form className="login-form login-form--signup" onSubmit={handleSubmit}>
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
                        >
                            {sectionOptions.map((opt) => (
                                <option key={opt.value || 'blank'} value={opt.value}>{opt.label}</option>
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
                        Sign Up
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
