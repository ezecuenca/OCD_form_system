import React from 'react';

function Header() {
    const handleUserClick = () => {
        console.log('User icon clicked');
    };

    return (
        <header className="header">
            <div className="header__title">
                <div className="header__title-main">OFFICE OF CIVIL DEFENSE</div>
                <div className="header__title-sub">Caraga Region</div>
            </div>
            <div className="header__user" onClick={handleUserClick}>
                <img src="/images/user_icon.svg" alt="User" className="header__user-icon" />
                <svg className="header__user-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </header>
    );
}

export default Header;
