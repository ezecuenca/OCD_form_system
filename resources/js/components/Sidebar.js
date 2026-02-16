import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
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
        </aside>
    );
}

export default Sidebar;
