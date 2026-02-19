import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';
import SuccessNotification from './SuccessNotification';
import TemplateViewModal from './TemplateViewModal';
import AccountEditModal from './AccountEditModal';

function Settings() {
    const [accounts, setAccounts] = useState([]);
    const [accountsLoading, setAccountsLoading] = useState(false);
    const [accountsError, setAccountsError] = useState(null);
    const [activeSection, setActiveSection] = useState('accounts');
    const [sections, setSections] = useState([]);
    const [archivedSections, setArchivedSections] = useState([]);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    const [sectionsError, setSectionsError] = useState(null);
    const [departmentTab, setDepartmentTab] = useState('active');
    const [selectedActiveIds, setSelectedActiveIds] = useState([]);
    const [selectedArchivedIds, setSelectedArchivedIds] = useState([]);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [sectionNameInput, setSectionNameInput] = useState('');
    const [sectionSaving, setSectionSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    const [showAccountModal, setShowAccountModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [accountSaving, setAccountSaving] = useState(false);
    const [accountSections, setAccountSections] = useState([]);
    const [accountSectionsLoading, setAccountSectionsLoading] = useState(false);
    const [accountSectionsError, setAccountSectionsError] = useState(null);

    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [templatesError, setTemplatesError] = useState(null);
    const [templateToView, setTemplateToView] = useState(null);
    const [templateUploading, setTemplateUploading] = useState(false);
    const templateFileInputRef = useRef(null);

    const roleIdLabels = {
        1: 'User',
        2: 'Admin',
        3: 'Super Admin',
    };

    const normalizeRoleLabel = (value) => {
        if (!value) return null;
        const raw = String(value).trim();
        if (!raw) return null;
        const lowered = raw.toLowerCase();
        if (lowered === 'user') return 'User';
        if (lowered === 'admin') return 'Admin';
        if (lowered === 'super admin' || lowered === 'super_admin' || lowered === 'superadmin') return 'Super Admin';
        return raw;
    };

    const mapProfileToAccount = (profile) => {
        const user = profile?.user || {};
        const rawFullName = profile?.raw_full_name ?? '';
        const trimmedFullName = rawFullName ? String(rawFullName).trim() : '';
        const name = trimmedFullName || 'No full name yet';
        const roleId = profile?.role_id || user?.role_id || null;
        const roleName = normalizeRoleLabel(profile?.role_name || profile?.role || user?.role_name || user?.role);
        const role = roleIdLabels[roleId] || roleName || '—';
        let status = profile?.status || user?.status || null;
        if (!status && typeof profile?.is_active === 'boolean') {
            status = profile.is_active ? 'Active' : 'Disabled';
        }
        if (!status && typeof user?.is_active === 'boolean') {
            status = user.is_active ? 'Active' : 'Disabled';
        }
        if (!status) status = 'Active';
        return {
            id: profile?.id || user?.id || name,
            profile_id: profile?.id || null,
            user_id: profile?.user_id || user?.id || null,
            raw_full_name: rawFullName,
            full_name: profile?.full_name || null,
            position: profile?.position || '',
            section_id: profile?.section_id || null,
            role_id: roleId,
            name,
            status,
            role,
        };
    };

    useEffect(() => {
        if (activeSection !== 'accounts') return;
        setAccountsLoading(true);
        setAccountsError(null);
        axios.get('/api/profiles')
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                setAccounts(data.map(mapProfileToAccount));
            })
            .catch((err) => {
                setAccountsError(err?.response?.data?.message || 'Failed to load accounts.');
                setAccounts([]);
            })
            .finally(() => setAccountsLoading(false));
    }, [activeSection]);

    useEffect(() => {
        if (!showAccountModal) return;
        setAccountSectionsLoading(true);
        setAccountSectionsError(null);
        axios.get('/api/sections')
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                setAccountSections(data);
            })
            .catch((err) => {
                setAccountSectionsError(err?.response?.data?.message || 'Failed to load sections.');
                setAccountSections([]);
            })
            .finally(() => setAccountSectionsLoading(false));
    }, [showAccountModal]);

    useEffect(() => {
        if (activeSection !== 'departments') return;
        setSectionsLoading(true);
        setSectionsError(null);
        Promise.all([
            axios.get('/api/sections'),
            axios.get('/api/sections?archived=1'),
        ])
            .then(([activeRes, archivedRes]) => {
                const toSection = (s) => ({
                    id: s.id,
                    name: s.name || s.label || '',
                    is_archived: !!s.is_archived,
                    created_at: s.created_at || null,
                    archived_at: s.archived_at || null,
                });
                const activeData = Array.isArray(activeRes.data) ? activeRes.data : [];
                const archivedData = Array.isArray(archivedRes.data) ? archivedRes.data : [];
                setSections(activeData.map(toSection));
                setArchivedSections(archivedData.map(toSection));
            })
            .catch((err) => {
                setSectionsError(err?.response?.data?.message || 'Failed to load sections.');
                setSections([]);
                setArchivedSections([]);
            })
            .finally(() => setSectionsLoading(false));
    }, [activeSection]);

    useEffect(() => {
        if (activeSection !== 'templates') return;
        setTemplatesLoading(true);
        setTemplatesError(null);
        axios.get('/api/templates')
            .then((res) => setTemplates(Array.isArray(res.data) ? res.data : []))
            .catch((err) => {
                setTemplatesError(err?.response?.data?.message || 'Failed to load templates.');
                setTemplates([]);
            })
            .finally(() => setTemplatesLoading(false));
    }, [activeSection]);

    const openCreateSection = () => {
        setEditingSection(null);
        setSectionNameInput('');
        setShowSectionModal(true);
    };

    const openEditSection = (section) => {
        setEditingSection(section);
        setSectionNameInput(section.name);
        setShowSectionModal(true);
    };

    const closeSectionModal = () => {
        setShowSectionModal(false);
        setEditingSection(null);
        setSectionNameInput('');
    };

    const saveSection = () => {
        const name = sectionNameInput.trim();
        if (!name) return;
        setSectionSaving(true);
        const promise = editingSection
            ? axios.put(`/api/sections/${editingSection.id}`, { name })
            : axios.post('/api/sections', { name });
        promise
            .then((res) => {
                const updated = res.data;
                const row = {
                    id: updated.id,
                    name: updated.name,
                    is_archived: !!updated.is_archived,
                    created_at: updated.created_at || null,
                    archived_at: updated.archived_at || null,
                };
                if (editingSection) {
                    setSections((prev) =>
                        prev.map((s) => (s.id === updated.id ? { ...s, ...row } : s))
                    );
                } else {
                    setSections((prev) => [...prev, row]);
                }
                setSuccessMessage('Section saved successfully.');
                setShowSuccessNotification(true);
                closeSectionModal();
            })
            .catch((err) => {
                alert(err?.response?.data?.message || 'Failed to save section.');
            })
            .finally(() => setSectionSaving(false));
    };

    const archiveSection = (section) => {
        setConfirmMessage(`Are you sure you want to archive section "${section.name}"?`);
        setConfirmAction(() => () => {
            axios.patch(`/api/sections/${section.id}/archive`)
                .then((res) => {
                    const data = res.data;
                    setSections((prev) => prev.filter((s) => s.id !== section.id));
                    setArchivedSections((prev) => [...prev, {
                        id: data.id,
                        name: data.name,
                        is_archived: true,
                        created_at: data.created_at || section.created_at,
                        archived_at: data.archived_at || null,
                    }]);
                    setSuccessMessage('Section archived successfully.');
                    setShowSuccessNotification(true);
                    setShowConfirmModal(false);
                })
                .catch((err) => {
                    alert(err?.response?.data?.message || 'Failed to archive section.');
                    setShowConfirmModal(false);
                });
        });
        setShowConfirmModal(true);
    };

    const restoreSection = (section) => {
        setConfirmMessage(`Are you sure you want to restore section "${section.name}"?`);
        setConfirmAction(() => () => {
            axios.patch(`/api/sections/${section.id}/restore`)
                .then((res) => {
                    const data = res.data;
                    setArchivedSections((prev) => prev.filter((s) => s.id !== section.id));
                    setSections((prev) => [...prev, {
                        id: data.id,
                        name: data.name,
                        is_archived: false,
                        created_at: data.created_at || section.created_at,
                        archived_at: null,
                    }]);
                    setSuccessMessage('Section restored successfully.');
                    setShowSuccessNotification(true);
                    setShowConfirmModal(false);
                })
                .catch((err) => {
                    alert(err?.response?.data?.message || 'Failed to restore section.');
                    setShowConfirmModal(false);
                });
        });
        setShowConfirmModal(true);
    };

    const toggleActiveSelection = (id) => {
        setSelectedActiveIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleArchivedSelection = (id) => {
        setSelectedArchivedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleArchiveSelected = () => {
        if (selectedActiveIds.length === 0) return;
        const count = selectedActiveIds.length;
        setConfirmMessage(`Are you sure you want to archive (${count}) section(s)?`);
        setConfirmAction(() => () => {
            Promise.all(selectedActiveIds.map((id) => axios.patch(`/api/sections/${id}/archive`)))
                .then((responses) => {
                    const moved = responses.map((r) => r.data).map((d) => ({
                        id: d.id,
                        name: d.name,
                        is_archived: true,
                        created_at: d.created_at || null,
                        archived_at: d.archived_at || null,
                    }));
                    setSections((prev) => prev.filter((s) => !selectedActiveIds.includes(s.id)));
                    setArchivedSections((prev) => [...prev, ...moved]);
                    setSelectedActiveIds([]);
                    setSuccessMessage(
                        count === 1 ? 'Section archived successfully.' : 'Sections archived successfully.'
                    );
                    setShowSuccessNotification(true);
                    setShowConfirmModal(false);
                })
                .catch((err) => {
                    alert(err?.response?.data?.message || 'Failed to archive some sections.');
                    setShowConfirmModal(false);
                });
        });
        setShowConfirmModal(true);
    };

    const handleRestoreSelected = () => {
        if (selectedArchivedIds.length === 0) return;
        const count = selectedArchivedIds.length;
        setConfirmMessage(`Are you sure you want to restore (${count}) section(s)?`);
        setConfirmAction(() => () => {
            Promise.all(selectedArchivedIds.map((id) => axios.patch(`/api/sections/${id}/restore`)))
                .then((responses) => {
                    const moved = responses.map((r) => r.data).map((d) => ({
                        id: d.id,
                        name: d.name,
                        is_archived: false,
                        created_at: d.created_at || null,
                        archived_at: null,
                    }));
                    setArchivedSections((prev) => prev.filter((s) => !selectedArchivedIds.includes(s.id)));
                    setSections((prev) => [...prev, ...moved]);
                    setSelectedArchivedIds([]);
                    setSuccessMessage(
                        count === 1 ? 'Section restored successfully.' : 'Sections restored successfully.'
                    );
                    setShowSuccessNotification(true);
                    setShowConfirmModal(false);
                })
                .catch((err) => {
                    alert(err?.response?.data?.message || 'Failed to restore some sections.');
                    setShowConfirmModal(false);
                });
        });
        setShowConfirmModal(true);
    };

    const formatSectionDate = (isoString) => {
        if (!isoString) return { date: '—', time: '' };
        const d = new Date(isoString);
        return {
            date: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        };
    };

    const formatTemplateDate = (isoString) => {
        if (!isoString) return { date: '—', time: '' };
        const d = new Date(isoString);
        return {
            date: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        };
    };

    const viewTemplate = (filename, name) => {
        setTemplateToView({ filename, name: name || filename });
    };

    const handleAddTemplateClick = () => {
        templateFileInputRef.current?.click();
    };

    const handleTemplateFileChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const ext = (file.name || '').toLowerCase().split('.').pop();
        if (ext !== 'docx') {
            setTemplatesError('Only .docx files are allowed.');
            return;
        }
        setTemplateUploading(true);
        setTemplatesError(null);
        const formData = new FormData();
        formData.append('template', file);
        axios.post('/api/templates', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
            .then((res) => {
                const data = res.data;
                setTemplates((prev) => [...prev, { name: data.name, filename: data.filename, updated_at: data.updated_at, is_active: !!data.is_active }].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })));
                setSuccessMessage('Template added successfully.');
                setShowSuccessNotification(true);
            })
            .catch((err) => {
                setTemplatesError(err?.response?.data?.message || 'Failed to add template.');
            })
            .finally(() => setTemplateUploading(false));
    };

    const setTemplateInUse = (tpl) => {
        axios.patch('/api/templates/set-active', { template_name: tpl.name })
            .then(() => {
                setTemplates((prev) => prev.map((t) => ({ ...t, is_active: t.filename === tpl.filename })));
                setSuccessMessage('Template set as in use.');
                setShowSuccessNotification(true);
            })
            .catch((err) => {
                setTemplatesError(err?.response?.data?.message || 'Failed to set template in use.');
            });
    };

    const deleteSection = (section) => {
        if (!window.confirm(`Permanently delete section "${section.name}"? This cannot be undone.`)) return;
        axios.delete(`/api/sections/${section.id}`)
            .then(() => {
                setArchivedSections((prev) => prev.filter((s) => s.id !== section.id));
                setSuccessMessage('Section deleted successfully.');
                setShowSuccessNotification(true);
            })
            .catch((err) => {
                alert(err?.response?.data?.message || 'Failed to delete section.');
            });
    };

    const openEditAccount = (account) => {
        setEditingAccount(account);
        setShowAccountModal(true);
    };

    const closeAccountModal = () => {
        setShowAccountModal(false);
        setEditingAccount(null);
    };

    const saveAccount = (payload) => {
        if (!editingAccount?.profile_id) return;
        setAccountSaving(true);
        axios.put(`/api/profiles/${editingAccount.profile_id}`, payload)
            .then((res) => {
                const updated = mapProfileToAccount(res.data);
                setAccounts((prev) => prev.map((item) => (
                    item.profile_id === updated.profile_id ? { ...item, ...updated } : item
                )));
                setSuccessMessage('Account updated successfully.');
                setShowSuccessNotification(true);
                closeAccountModal();
            })
            .catch((err) => {
                alert(err?.response?.data?.message || 'Failed to update account.');
            })
            .finally(() => setAccountSaving(false));
    };

    let sectionContent;
    switch (activeSection) {
        case 'accounts':
            sectionContent = (
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
                                {accountsLoading ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                            Loading...
                                        </td>
                                    </tr>
                                ) : accountsError ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#c00' }}>
                                            {accountsError}
                                        </td>
                                    </tr>
                                ) : accounts.length === 0 ? (
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
                                                <button
                                                    type="button"
                                                    className="settings__icon-button"
                                                    aria-label="Edit account"
                                                    onClick={() => openEditAccount(account)}
                                                >
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
            );
            break;
        case 'templates':
            sectionContent = (
                <>
                    <div className="settings__panel-header settings__panel-header--row">
                        <h2 id="templates-title" className="settings__section-title">Templates</h2>
                        <div className="settings__panel-header-actions">
                            <input
                                ref={templateFileInputRef}
                                type="file"
                                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleTemplateFileChange}
                                style={{ display: 'none' }}
                                aria-hidden="true"
                            />
                            <button
                                type="button"
                                className="settings__create-btn"
                                onClick={handleAddTemplateClick}
                                disabled={templateUploading}
                                aria-label="Add template"
                            >
                                <img src={`${window.location.origin}/images/create_icon.svg`} alt="" />
                                {templateUploading ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>
                    <div className="settings__table">
                        <table className="settings__table--departments">
                            <thead>
                                <tr>
                                    <th className="settings__table-check">
                                        <input type="checkbox" aria-label="Select all templates" disabled />
                                    </th>
                                    <th className="settings__table-actions">Actions</th>
                                    <th>Template</th>
                                    <th className="settings__table-created">Updated at</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templatesLoading ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                            Loading...
                                        </td>
                                    </tr>
                                ) : templatesError ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#c00' }}>
                                            {templatesError}
                                        </td>
                                    </tr>
                                ) : templates.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                            No templates yet. Click &quot;Add&quot; to upload a .docx template.
                                        </td>
                                    </tr>
                                ) : (
                                    templates.map((tpl) => (
                                        <tr key={tpl.filename}>
                                            <td className="settings__table-check">
                                                <input type="checkbox" aria-label={`Select ${tpl.name}`} disabled />
                                            </td>
                                            <td className="settings__table-actions settings__template-actions">
                                                <div className="settings__template-actions-inner">
                                                    {tpl.is_active ? (
                                                        <span className="settings__in-use-text">In use</span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="settings__icon-button settings__icon-button--check"
                                                            aria-label={`Set ${tpl.name} as in use`}
                                                            onClick={() => setTemplateInUse(tpl)}
                                                        >
                                                            <img src="/images/check_icon.svg" alt="" aria-hidden="true" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="settings__icon-button"
                                                        aria-label={`View ${tpl.name}`}
                                                        onClick={() => viewTemplate(tpl.filename, tpl.name)}
                                                    >
                                                        <img src="/images/view_icon.svg" alt="" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>{tpl.name}</td>
                                            <td className="settings__table-created">
                                                <div className="settings__table-created-datetime">
                                                    <div className="settings__table-created-date">{formatTemplateDate(tpl.updated_at).date}</div>
                                                    {formatTemplateDate(tpl.updated_at).time && (
                                                        <div className="settings__table-created-time">{formatTemplateDate(tpl.updated_at).time}</div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
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
                    <div className="settings__panel-header settings__panel-header--row">
                        <h2 id="departments-title" className="settings__section-title">Departments</h2>
                        <div className="settings__panel-header-actions">
                            {departmentTab === 'active' && (
                                <>
                                    <button
                                        type="button"
                                        className="settings__archive-btn"
                                        onClick={handleArchiveSelected}
                                        disabled={selectedActiveIds.length === 0}
                                    >
                                        <img src={`${window.location.origin}/images/delete_icon.svg`} alt="" />
                                        Archive
                                    </button>
                                    <button type="button" className="settings__create-btn" onClick={openCreateSection}>
                                        <img src={`${window.location.origin}/images/create_icon.svg`} alt="Create" />
                                        Create New
                                    </button>
                                </>
                            )}
                            {departmentTab === 'archived' && (
                                <button
                                    type="button"
                                    className="settings__restore-btn"
                                    onClick={handleRestoreSelected}
                                    disabled={selectedArchivedIds.length === 0}
                                >
                                    <img src={`${window.location.origin}/images/restore_icon.svg`} alt="" />
                                    Restore
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="settings__dept-tabs">
                        <button
                            type="button"
                            className={`settings__dept-tab ${departmentTab === 'active' ? 'settings__dept-tab--active' : ''}`}
                            onClick={() => {
                                setDepartmentTab('active');
                                setSelectedArchivedIds([]);
                            }}
                        >
                            Active Section
                        </button>
                        <button
                            type="button"
                            className={`settings__dept-tab ${departmentTab === 'archived' ? 'settings__dept-tab--active' : ''}`}
                            onClick={() => {
                                setDepartmentTab('archived');
                                setSelectedActiveIds([]);
                            }}
                        >
                            Archived Section
                        </button>
                    </div>
                    <div className="settings__table">
                        <table className="settings__table--departments">
                            <thead>
                                <tr>
                                    <th className="settings__table-check">
                                        <input
                                            type="checkbox"
                                            aria-label={departmentTab === 'active' ? 'Select all active sections' : 'Select all archived sections'}
                                            checked={
                                                departmentTab === 'active'
                                                    ? sections.length > 0 && selectedActiveIds.length === sections.length
                                                    : archivedSections.length > 0 && selectedArchivedIds.length === archivedSections.length
                                            }
                                            onChange={(e) => {
                                                if (departmentTab === 'active') {
                                                    setSelectedActiveIds(e.target.checked ? sections.map((s) => s.id) : []);
                                                } else {
                                                    setSelectedArchivedIds(e.target.checked ? archivedSections.map((s) => s.id) : []);
                                                }
                                            }}
                                        />
                                    </th>
                                    <th className="settings__table-actions">Actions</th>
                                    <th>Section</th>
                                    <th className="settings__table-created">Created at</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departmentTab === 'active' ? (
                                    sectionsLoading ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : sectionsError ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#c00' }}>
                                                {sectionsError}
                                            </td>
                                        </tr>
                                    ) : sections.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                                No sections yet. Click "Create New" to add one.
                                            </td>
                                        </tr>
                                    ) : (
                                        sections.map((section) => (
                                            <tr key={section.id}>
                                                <td className="settings__table-check">
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Select ${section.name}`}
                                                        checked={selectedActiveIds.includes(section.id)}
                                                        onChange={() => toggleActiveSelection(section.id)}
                                                    />
                                                </td>
                                                <td className="settings__table-actions">
                                                    <button
                                                        type="button"
                                                        className="settings__icon-button"
                                                        aria-label="Edit section"
                                                        onClick={() => openEditSection(section)}
                                                    >
                                                        <img src="/images/edit_icon.svg" alt="" aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="settings__icon-button"
                                                        aria-label="Archive section"
                                                        onClick={() => archiveSection(section)}
                                                    >
                                                        <img src="/images/delete_icon.svg" alt="" aria-hidden="true" />
                                                    </button>
                                                </td>
                                                <td>{section.name}</td>
                                                <td className="settings__table-created">
                                                    <div className="settings__table-created-datetime">
                                                        <div className="settings__table-created-date">{formatSectionDate(section.created_at).date}</div>
                                                        {formatSectionDate(section.created_at).time && (
                                                            <div className="settings__table-created-time">{formatSectionDate(section.created_at).time}</div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                ) : (
                                    sectionsLoading ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : archivedSections.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                                No archived sections.
                                            </td>
                                        </tr>
                                    ) : (
                                        archivedSections.map((section) => (
                                            <tr key={section.id}>
                                                <td className="settings__table-check">
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Select ${section.name}`}
                                                        checked={selectedArchivedIds.includes(section.id)}
                                                        onChange={() => toggleArchivedSelection(section.id)}
                                                    />
                                                </td>
                                                <td className="settings__table-actions">
                                                    <button
                                                        type="button"
                                                        className="settings__icon-button"
                                                        aria-label="Restore section"
                                                        onClick={() => restoreSection(section)}
                                                    >
                                                        <img src="/images/restore_icon.svg" alt="" aria-hidden="true" />
                                                    </button>
                                                </td>
                                                <td>{section.name}</td>
                                                <td className="settings__table-created">
                                                    <div className="settings__table-created-datetime">
                                                        <div className="settings__table-created-date">{formatSectionDate(section.created_at).date}</div>
                                                        {formatSectionDate(section.created_at).time && (
                                                            <div className="settings__table-created-time">{formatSectionDate(section.created_at).time}</div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                    {showSectionModal && (
                        <div className="settings__modal-overlay" onClick={closeSectionModal} role="presentation">
                            <div className="settings__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="section-modal-title">
                                <h3 id="section-modal-title" className="settings__modal-title">
                                    {editingSection ? 'Edit Section' : 'New Section'}
                                </h3>
                                <div className="settings__modal-field">
                                    <label htmlFor="section-name-input">Section name</label>
                                    <input
                                        id="section-name-input"
                                        type="text"
                                        value={sectionNameInput}
                                        onChange={(e) => setSectionNameInput(e.target.value)}
                                        placeholder="e.g. Operations"
                                        autoFocus
                                    />
                                </div>
                                <div className="settings__modal-actions">
                                    <button type="button" className="settings__modal-btn settings__modal-btn--cancel" onClick={closeSectionModal}>
                                        Cancel
                                    </button>
                                    <button type="button" className="settings__modal-btn settings__modal-btn--save" onClick={saveSection} disabled={sectionSaving || !sectionNameInput.trim()}>
                                        {sectionSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
                        <button
                            type="button"
                            className={`settings__subnav-item ${activeSection === 'accounts' ? 'settings__subnav-item--active' : ''}`}
                            onClick={() => setActiveSection('accounts')}
                        >
                            Accounts
                        </button>
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

            <ConfirmModal
                isOpen={showConfirmModal}
                message={confirmMessage}
                onConfirm={() => { if (typeof confirmAction === 'function') confirmAction(); }}
                onCancel={() => setShowConfirmModal(false)}
            />

            <SuccessNotification
                message={successMessage}
                isVisible={showSuccessNotification}
                onClose={() => setShowSuccessNotification(false)}
            />

            <TemplateViewModal
                isOpen={!!templateToView}
                templateFilename={templateToView?.filename}
                templateName={templateToView?.name}
                onClose={() => setTemplateToView(null)}
            />

            <AccountEditModal
                isOpen={showAccountModal}
                account={editingAccount}
                sections={accountSections}
                sectionsLoading={accountSectionsLoading}
                sectionsError={accountSectionsError}
                onClose={closeAccountModal}
                onSave={saveAccount}
                saving={accountSaving}
            />
        </div>
    );
}

export default Settings;
