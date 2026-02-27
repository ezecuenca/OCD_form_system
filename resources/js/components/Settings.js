import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ConfirmModal from './ConfirmModal';
import SuccessNotification from './SuccessNotification';
import TemplateViewModal from './TemplateViewModal';
import AccountEditModal from './AccountEditModal';

function Settings() {
    const [user, setUser] = useState(null);
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
    const [selectedTemplateFilenames, setSelectedTemplateFilenames] = useState(() => new Set());
    const [templateTab, setTemplateTab] = useState('adr');
    const templateFileInputRef = useRef(null);
    const selectAllTemplatesRef = useRef(null);

    // Fetch user info for role check
    useEffect(() => {
        axios.get('/api/auth/me')
            .then((res) => {
                setUser(res.data);
            })
            .catch(() => {
                setUser(null);
            });
    }, []);

    const isSuperAdmin = user?.role_id === 3;

    // Retention period state
    const [retentionValue, setRetentionValue] = useState(30);
    const [retentionUnit, setRetentionUnit] = useState('days');
    const [retentionEnabled, setRetentionEnabled] = useState(true);
    const [isRetentionChanged, setIsRetentionChanged] = useState(false);

    const [purgeEnabled, setPurgeEnabled] = useState(false);
    const [purgeAfterValue, setPurgeAfterValue] = useState(30);
    const [purgeAfterUnit, setPurgeAfterUnit] = useState('days');
    const [isPurgeChanged, setIsPurgeChanged] = useState(false);

    // Preview & days left
    const [retentionPreview, setRetentionPreview] = useState({ adr_count: 0, swap_count: 0 });
    const [daysUntilArchive, setDaysUntilArchive] = useState({ 
        retention_in_days: null,
        retention_value: null,
        retention_unit: 'days',
        hours_left: null,
        minutes_left: null,
        adr_days: null, 
        swap_days: null
    });

    // Cutoff date is the date before which records are considered expired
    const getCutoffDate = () => {
        const cutoff = new Date();

        switch (retentionUnit) {
            case 'days':
                cutoff.setDate(cutoff.getDate() - retentionValue);
                break;
            case 'months':
                cutoff.setMonth(cutoff.getMonth() - retentionValue);
                break;
            case 'years':
                cutoff.setFullYear(cutoff.getFullYear() - retentionValue);
                break;
            default:
                cutoff.setDate(cutoff.getDate() - retentionValue);
        }

        // Set to end of the cutoff day (common for retention policies)
        cutoff.setHours(23, 59, 59, 999);

        return cutoff;
    };

    const getPurgeCutoffDate = () => {
        const cutoff = new Date();

        switch (purgeAfterUnit) {
            case 'days':
                cutoff.setDate(cutoff.getDate() - purgeAfterValue);
                break;
            case 'months':
                cutoff.setMonth(cutoff.getMonth() - purgeAfterValue);
                break;
            case 'years':
                cutoff.setFullYear(cutoff.getFullYear() - purgeAfterValue);
                break;
            default:
                cutoff.setDate(cutoff.getDate() - purgeAfterValue);
        }

        cutoff.setHours(23, 59, 59, 999);

        return cutoff;
    };

    // Format time left - shows hours/minutes if within same day
    const formatTimeLeft = () => {
        const { adr_days, swap_days, retention_value, retention_unit } = daysUntilArchive;

        const dayValues = [adr_days, swap_days].filter((value) => typeof value === 'number');
        if (dayValues.length > 0) {
            const minDays = Math.min(...dayValues);
            if (minDays <= 0) {
                return 'Ready to archive';
            }
            return `${minDays} day${minDays !== 1 ? 's' : ''} left`;
        }

        if (retention_value !== null) {
            return `${retention_value} ${retention_value === 1 ? 'day' : retention_unit} left`;
        }

        return `${retentionValue} ${retentionValue === 1 ? 'day' : retentionUnit} left`;
    };

    // Fetch preview and days left when retention changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.post('/api/data-retention/preview', {
                    retention_value: retentionValue,
                    retention_unit: retentionUnit,
                });
                setRetentionPreview({
                    adr_count: res.data.adr_to_archive || 0,
                    swap_count: res.data.swap_to_archive || 0,
                });
            } catch (err) {
                console.error('Preview fetch failed:', err);
            }

            try {
                const daysRes = await axios.post('/api/data-retention/days-until-archive', {
                    retention_value: retentionValue,
                    retention_unit: retentionUnit,
                });
                setDaysUntilArchive({
                    retention_in_days: daysRes.data.retention_in_days,
                    retention_value: daysRes.data.retention_value,
                    retention_unit: daysRes.data.retention_unit,
                    hours_left: daysRes.data.hours_left,
                    minutes_left: daysRes.data.minutes_left,
                    adr_days: daysRes.data.days_until_adr_archive,
                    swap_days: daysRes.data.days_until_swap_archive,
                });
            } catch (err) {
                console.error('Days until archive fetch failed:', err);
            }
        };

        fetchData();
    }, [retentionValue, retentionUnit]);

    // Reset changed flag when leaving tab
    useEffect(() => {
        if (activeSection !== 'data-retention') {
            setIsRetentionChanged(false);
        }
    }, [activeSection]);

    useEffect(() => {
        if (activeSection !== 'data-retention') return;

        let isMounted = true;
        axios.get('/api/data-retention/settings')
            .then((res) => {
                if (!isMounted) return;
                setRetentionEnabled(!!res.data.enabled);
                setRetentionValue(parseInt(res.data.retention_value, 10) || 30);
                setRetentionUnit(res.data.retention_unit || 'days');
                setPurgeEnabled(!!res.data.purge_enabled);
                setPurgeAfterValue(parseInt(res.data.purge_after_value, 10) || 30);
                setPurgeAfterUnit(res.data.purge_after_unit || 'days');
                setIsRetentionChanged(false);
                setIsPurgeChanged(false);
            })
            .catch(() => {
                if (!isMounted) return;
                setIsRetentionChanged(false);
                setIsPurgeChanged(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeSection]);

    // Filter templates by type
    const filteredTemplates = templates.filter(t => {
        const type = t.type || 'adr';
        if (templateTab === 'adr') {
            return type === 'adr';
        }
        return type === 'swap';
    });

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
        const isActive = typeof profile?.is_active === 'boolean'
            ? profile.is_active
            : typeof user?.is_active === 'boolean'
                ? user.is_active
                : true;
        if (!status) {
            status = isActive ? 'Active' : 'Inactive';
        }
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
            image_path: profile?.image_path || null,
            is_active: isActive,
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
                setSections(Array.isArray(activeRes.data) ? activeRes.data.map(toSection) : []);
                setArchivedSections(Array.isArray(archivedRes.data) ? archivedRes.data.map(toSection) : []);
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

    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible' && activeSection === 'templates') {
                setTemplatesLoading(true);
                setTemplatesError(null);
                axios.get('/api/templates')
                    .then((res) => setTemplates(Array.isArray(res.data) ? res.data : []))
                    .catch((err) => {
                        setTemplatesError(err?.response?.data?.message || 'Failed to load templates.');
                        setTemplates([]);
                    })
                    .finally(() => setTemplatesLoading(false));
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, [activeSection]);

    useEffect(() => {
        const el = selectAllTemplatesRef.current;
        if (!el) return;
        el.indeterminate = templates.length > 0 && selectedTemplateFilenames.size > 0 && selectedTemplateFilenames.size < templates.length;
    }, [templates.length, selectedTemplateFilenames]);

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

    const handleEditTemplate = (tpl) => {
        setConfirmMessage(`Edit template "${tpl.name}"?`);
        setConfirmAction(() => () => {
            const newName = prompt('Enter new template name:', tpl.name);
            if (newName && newName !== tpl.name) {
                axios.patch(`/api/templates/${tpl.id}`, { name: newName })
                    .then(() => {
                        // Refresh templates if needed
                    })
                    .catch(err => {
                        setTemplatesError(err.response?.data?.message || 'Failed to update template');
                    });
            }
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };

    const handleAddTemplateClick = () => {
        templateFileInputRef.current?.click();
    };

    const getTemplateBaseName = (fileName) => {
        const base = (fileName || '').replace(/\.[^.]*$/, '').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().slice(0, 100) || 'template';
        return base;
    };

    const uploadTemplateFile = (file) => {
        setTemplateUploading(true);
        setTemplatesError(null);
        const formData = new FormData();
        formData.append('template', file);
        formData.append('type', templateTab === 'swapping' ? 'swap' : 'adr');
        axios.post('/api/templates', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
            .then((res) => {
                const data = res.data;
                setTemplates((prev) => {
                    const byName = (t) => t.name === data.name;
                    const next = prev.some(byName)
                        ? prev.map((t) => (byName(t) ? { ...t, ...data } : t))
                        : [...prev, data];
                    return next.sort((a, b) => a.name.localeCompare(b.name));
                });
                const replaced = templates.some((t) => t.name === data.name);
                setSuccessMessage(replaced ? 'Template replaced.' : 'Template added.');
                setShowSuccessNotification(true);
            })
            .catch((err) => {
                setTemplatesError(err?.response?.data?.message || 'Failed to add template.');
            })
            .finally(() => setTemplateUploading(false));
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
        const baseName = getTemplateBaseName(file.name);
        const existing = templates.find((t) => t.name === baseName);
        if (existing) {
            setConfirmMessage(`Replace existing template "${baseName}"?`);
            setConfirmAction(() => () => {
                uploadTemplateFile(file);
                setShowConfirmModal(false);
            });
            setShowConfirmModal(true);
            return;
        }
        uploadTemplateFile(file);
    };

    const setTemplateInUse = (tpl) => {
        const nextType = tpl.type || 'adr';
        axios.patch('/api/templates/set-active', { template_name: tpl.name, type: nextType })
            .then(() => {
                setTemplates((prev) => prev.map((t) => {
                    const tType = t.type || 'adr';
                    if (tType !== nextType) {
                        return t;
                    }
                    return {
                        ...t,
                        is_active: t.filename === tpl.filename,
                    };
                }));
                setSuccessMessage('Template set as in use.');
                setShowSuccessNotification(true);
            })
            .catch((err) => {
                setTemplatesError(err?.response?.data?.message || 'Failed to set template in use.');
            });
    };

    const deleteTemplate = (tpl) => {
        setConfirmMessage(`Delete template "${tpl.name}" permanently?`);
        setConfirmAction(() => () => {
            axios.delete(`/api/templates/${encodeURIComponent(tpl.filename)}`)
                .then(() => {
                    setTemplates((prev) => prev.filter((t) => t.filename !== tpl.filename));
                    if (templateToView?.filename === tpl.filename) setTemplateToView(null);
                    setSuccessMessage('Template deleted.');
                    setShowSuccessNotification(true);
                    setShowConfirmModal(false);
                })
                .catch((err) => {
                    setTemplatesError(err?.response?.data?.message || 'Failed to delete template.');
                    setShowConfirmModal(false);
                });
        });
        setShowConfirmModal(true);
    };

    const toggleTemplateSelection = (filename) => {
        setSelectedTemplateFilenames((prev) => {
            const next = new Set(prev);
            if (next.has(filename)) next.delete(filename);
            else next.add(filename);
            return next;
        });
    };

    const toggleSelectAllTemplates = () => {
        setSelectedTemplateFilenames((prev) => {
            if (prev.size === templates.length) return new Set();
            return new Set(templates.map((t) => t.filename));
        });
    };

    const deleteSelectedTemplates = () => {
        const toDelete = new Set(selectedTemplateFilenames);
        setConfirmMessage(`Delete ${toDelete.size} selected template(s) permanently?`);
        setConfirmAction(() => () => {
            Promise.all([...toDelete].map((f) => axios.delete(`/api/templates/${encodeURIComponent(f)}`)))
                .then(() => {
                    setTemplates((prev) => prev.filter((t) => !toDelete.has(t.filename)));
                    if (templateToView && toDelete.has(templateToView.filename)) setTemplateToView(null);
                    setSelectedTemplateFilenames(new Set());
                    setSuccessMessage('Selected templates deleted.');
                    setShowSuccessNotification(true);
                    setShowConfirmModal(false);
                })
                .catch((err) => {
                    setTemplatesError(err?.response?.data?.message || 'Failed to delete some templates.');
                    setShowConfirmModal(false);
                });
        });
        setShowConfirmModal(true);
    };

    const deleteSection = (section) => {
        if (!window.confirm(`Permanently delete section "${section.name}"?`)) return;
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

    const toggleAccountStatus = (account) => {
        if (!account?.profile_id) return;
        const nextActive = !account.is_active;
        const verb = nextActive ? 'Enable' : 'Disable';
        setConfirmMessage(`${verb} account "${account.name}"?`);
        setConfirmAction(() => () => {
            axios.put(`/api/profiles/${account.profile_id}`, { is_active: nextActive })
                .then(() => {
                    setAccounts((prev) => prev.map((item) => (
                        item.profile_id === account.profile_id
                            ? {
                                ...item,
                                is_active: nextActive,
                                status: nextActive ? 'Active' : 'Disabled',
                            }
                            : item
                    )));
                    setSuccessMessage(`Account ${nextActive ? 'enabled' : 'disabled'} successfully.`);
                    setShowSuccessNotification(true);
                    setShowConfirmModal(false);
                })
                .catch((err) => {
                    alert(err?.response?.data?.message || 'Failed to update account status.');
                    setShowConfirmModal(false);
                });
        });
        setShowConfirmModal(true);
    };

    const deleteAccount = (account) => {
        if (!account?.profile_id) return;
        setConfirmMessage(`Delete account "${account.name}"? This action cannot be undone.`);
        setConfirmAction(() => () => {
            axios.delete(`/api/profiles/${account.profile_id}`)
                .then(() => {
                    setAccounts((prev) => prev.filter((item) => item.profile_id !== account.profile_id));
                    setSuccessMessage('Account deleted successfully.');
                    setShowSuccessNotification(true);
                    setShowConfirmModal(false);
                })
                .catch((err) => {
                    alert(err?.response?.data?.message || 'Failed to delete account.');
                    setShowConfirmModal(false);
                });
        });
        setShowConfirmModal(true);
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

    // Save retention settings
    const handleSetRetention = async () => {
        try {
            await axios.put('/api/data-retention/settings', {
                enabled: retentionEnabled,
                retention_value: retentionValue,
                retention_unit: retentionUnit,
                purge_enabled: purgeEnabled,
                purge_after_value: purgeAfterValue,
                purge_after_unit: purgeAfterUnit,
            });

            let archiveResult = null;
            if (retentionEnabled) {
                const archiveRes = await axios.post('/api/data-retention/auto-archive', {
                    retention_value: retentionValue,
                    retention_unit: retentionUnit,
                });
                archiveResult = archiveRes.data;
            }

            if (archiveResult) {
                const archivedTotal = (archiveResult.adr_archived || 0) + (archiveResult.swap_archived || 0);
                if (archivedTotal > 0) {
                    setSuccessMessage(
                        `Retention set to ${retentionValue} ${retentionUnit}. ` +
                        `${archiveResult.adr_archived || 0} ADR report(s) and ` +
                        `${archiveResult.swap_archived || 0} swapping request(s) were archived.`
                    );
                } else {
                    setSuccessMessage(`Retention set to ${retentionValue} ${retentionUnit}. No records to archive.`);
                }
            } else {
                setSuccessMessage('Retention updated. Auto-archive is currently disabled.');
            }

            setShowSuccessNotification(true);
            setIsRetentionChanged(false);
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to update retention settings.');
        }
    };

    const handleSetPurge = async () => {
        try {
            await axios.put('/api/data-retention/settings', {
                enabled: retentionEnabled,
                retention_value: retentionValue,
                retention_unit: retentionUnit,
                purge_enabled: purgeEnabled,
                purge_after_value: purgeAfterValue,
                purge_after_unit: purgeAfterUnit,
            });

            setSuccessMessage(`Purge settings saved. Archived data older than ${purgeAfterValue} ${purgeAfterUnit} will be deleted.`);
            setShowSuccessNotification(true);
            setIsPurgeChanged(false);
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to update purge settings.');
        }
    };

    const handleToggleRetention = async (enabled) => {
        setRetentionEnabled(enabled);
        try {
            await axios.put('/api/data-retention/settings', {
                enabled,
                retention_value: retentionValue,
                retention_unit: retentionUnit,
                purge_enabled: purgeEnabled,
                purge_after_value: purgeAfterValue,
                purge_after_unit: purgeAfterUnit,
            });
            setIsRetentionChanged(false);
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to update auto-archive setting.');
        }
    };

    const handleTogglePurge = async (enabled) => {
        setPurgeEnabled(enabled);
        try {
            await axios.put('/api/data-retention/settings', {
                enabled: retentionEnabled,
                retention_value: retentionValue,
                retention_unit: retentionUnit,
                purge_enabled: enabled,
                purge_after_value: purgeAfterValue,
                purge_after_unit: purgeAfterUnit,
            });
            setIsPurgeChanged(false);
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to update auto-purge setting.');
        }
    };

    let sectionContent;
    switch (activeSection) {
        case 'accounts':
            if (!isSuperAdmin) {
                sectionContent = null;
            } else {
            sectionContent = (
                <>
                    <div className="settings__panel-header">
                        <h2 id="accounts-title" className="settings__section-title">Account Management</h2>
                    </div>
                    <div className="settings__table">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Status</th>
                                    <th>Role</th>
                                    <th className="settings__table-actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accountsLoading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                                ) : accountsError ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#c00' }}>{accountsError}</td></tr>
                                ) : accounts.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No accounts yet.</td></tr>
                                ) : (
                                    accounts.map((account) => (
                                        <tr key={account.id}>
                                            <td>
                                                <div className="settings__user-cell">
                                                    {account.image_path ? (
                                                        <img 
                                                            src={`/${account.image_path}`} 
                                                            alt={account.name} 
                                                            className="settings__user-avatar"
                                                        />
                                                    ) : (
                                                        <img 
                                                            src="/images/ocd_logo.svg" 
                                                            alt={account.name} 
                                                            className="settings__user-avatar"
                                                        />
                                                    )}
                                                    <span>{account.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`settings__status ${account.is_active ? 'settings__status--online' : 'settings__status--offline'}`}
                                                >
                                                    {account.status}
                                                </span>
                                            </td>
                                            <td>{account.role}</td>
                                            <td className="settings__table-actions">
                                                {account.is_active ? (
                                                    <button type="button" className="settings__icon-button" onClick={() => openEditAccount(account)}>
                                                        <img src="/images/edit_icon.svg" alt="" aria-hidden="true" />
                                                    </button>
                                                ) : (
                                                    <button type="button" className="settings__icon-button" onClick={() => deleteAccount(account)} aria-label="Delete account">
                                                        <img src="/images/delete_icon.svg" alt="" aria-hidden="true" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    className="settings__icon-button"
                                                    onClick={() => toggleAccountStatus(account)}
                                                    aria-label={account.is_active ? 'Disable account' : 'Restore account'}
                                                >
                                                    <img
                                                        src={account.is_active ? '/images/disable_icon.svg' : '/images/restore_icon.svg'}
                                                        alt=""
                                                        aria-hidden="true"
                                                    />
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
            }

        case 'templates':
            sectionContent = (
                <>
                    <div className="settings__panel-header settings__panel-header--row">
                        <h2 id="templates-title" className="settings__section-title">Templates</h2>
                        <div className="settings__panel-header-actions">
                            <button
                                type="button"
                                className="settings__archive-btn"
                                onClick={deleteSelectedTemplates}
                                disabled={selectedTemplateFilenames.size < 2}
                            >
                                <img src={`${window.location.origin}/images/delete_icon.svg`} alt="" />
                                Delete
                            </button>
                            <input
                                ref={templateFileInputRef}
                                type="file"
                                accept=".docx"
                                onChange={handleTemplateFileChange}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                className="settings__create-btn"
                                onClick={handleAddTemplateClick}
                                disabled={templateUploading}
                            >
                                <img src={`${window.location.origin}/images/create_icon.svg`} alt="" />
                                {templateUploading ? 'Adding...' : 'Add new template'}
                            </button>
                        </div>
                    </div>
                    <div className="settings__tabs">
                        <button
                            type="button"
                            className={`settings__tab ${templateTab === 'adr' ? 'settings__tab--active' : ''}`}
                            onClick={() => setTemplateTab('adr')}
                        >
                            After Duty Report
                        </button>
                        <button
                            type="button"
                            className={`settings__tab ${templateTab === 'swapping' ? 'settings__tab--active' : ''}`}
                            onClick={() => setTemplateTab('swapping')}
                        >
                            Swapping Form
                        </button>
                    </div>
                    <div className="settings__table">
                        <table className="settings__table--departments">
                            <thead>
                                <tr>
                                    <th className="settings__table-check">
                                        <input
                                            ref={selectAllTemplatesRef}
                                            type="checkbox"
                                            checked={filteredTemplates.length > 0 && selectedTemplateFilenames.size === filteredTemplates.length}
                                            onChange={toggleSelectAllTemplates}
                                        />
                                    </th>
                                    <th className="settings__table-actions">Actions</th>
                                    <th>Template</th>
                                    <th className="settings__table-created">Updated at</th>
                                </tr>
                            </thead>
                            <tbody>
                                {templatesLoading ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                                ) : templatesError ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#c00' }}>{templatesError}</td></tr>
                                ) : filteredTemplates.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No templates yet. Click "Add new template".
                                    </td></tr>
                                ) : (
                                    filteredTemplates.map((tpl) => (
                                        <tr key={tpl.filename}>
                                            <td className="settings__table-check">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTemplateFilenames.has(tpl.filename)}
                                                    onChange={() => toggleTemplateSelection(tpl.filename)}
                                                />
                                            </td>
                                            <td className="settings__table-actions settings__template-actions">
                                                <div className="settings__template-actions-inner">
                                                    {tpl.is_active ? (
                                                        <span className="settings__in-use-text">In use</span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="settings__icon-button settings__icon-button--check"
                                                            onClick={() => setTemplateInUse(tpl)}
                                                        >
                                                            <img src="/images/check_icon.svg" alt="" />
                                                        </button>
                                                    )}
                                                    <button type="button" className="settings__icon-button" onClick={() => deleteTemplate(tpl)}>
                                                        <img src="/images/delete_icon.svg" alt="" />
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
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                                    ) : sectionsError ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#c00' }}>{sectionsError}</td></tr>
                                    ) : sections.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No active sections yet.</td></tr>
                                    ) : (
                                        sections.map((section) => (
                                            <tr key={section.id}>
                                                <td className="settings__table-check">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedActiveIds.includes(section.id)}
                                                        onChange={() => toggleActiveSelection(section.id)}
                                                    />
                                                </td>
                                                <td className="settings__table-actions">
                                                    <button type="button" className="settings__icon-button" onClick={() => openEditSection(section)}>
                                                        <img src="/images/edit_icon.svg" alt="" />
                                                    </button>
                                                    <button type="button" className="settings__icon-button" onClick={() => archiveSection(section)}>
                                                        <img src="/images/delete_icon.svg" alt="" />
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
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                                    ) : archivedSections.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No archived sections.</td></tr>
                                    ) : (
                                        archivedSections.map((section) => (
                                            <tr key={section.id}>
                                                <td className="settings__table-check">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedArchivedIds.includes(section.id)}
                                                        onChange={() => toggleArchivedSelection(section.id)}
                                                    />
                                                </td>
                                                <td className="settings__table-actions">
                                                    <button type="button" className="settings__icon-button" onClick={() => restoreSection(section)}>
                                                        <img src="/images/restore_icon.svg" alt="" />
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
                        <div className="settings__modal-overlay" onClick={closeSectionModal}>
                            <div className="settings__modal" onClick={(e) => e.stopPropagation()}>
                                <h3 className="settings__modal-title">
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
                                    <button
                                        type="button"
                                        className="settings__modal-btn settings__modal-btn--save"
                                        onClick={saveSection}
                                        disabled={sectionSaving || !sectionNameInput.trim()}
                                    >
                                        {sectionSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
            break;

        case 'data-retention':
            sectionContent = (
                <>
                    <div className="settings__panel-header settings__panel-header--row">
                        <h2 id="data-retention-title" className="settings__section-title">Data Retention</h2>
                    </div>

                    <div className="settings__retention-simple">
                        <div className="settings__retention-header">
                            <label className="settings__retention-toggle-label">
                                <span>Auto-Archive</span>
                                <div className="settings__retention-toggle">
                                    <input
                                        type="checkbox"
                                        checked={retentionEnabled}
                                        onChange={(e) => {
                                            handleToggleRetention(e.target.checked);
                                        }}
                                    />
                                    <span className="settings__retention-slider"></span>
                                </div>
                            </label>
                        </div>
                        <div className="settings__retention-period">
                            <label>Retention Period</label>
                            <div className="settings__retention-input-group">
                                <input
                                    type="number"
                                    min="1"
                                    value={retentionValue}
                                    onChange={(e) => {
                                        setRetentionValue(Math.max(1, parseInt(e.target.value) || 1));
                                        setIsRetentionChanged(true);
                                    }}
                                    className="settings__retention-number"
                                    disabled={!retentionEnabled}
                                />
                                <select
                                    value={retentionUnit}
                                    onChange={(e) => {
                                        setRetentionUnit(e.target.value);
                                        setIsRetentionChanged(true);
                                    }}
                                    className="settings__retention-select"
                                    disabled={!retentionEnabled}
                                >
                                    <option value="days">days</option>
                                    <option value="months">months</option>
                                    <option value="years">years</option>
                                </select>
                                <img 
                                    src="/images/edit_icon.svg" 
                                    alt="Edit" 
                                    className="settings__retention-edit-icon"
                                />
                            </div>
                        </div>

                        <div className="settings__retention-dates">
                            <div>
                                <span className="settings__retention-label-small">Current Date:</span>
                                <span className="settings__retention-value">
                                    {new Date().toLocaleString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </span>
                            </div>
                            <div>
                                <span className="settings__retention-label-small">Cutoff Date:</span>
                                <span className="settings__retention-value">
                                    {getCutoffDate().toLocaleString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="settings__retention-preview">
                             {retentionPreview.adr_count + retentionPreview.swap_count > 0 ? (
                                <span className="settings__preview-normal">
                                    {retentionPreview.adr_count} ADR report(s) and {retentionPreview.swap_count} swapping request(s) will be archived.
                                </span>
                            ) : (
                                <span>
                                    <span className={daysUntilArchive.adr_days <= 7 || daysUntilArchive.swap_days <= 7 ? 'warning' : ''}>
                                          {formatTimeLeft()}
                                </span>
                                {' before archiving ADR Reports and Swapping Requests'}
                                </span>
                            )}
                        </div>

                        <div className="settings__retention-actions">
                            <button
                                type="button"
                                className="settings__set-btn"
                                disabled={!isRetentionChanged}
                                onClick={handleSetRetention}
                            >
                                Set
                            </button>
                        </div>

                        <div className="settings__retention-header" style={{ marginTop: '2rem' }}>
                            <label className="settings__retention-toggle-label">
                                <span>Auto-Delete Archived</span>
                                <div className="settings__retention-toggle">
                                    <input
                                        type="checkbox"
                                        checked={purgeEnabled}
                                        onChange={(e) => {
                                            handleTogglePurge(e.target.checked);
                                        }}
                                    />
                                    <span className="settings__retention-slider"></span>
                                </div>
                            </label>
                        </div>
                        <div className="settings__retention-period">
                            <label>Deletion Period</label>
                            <div className="settings__retention-input-group">
                                <input
                                    type="number"
                                    min="1"
                                    value={purgeAfterValue}
                                    onChange={(e) => {
                                        setPurgeAfterValue(Math.max(1, parseInt(e.target.value) || 1));
                                        setIsPurgeChanged(true);
                                    }}
                                    className="settings__retention-number"
                                    disabled={!purgeEnabled}
                                />
                                <select
                                    value={purgeAfterUnit}
                                    onChange={(e) => {
                                        setPurgeAfterUnit(e.target.value);
                                        setIsPurgeChanged(true);
                                    }}
                                    className="settings__retention-select"
                                    disabled={!purgeEnabled}
                                >
                                    <option value="days">days</option>
                                    <option value="months">months</option>
                                    <option value="years">years</option>
                                </select>
                                <img
                                    src="/images/edit_icon.svg"
                                    alt="Edit"
                                    className="settings__retention-edit-icon"
                                />
                            </div>
                        </div>

                        <div className="settings__retention-dates">
                            <div>
                                <span className="settings__retention-label-small">Current Date:</span>
                                <span className="settings__retention-value">
                                    {new Date().toLocaleString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </span>
                            </div>
                            <div>
                                <span className="settings__retention-label-small">Cutoff Date:</span>
                                <span className="settings__retention-value">
                                    {getPurgeCutoffDate().toLocaleString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="settings__retention-preview">
                            <span className={purgeAfterUnit === 'days' && purgeAfterValue <= 7 ? 'warning' : ''}>
                                {purgeAfterValue} {purgeAfterValue === 1 ? purgeAfterUnit.slice(0, -1) : purgeAfterUnit}
                            </span>
                            {' before deleting archived ADR Reports and Swapping Requests.'}
                        </div>

                        <div className="settings__retention-actions">
                            <button
                                type="button"
                                className="settings__set-btn"
                                disabled={!isPurgeChanged}
                                onClick={handleSetPurge}
                            >
                                Set
                            </button>
                        </div>
                    </div>
                </>
            );
            break;

        default:
            sectionContent = (
                <>
                    <div className="settings__panel-header settings__panel-header--row">
                        <h2 id="departments-title" className="settings__section-title">Departments</h2>
                    </div>
                </>
            );
    }

    return (
        <div className="settings">
            <div className="settings__header">
                <h1 className="settings__title">Admin Settings</h1>
            </div>

            <div className="settings__content">
                <section className="settings__panel" aria-label="Admin settings">
                    <aside className="settings__subnav" aria-label="Settings sections">
                        {isSuperAdmin && (
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
                        <button
                            type="button"
                            className={`settings__subnav-item ${activeSection === 'data-retention' ? 'settings__subnav-item--active' : ''}`}
                            onClick={() => setActiveSection('data-retention')}
                        >
                            Data Retention
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
                onConfirm={() => confirmAction && confirmAction()}
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