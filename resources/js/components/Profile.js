import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useFormContext } from '../context/FormContext';
import SuccessNotification from './SuccessNotification';

function Profile() {
    const { profileImageUrl, setProfileImageUrl, setUserFullName } = useFormContext();
    const fileInputRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const dropdownRef = useRef(null);
    const editRef = useRef(null);

    const profileImgSrc = profileImageUrl || '/images/default_profile.png';
    const [displayName, setDisplayName] = useState('Your Name');
    const [username, setUsername] = useState('');
    const [displaySectionId, setDisplaySectionId] = useState('');
    const [displaySectionName, setDisplaySectionName] = useState('');
    const [position, setPosition] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');

    const [sectionOptions, setSectionOptions] = useState([{ value: '', label: 'No section' }]);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState('');
    const [saveError, setSaveError] = useState('');
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setProfileError('');
        setProfileLoading(true);
        Promise.all([
            axios.get('/api/profile'),
            axios.get('/api/section'),
        ])
            .then(([profileRes, sectionsRes]) => {
                if (!isMounted) return;
                const data = profileRes?.data || {};
                const options = Array.isArray(sectionsRes?.data) ? sectionsRes.data : [];
                setDisplayName(data.full_name?.trim() || 'Your Name');
                setUsername(data.username || '');
                setDisplaySectionId(data.section_id != null ? String(data.section_id) : '');
                setDisplaySectionName(data.section_name || '');
                setPosition(data.position || '');
                setEmail(data.email || '');
                if (setUserFullName) setUserFullName(data.full_name?.trim() || '');
                setSectionOptions([
                    { value: '', label: 'No section' },
                    ...options.map((s) => ({ value: String(s.id), label: s.name })),
                ]);
            })
            .catch((err) => {
                if (!isMounted) return;
                setProfileError(err?.response?.data?.message || 'Failed to load profile.');
            })
            .finally(() => {
                if (isMounted) setProfileLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isEditing) return;
        const handleClickOutsideEdit = (e) => {
            if (editRef.current && !editRef.current.contains(e.target)) {
                setIsEditing(false);
            }
        };
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setIsEditing(false);
        };
        // Delay so the click that opened edit mode doesn't immediately trigger close (button is unmounted after open)
        const t = setTimeout(() => {
            document.addEventListener('click', handleClickOutsideEdit);
            document.addEventListener('keydown', onKeyDown);
        }, 0);
        return () => {
            clearTimeout(t);
            document.removeEventListener('click', handleClickOutsideEdit);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isEditing]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            setProfileImageUrl(reader.result);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
        setDropdownOpen(false);
    };

    const handleChangePhoto = () => {
        fileInputRef.current?.click();
    };

    const handleRemovePhoto = () => {
        setProfileImageUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setDropdownOpen(false);
    };

    const openViewer = (e) => {
        if (e.target.closest('.profile__photo-plus')) return;
        setViewerOpen(true);
    };

    const startEditing = () => {
        setEditName(displayName);
        setSaveError('');
        setShowSuccessNotification(false);
        setIsEditing(true);
    };

    const handleUpdate = async () => {
        setSaveError('');
        setShowSuccessNotification(false);
        setIsSaving(true);
        const fullName = isEditing ? (editName.trim() || 'Your Name') : displayName;
        const newUsername = username;
        const sectionId = displaySectionId || null;
        try {
            const { data } = await axios.put('/api/profile', {
                full_name: fullName,
                username: newUsername,
                section_id: sectionId ? parseInt(sectionId, 10) : null,
                position: position.trim() || null,
            });
            setDisplayName(data.full_name?.trim() || 'Your Name');
            setUsername(data.username || '');
            setDisplaySectionId(data.section_id != null ? String(data.section_id) : '');
            setDisplaySectionName(data.section_name || '');
            setPosition(data.position || '');
            setEmail(data.email || '');
            setIsEditing(false);
            if (setUserFullName) setUserFullName(data.full_name?.trim() || '');
            setSuccessMessage('Profile updated successfully.');
            setShowSuccessNotification(true);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.errors
                ? Object.values(err.response.data.errors || {}).flat()[0]
                : 'Failed to save profile.';
            setSaveError(msg || 'Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="profile">
                <div className="profile__header">
                    <h1 className="profile__title">Personal Info</h1>
                </div>
                <div className="profile__content">
                    <p className="profile__loading">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile">
            <div className="profile__header">
                <h1 className="profile__title">Personal Info</h1>
            </div>
            {(profileError || saveError) && (
                <div className="profile__error" role="alert">
                    {profileError || saveError}
                </div>
            )}
            <SuccessNotification
                message={successMessage}
                isVisible={showSuccessNotification}
                onClose={() => setShowSuccessNotification(false)}
            />
            <div className="profile__content">
                <div className="profile__content-top">
                    {!isEditing ? (
                        <button type="button" className="profile__edit-btn profile__edit-btn--top" onClick={startEditing} aria-label="Edit profile">
                            <img src="/images/edit_icon.svg" alt="" className="profile__edit-icon" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="profile__update-btn profile__update-btn--top"
                            onClick={handleUpdate}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Updating...' : 'Update'}
                        </button>
                    )}
                </div>
                <div className="profile__card">
                    <div className="profile__photo-wrap" ref={dropdownRef}>
                        <div
                            className={`profile__photo-preview ${!profileImageUrl ? 'profile__photo-preview--default' : ''} profile__photo-preview--clickable`}
                            onClick={openViewer}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(e); } }}
                            aria-label="View profile picture"
                        >
                            <img src={profileImgSrc} alt="Profile" className="profile__photo-img" />
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,image/*"
                            onChange={handleFileChange}
                            className="profile__photo-input"
                            id="profile-photo-input"
                        />
                        <button
                            type="button"
                            className="profile__photo-plus"
                            title="Profile options"
                            aria-label="Profile options"
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                            onClick={(e) => { e.stopPropagation(); setDropdownOpen((prev) => !prev); }}
                        >
                            <span className="profile__photo-plus-icon">+</span>
                        </button>
                        {dropdownOpen && (
                            <div className="profile__photo-dropdown">
                                <button type="button" className="profile__photo-dropdown-item" onClick={handleChangePhoto}>
                                    Change profile picture
                                </button>
                                <button type="button" className="profile__photo-dropdown-item" onClick={handleRemovePhoto}>
                                    Remove profile picture
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="profile__info" ref={editRef}>
                        {isEditing ? (
                            <>
                                <div className="profile__name-row">
                                    <div className="profile__name-cell profile__name-cell--field">
                                        <div className="profile__name-edit-wrap">
                                            <input
                                                type="text"
                                                className="profile__name-input"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                placeholder="Your name"
                                                autoFocus
                                            />
                                            {username && <span className="profile__username profile__username--readonly">{username}</span>}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="profile__name-row">
                                    <div className="profile__name-cell">
                                        <span className="profile__name">{displayName}</span>
                                        {username && <span className="profile__username">{username}</span>}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="profile__fields">
                    <div className="profile__field">
                        <label className="profile__field-label" htmlFor="profile-position">POSITION</label>
                        <input
                            id="profile-position"
                            type="text"
                            className="profile__field-input"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            placeholder="Position"
                        />
                    </div>
                    <div className="profile__field">
                        <label className="profile__field-label" htmlFor="profile-section">SECTION</label>
                        <select
                            id="profile-section"
                            className="profile__field-input"
                            value={displaySectionId}
                            onChange={(e) => setDisplaySectionId(e.target.value)}
                            aria-label="Section"
                        >
                            {sectionOptions.map((opt) => (
                                <option key={opt.value || 'blank'} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="profile__field">
                        <label className="profile__field-label" htmlFor="profile-email">EMAIL</label>
                        <input
                            id="profile-email"
                            type="email"
                            className="profile__field-input"
                            value={email}
                            disabled
                            placeholder="Email"
                            readOnly
                            aria-readonly="true"
                        />
                    </div>
                </div>
            </div>

            {viewerOpen && (
                <div className="profile__viewer" onClick={() => setViewerOpen(false)} role="dialog" aria-modal="true" aria-label="Profile picture full size">
                    <button type="button" className="profile__viewer-close" onClick={() => setViewerOpen(false)} aria-label="Close">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <div className="profile__viewer-frame" onClick={(e) => e.stopPropagation()}>
                        <img src={profileImgSrc} alt="Profile full size" className="profile__viewer-img" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
