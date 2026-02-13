import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';
import axios from 'axios';

function Header() {
    const { profileImageUrl, userFullName, setUserFullName } = useFormContext();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        axios.get('/api/profile', { withCredentials: true })
            .then((res) => {
                if (isMounted && res.data?.full_name != null) {
                    setUserFullName(String(res.data.full_name).trim());
                }
            })
            .catch(() => {});
        return () => { isMounted = false; };
    }, [setUserFullName]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleUserClick = (e) => {
        e.stopPropagation();
        setDropdownOpen((prev) => !prev);
    };

    const handleLogout = async () => {
        setDropdownOpen(false);
        try {
            await axios.get('/sanctum/csrf-cookie');
            await axios.post('/api/auth/logout');
        } catch (err) {
        } finally {
            navigate('/login');
        }
    };

    const handleViewProfile = () => {
        setDropdownOpen(false);
        navigate('/profile');
    };

    return (
        <header className="header">
            <div className="header__title">
                <div className="header__title-main">OFFICE OF CIVIL DEFENSE</div>
                <div className="header__title-sub">Caraga Region</div>
            </div>
            <div className="header__user-wrap" ref={dropdownRef}>
                {userFullName && (
                    <span className="header__user-name">{userFullName}</span>
                )}
                <div className="header__user" onClick={handleUserClick} role="button" aria-haspopup="true" aria-expanded={dropdownOpen}>
                    <div className={`header__profile-wrap ${!profileImageUrl ? 'header__profile-wrap--default' : ''}`} aria-hidden>
                        {profileImageUrl ? (
                            <img src={profileImageUrl} alt="Profile" className="header__profile-img" />
                        ) : (
                            <img src="/images/default_profile.png" alt="" className="header__profile-img" aria-hidden />
                        )}
                    </div>
                </div>
                {dropdownOpen && (
                    <div className="header__dropdown">
                        <button type="button" className="header__dropdown-item" onClick={handleViewProfile}>
                            <img src="/images/user_icon.svg" alt="" className="header__dropdown-icon" aria-hidden />
                            View Profile
                        </button>
                        <button type="button" className="header__dropdown-item" onClick={handleLogout}>
                            <img src="/images/logout_icon.svg" alt="" className="header__dropdown-icon" aria-hidden />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
