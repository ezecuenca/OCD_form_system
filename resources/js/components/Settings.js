import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Settings() {
    const accounts = [];
    const [activeSection, setActiveSection] = useState('templates');
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get('/api/auth/me')
            .then((res) => {
                setUser(res.data);
                // Set initial section based on role
                if (res.data?.role_id === 3) {
                    setActiveSection('accounts');
                } else {
                    setActiveSection('templates');
                }
            })
            .catch(() => {
                setUser(null);
            });
    }, []);

    let sectionContent;
    switch (activeSection) {
        case 'accounts':
            sectionContent = user?.role_id === 3 ? (
                <>
                    <div className="settings__panel-header">
                        <h2 id="accounts-title" className="settings__section-title">Account Management</h2>
                    </div>
                    <div className="settings__table">
                        <table>
                            <thead>
                                <tr>
                                    <th className="settings__table-check">
                                        <input type="checkbox" aria-label="Select all accounts" />
                                    </th>
                                    <th>User</th>
                                    <th>Status</th>
                                    <th>Role</th>
                                    <th className="settings__table-actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                            No accounts yet. Add an account to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    accounts.map((account) => (
                                        <tr key={account.id}>
                                            <td className="settings__table-check">
                                                <input type="checkbox" aria-label={`Select ${account.name}`} />
                                            </td>
                                            <td>{account.name}</td>
                                            <td>
                                                <span className="settings__status settings__status--online">{account.status}</span>
                                            </td>
                                            <td>{account.role}</td>
                                            <td className="settings__table-actions">
                                                <button type="button" className="settings__icon-button" aria-label="Edit account">
                                                    <img src="/images/edit_icon.svg" alt="" aria-hidden="true" />
                                                </button>
                                                <button type="button" className="settings__icon-button" aria-label="Disable account">
                                                    <img src="/images/disable_icon.svg" alt="" aria-hidden="true" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : null;
            break;
        case 'templates':
            sectionContent = (
                <>
                    <div className="settings__panel-header">
                        <h2 id="templates-title" className="settings__section-title">Templates</h2>
                    </div>
                    <div className="settings__table">
                        <table>
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        Templates page placeholder.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            );
            break;
        case 'departments':
        default:
            sectionContent = (
                <>
                    <div className="settings__panel-header">
                        <h2 id="departments-title" className="settings__section-title">Departments</h2>
                    </div>
                    <div className="settings__table">
                        <table>
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        Departments page placeholder.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            );
            break;
    }

    return (
        <div className="settings">
            <div className="settings__header">
                <h1 className="settings__title">Admin Settings</h1>
            </div>
            
            <div className="settings__content">
                <section className="settings__panel" aria-label="Admin settings">
                    <aside className="settings__subnav" aria-label="Settings sections">
                        {user?.role_id === 3 && (
                            <button
                                type="button"
                                className={`settings__subnav-item ${activeSection === 'accounts' ? 'settings__subnav-item--active' : ''}`}
                                onClick={() => setActiveSection('accounts')}
                            >
                                Accounts
                            </button>
                        )}
                        <button
                            type="button"
                            className={`settings__subnav-item ${activeSection === 'templates' ? 'settings__subnav-item--active' : ''}`}
                            onClick={() => setActiveSection('templates')}
                        >
                            Templates
                        </button>
                        <button
                            type="button"
                            className={`settings__subnav-item ${activeSection === 'departments' ? 'settings__subnav-item--active' : ''}`}
                            onClick={() => setActiveSection('departments')}
                        >
                            Departments
                        </button>
                    </aside>

                    <div className="settings__panel-body">
                        {sectionContent}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Settings;
