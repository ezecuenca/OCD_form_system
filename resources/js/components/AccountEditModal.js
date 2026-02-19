import React, { useEffect, useState } from 'react';

function AccountEditModal({
    isOpen,
    account,
    sections = [],
    sectionsLoading = false,
    sectionsError = null,
    onClose,
    onSave,
    saving = false,
}) {
    const [fullName, setFullName] = useState('');
    const [position, setPosition] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [roleId, setRoleId] = useState('1');

    useEffect(() => {
        if (!isOpen) return;
        setFullName(account?.raw_full_name ?? account?.full_name ?? '');
        setPosition(account?.position ?? '');
        setSectionId(account?.section_id ? String(account.section_id) : '');
        setRoleId(account?.role_id ? String(account.role_id) : '1');
    }, [account, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!onSave) return;
        onSave({
            full_name: fullName.trim() || null,
            position: position.trim() || null,
            section_id: sectionId ? Number(sectionId) : null,
            role_id: roleId ? Number(roleId) : null,
        });
    };

    return (
        <div className="settings__modal-overlay" onClick={onClose} role="presentation">
            <div
                className="settings__modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="account-modal-title"
            >
                <h3 id="account-modal-title" className="settings__modal-title">Edit Account</h3>
                <div className="settings__modal-field">
                    <label htmlFor="account-full-name">Full name</label>
                    <input
                        id="account-full-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Jane Dela Cruz"
                        autoFocus
                    />
                </div>
                <div className="settings__modal-field">
                    <label htmlFor="account-position">Position</label>
                    <input
                        id="account-position"
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="e.g. Operations Officer"
                    />
                </div>
                <div className="settings__modal-field">
                    <label htmlFor="account-section">Section</label>
                    <select
                        id="account-section"
                        value={sectionId}
                        onChange={(e) => setSectionId(e.target.value)}
                    >
                        <option value="">No section</option>
                        {sections.map((section) => (
                            <option key={section.id} value={section.id}>
                                {section.name}
                            </option>
                        ))}
                    </select>
                    {sectionsLoading && (
                        <div className="settings__modal-help">Loading sections...</div>
                    )}
                    {sectionsError && (
                        <div className="settings__modal-error" role="alert">{sectionsError}</div>
                    )}
                </div>
                <div className="settings__modal-field">
                    <label htmlFor="account-role">Role</label>
                    <select
                        id="account-role"
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                    >
                        <option value="1">User</option>
                        <option value="2">Admin</option>
                        <option value="3">Super Admin</option>
                    </select>
                </div>
                <div className="settings__modal-actions">
                    <button type="button" className="settings__modal-btn settings__modal-btn--cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="settings__modal-btn settings__modal-btn--save" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AccountEditModal;
