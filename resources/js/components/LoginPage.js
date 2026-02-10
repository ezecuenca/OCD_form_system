import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { username, password });
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
                        Login
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
