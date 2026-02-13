import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

function Sidebar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get('/api/auth/me')
            .then((res) => {
                setUser(res.data);
            })
            .catch(() => {
                setUser(null);
            });
    }, []);

    return (
        <aside className="sidebar">
            <div className="sidebar__logo">
                <img src="/images/ocd_logo.svg" alt="OCD Logo" className="sidebar__logo-img" />
            </div>

            <nav className="sidebar__nav">
                <NavLink
                    to="/schedule" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                >
                    <span className="sidebar__link-icon">
                        <img src="/images/calendar_icon.svg" alt="Schedule" className="sidebar__link-icon-img" />
                    </span>
                    <span className="sidebar__link-text">Schedule</span>
                </NavLink>

                <NavLink 
                    to="/adr-reports" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                >
                    <span className="sidebar__link-icon">
                        <img src="/images/adr_report_logo.svg" alt="ADR Reports" className="sidebar__link-icon-img" />
                    </span>
                    <span className="sidebar__link-text">ADR Reports</span>
                </NavLink>

                <NavLink 
                    to="/archived-reports" 
                    className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                >
                    <span className="sidebar__link-icon">
                        <img src="/images/adr_archive_logo.svg" alt="Archived Reports" className="sidebar__link-icon-img" />
                    </span>
                    <span className="sidebar__link-text">Archive</span>
                </NavLink>
            </nav>

            {(user?.role_id === 2 || user?.role_id === 3) && (
                <div className="sidebar__settings">
                    <NavLink 
                        to="/settings" 
                        className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                    >
                        <span className="sidebar__link-icon">
                            <img src="/images/setting_logo.svg" alt="Settings" className="sidebar__link-icon-img" />
                        </span>
                        <span className="sidebar__link-text">Settings</span>
                    </NavLink>
                </div>
            )}
        </aside>
    );
}

export default Sidebar;
