import React from 'react';

function Settings() {
    return (
        <div className="settings">
            <div className="settings__header">
            </div>
            
            <div className="settings__content">
                <section className="settings__section" aria-labelledby="accounts-title">
                    <h2 id="accounts-title" className="settings__section-title">Accounts</h2>
                    <p className="settings__section-description">
                        Manage admin accounts and access.
                    </p>

                    <div className="settings__section-body">
                        <div className="settings__card">
                            <div className="settings__card-header">
                                <h3 className="settings__card-title">Accounts Management</h3>
                            </div>
                            <div className="settings__card-body">
                                <p className="settings__muted">
                                    Add, edit, or deactivate admin accounts.
                                </p>
                                <div className="settings__actions">
                                    <button type="button" className="settings__button settings__button--primary">
                                        Add Account
                                    </button>
                                    <button type="button" className="settings__button">
                                        View Accounts
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Settings;
