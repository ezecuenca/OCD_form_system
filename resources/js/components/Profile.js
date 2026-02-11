import React, { useRef, useState, useEffect } from 'react';
import { useFormContext } from '../context/FormContext';

function Profile() {
    const { profileImageUrl, setProfileImageUrl } = useFormContext();
    const fileInputRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const dropdownRef = useRef(null);
    const editRef = useRef(null);

    const profileImgSrc = profileImageUrl || '/images/default_profile.png';
    const [displayName, setDisplayName] = useState(() => localStorage.getItem('adr_profile_name') || 'Your Name');
    const [displaySection, setDisplaySection] = useState(() => localStorage.getItem('adr_profile_section') || '');
    const [address, setAddress] = useState(() => localStorage.getItem('adr_profile_address') || '');
    const [email, setEmail] = useState(() => localStorage.getItem('adr_profile_email') || '');
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editSection, setEditSection] = useState('');

    const departmentOptions = [
        { value: '', label: 'No available departments' },
    ];

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
        setEditSection(displaySection);
        setIsEditing(true);
    };

    const saveEditing = () => {
        setDisplayName(editName.trim() || 'Your Name');
        setDisplaySection(editSection);
        localStorage.setItem('adr_profile_name', editName.trim() || 'Your Name');
        localStorage.setItem('adr_profile_section', editSection);
        setIsEditing(false);
    };

    return (
        <div className="profile">
            <div className="profile__header">
                <h1 className="profile__title">Personal Info</h1>
            </div>
            <div className="profile__content">
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
                                        <input
                                            type="text"
                                            className="profile__name-input"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Your name"
                                            autoFocus
                                        />
                                        <button type="button" className="profile__check-btn" onClick={saveEditing} aria-label="Save">
                                            <img src="/images/check_icon.svg" alt="" className="profile__check-icon" />
                                        </button>
                                    </div>
                                </div>
                                <div className="profile__section-cell">
                                    <select
                                        className="profile__department-select"
                                        value={editSection}
                                        onChange={(e) => setEditSection(e.target.value)}
                                        aria-label="Department"
                                    >
                                        {departmentOptions.map((opt) => (
                                            <option key={opt.value || 'blank'} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="profile__name-row">
                                    <div className="profile__name-cell">
                                        <span className="profile__name">{displayName}</span>
                                    </div>
                                    <button type="button" className="profile__edit-btn" onClick={startEditing} aria-label="Edit profile">
                                        <img src="/images/edit_icon.svg" alt="" className="profile__edit-icon" />
                                    </button>
                                </div>
                                <div className="profile__section-cell">
                                    <p className={`profile__section ${!displaySection ? 'profile__section--empty' : ''}`}>
                                        {displaySection || 'No department'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="profile__fields">
                    <div className="profile__field">
                        <label className="profile__field-label" htmlFor="profile-email">EMAIL</label>
                        <input
                            id="profile-email"
                            type="email"
                            className="profile__field-input"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                localStorage.setItem('adr_profile_email', e.target.value);
                            }}
                            placeholder="Email"
                        />
                    </div>
                    <div className="profile__field">
                        <label className="profile__field-label" htmlFor="profile-address">ADDRESS</label>
                        <input
                            id="profile-address"
                            type="text"
                            className="profile__field-input"
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                                localStorage.setItem('adr_profile_address', e.target.value);
                            }}
                            placeholder="Street address"
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
