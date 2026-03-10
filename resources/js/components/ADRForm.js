import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormContext } from '../context/FormContext';
import SuccessNotification from './SuccessNotification';
import axios from 'axios';

const ADR_FORM_DRAFT_KEY = 'adr-form-draft';

const DEFAULT_COMMUNICATION_ROWS = [
    {
        id: 1,
        particulars: 'Hytera Digital Radio with charger',
        noOfItems: 2,
        contact: 'LCL-Caraga / INRG-Caraga',
        status: 'Operational'
    },
    {
        id: 2,
        particulars: 'Samsung mobile phone',
        noOfItems: 1,
        contact: 'SMART',
        status: 'Prepaid / No call-text promo'  
    },
    {
        id: 3,
        particulars: 'RedMi mobile phone',
        noOfItems: 1,
        contact: 'GLOBE',
        status: 'Prepaid / No call-text promo'
    },
    {
        id: 4,
        particulars: 'TPlink Wifi (Temporary)',
        noOfItems: 1,
        contact: '-',
        status: 'Stable connection'
    },
    {
        id: 5,
        particulars: 'VoIP Line for Intercom',
        noOfItems: 2,
        contact: '1215, 1216',
        status: 'Stable connection'
    },
    {
        id: 6,
        particulars: 'VoIP Line Inter Region and Central Office Connectivity',
        noOfItems: 2,
        contact: '926, 927',
        status: 'Stable connection'
    }
];

// Default rows for 4.B Status of Other Items
const DEFAULT_OTHER_ITEMS_ROWS = [
    {
        id: 1,
        particulars: '55-inch TV monitors (Sony)',
        noOfItems: 3,
        status: 'Wall-mounted inside OMCR; 1 at VIP Conference Room'
    },
    {
        id: 2,
        particulars: '65-inch TV monitor (TCL)',
        noOfItems: 1,
        status: 'Wall-mounted inside OMCR'
    },
    {
        id: 3,
        particulars: '40-inch TV monitors',
        noOfItems: 2,
        status: '1 unit wall-mounted outside OMCR; 1 unit wall-mounted at the lobby'
    },
    {
        id: 4,
        particulars: 'Desktop computers',
        noOfItems: 5,
        status: 'Workstations'
    },
    {
        id: 5,
        particulars: 'Portable Water Filtration Set',
        noOfItems: 2,
        status: 'Functional; at storage room near OS'
    },
    {
        id: 6,
        particulars: 'Solar Panel Power Source for Water Filter',
        noOfItems: 2,
        status: 'Functional; at storage room near OS'
    },
    {
        id: 7,
        particulars: 'Nissan Calibre',
        noOfItems: 1,
        status: 'Parked safely at GCCC'
    },
    {
        id: 8,
        particulars: 'Mitsubishi Pick-up',
        noOfItems: 1,
        status: 'At the car repair shop'
    },
    {
        id: 9,
        particulars: 'Toyota Commuter Van',
        noOfItems: 1,
        status: 'Under custody of security guard'
    },
    {
        id: 10,
        particulars: 'Key - Nissan Calibre',
        noOfItems: 1,
        status: 'Under custody of security guard'
    },
    {
        id: 11,
        particulars: 'Key - Mitsubishi Pick-up',
        noOfItems: 1,
        status: 'Under custody of security guard'
    },
    {
        id: 12,
        particulars: 'Key - Toyota Commuter Van',
        noOfItems: 1,
        status: 'Under custody of security guard'
    }
];

// Default for 2. Attendance (Task column)
const DEFAULT_ATTENDANCE_TASK = `Checked incoming communications and weather advisories thru email, Viber and SMS;
Monitored weather condition via PAGASA;
Monitored weather condition via PHIVOLCS; and
Disseminated weather advisories to C/PDRRMOs and RDRRMC Caraga
Acknowledged answered and routed calls, emails, radio checks and other communications; and
Checked incoming communications and weather advisories thru email, Viber, and SMS;
Prepared Daily Regional Situational Summary Report (DRSSR); and
Prepared RDRRMC After Duty Report`;

const DEFAULT_ATTENDANCE_ITEMS = [
    { id: 1, name: '', task: DEFAULT_ATTENDANCE_TASK }
];

// Default for 3. Reports and Advisories (Remarks column)
const DEFAULT_REPORTS_REMARKS = 'Dissiminated to C/PDRMMOs and RDRRMC Caraga member agencies via Viber';
const DEFAULT_REPORTS_ITEMS = [
    { id: 1, report: '', remarks: DEFAULT_REPORTS_REMARKS }
];
const createDefaultReportsItems = () => DEFAULT_REPORTS_ITEMS.map(i => ({ ...i }));

// Default lines for 4.C Other Administrative Matters
const DEFAULT_ADMIN_MATTERS = [
    { id: 1, concern: 'No untoward incident monitored' }
];

// Default lines for endorsed items under 4.C
const DEFAULT_ENDORSED_ITEMS = [
    { id: 1, endorsed: '2 units of mobile phones with charger' }
];

function ADRForm() {
    const [notification, setNotification] = useState(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [showErrorNotification, setShowErrorNotification] = useState(false);
    const [templateId, setTemplateId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { addReport, updateReport, fetchReport } = useFormContext();
    
    // Check if we're in edit mode (coming from existing report)
    const editingReport = location.state?.report;
    const isEditing = !!editingReport;

    // Clear draft for new forms (not editing)
    if (!isEditing) {
        try {
            localStorage.removeItem(ADR_FORM_DRAFT_KEY);
        } catch (_) {}
    }

    // Fetch available template on component mount
    useEffect(() => {
        const fetchAvailableTemplate = async () => {
            try {
                const response = await axios.get('/api/adr/available-template');
                if (response.data.template_id) {
                    setTemplateId(response.data.template_id);
                }
            } catch (error) {
                console.error('Failed to fetch available template:', error);
            }
        };
        fetchAvailableTemplate();
    }, []);

    // Pre-fill: restore draft if present, otherwise load latest saved form data (new form only)
    useEffect(() => {
        if (isEditing) return;
        try {
            const raw = localStorage.getItem(ADR_FORM_DRAFT_KEY);
            const draft = raw ? JSON.parse(raw) : null;
            if (draft && typeof draft === 'object') {
                setDocumentName(draft.documentName ?? '');
                setForName(draft.forName ?? '');
                setForPosition(draft.forPosition ?? '');
                setThruName(draft.thruName ?? '');
                setThruPosition(draft.thruPosition ?? '');
                setFromName(draft.fromName ?? '');
                setFromPosition(draft.fromPosition ?? '');
                setSubject(draft.subject ?? '');
                setDateTime(draft.dateTime ?? '');
                setStatus(draft.status ?? 'WHITE ALERT');
                setPreparedBy(draft.preparedBy ?? '');
                setPreparedPosition(draft.preparedPosition ?? '');
                setReceivedBy(draft.receivedBy ?? '');
                setReceivedPosition(draft.receivedPosition ?? '');
                setNotedBy(draft.notedBy ?? '');
                setNotedPosition(draft.notedPosition ?? '');
                setApprovedBy(draft.approvedBy ?? '');
                setApprovedPosition(draft.approvedPosition ?? '');
                if (Array.isArray(draft.attendanceItems) && draft.attendanceItems.length > 0) {
                    const mapped = draft.attendanceItems.map((item, i) => ({
                        id: item.id ?? i + 1,
                        name: item.name ?? '',
                        task: item.task ?? ''
                    }));
                    const hasContent = mapped.some(m => (m.task || '').trim() !== '');
                    if (hasContent) {
                        setAttendanceItems(mapped);
                    }
                }
                if (Array.isArray(draft.reportsItems) && draft.reportsItems.length > 0) {
                    const mapped = draft.reportsItems.map((item, i) => ({
                        id: item.id ?? i + 1,
                        report: item.report ?? '',
                        remarks: item.remarks ?? ''
                    }));
                    const hasContent = mapped.some(m => (m.report || '').trim() !== '' || (m.remarks || '').trim() !== '');
                    if (hasContent) {
                        setReportsItems(mapped);
                    } else {
                        setReportsItems(createDefaultReportsItems());
                    }
                }
                if (Array.isArray(draft.communicationRows) && draft.communicationRows.length > 0) {
                    setCommunicationRows(draft.communicationRows.map((r, i) => ({
                        ...r,
                        id: r.id ?? i + 1,
                        particulars: r.particulars ?? '',
                        noOfItems: r.noOfItems ?? r.number ?? 0,
                        contact: r.contact ?? '',
                        status: r.status ?? r.remarks ?? ''
                    })));
                }
                if (Array.isArray(draft.otherItemsRows) && draft.otherItemsRows.length > 0) {
                    setOtherItemsRows(draft.otherItemsRows.map((r, i) => ({
                        ...r,
                        id: r.id ?? i + 1,
                        particulars: r.particulars ?? '',
                        noOfItems: r.noOfItems ?? r.number ?? 0,
                        status: r.status ?? r.remarks ?? ''
                    })));
                }
                if (Array.isArray(draft.adminMatters) && draft.adminMatters.length > 0) {
                    const mapped = draft.adminMatters.map((m, i) => ({
                        id: m.id ?? i + 1,
                        concern: m.concern ?? ''
                    }));
                    const hasContent = mapped.some(m => (m.concern || '').trim() !== '');
                    if (hasContent) {
                        setAdminMatters(mapped);
                    }
                }
                if (Array.isArray(draft.endorsedItems) && draft.endorsedItems.length > 0) {
                    const mapped = draft.endorsedItems.map((e, i) => ({
                        id: e.id ?? i + 1,
                        endorsed: e.endorsed ?? ''
                    }));
                    const hasContent = mapped.some(e => (e.endorsed || '').trim() !== '');
                    if (hasContent) {
                        setEndorsedItems(mapped);
                    }
                }
                return;
            }
        } catch (_) {
            // Invalid draft – fall through to fetch latest
        }
        const fetchLatestAdminMatters = async () => {
            try {
                const response = await axios.get('/api/adr/latest-admin-matters');
                const data = response.data;
                if (!data) return;

                if (data.communicationRows?.length) {
                    setCommunicationRows(data.communicationRows.map((r, i) => ({ ...r, id: i + 1 })));
                }
                if (data.otherItemsRows?.length) {
                    setOtherItemsRows(data.otherItemsRows.map((r, i) => ({ ...r, id: i + 1 })));
                }
                if (data.concerns?.length) {
                    setAdminMatters(data.concerns.map((r, i) => ({ id: i + 1, concern: r.concern || '' })));
                }
                if (data.endorsed?.length) {
                    setEndorsedItems(data.endorsed.map((r, i) => ({ id: i + 1, endorsed: r.endorsed || '' })));
                }
                if (data.attendanceItems?.length) {
                    const mapped = data.attendanceItems.map((item, i) => ({
                        id: i + 1,
                        name: item.name ?? '',
                        task: item.task ?? ''
                    }));
                    const hasContent = mapped.some(m => (m.task || '').trim() !== '');
                    if (hasContent) {
                        setAttendanceItems(mapped);
                    }
                }
                if (data.reportsItems?.length) {
                    const mapped = data.reportsItems.map((item, i) => ({
                        id: i + 1,
                        report: item.report ?? '',
                        remarks: item.remarks ?? ''
                    }));
                    const hasContent = mapped.some(m => (m.report || '').trim() !== '' || (m.remarks || '').trim() !== '');
                    if (hasContent) {
                        setReportsItems(mapped);
                    } else {
                        setReportsItems(createDefaultReportsItems());
                    }
                }
            } catch (error) {
                // No previous form or network error – start with empty defaults
            }
        };
        fetchLatestAdminMatters();
    }, [isEditing]);

    // Load report data when editing (fetch full report if we only have summary from list)
    useEffect(() => {
        if (!editingReport) return;

        const applyReportToForm = (report) => {
            setDocumentName(report.documentName || '');
            setSubject(report.subject || '');
            setForName(report.forName || '');
            setForPosition(report.forPosition || '');
            setThruName(report.thruName || '');
            setThruPosition(report.thruPosition || '');
            setFromName(report.fromName || '');
            setFromPosition(report.fromPosition || '');
            setDateTime(report.dateTime || '');
            setStatus(report.alertStatus || report.status || 'WHITE ALERT');
            setAttendanceItems(report.attendanceItems || [{ id: 1, name: '', task: '' }]);
            setReportsItems((report.reportsItems || [{ id: 1, report: '', remarks: '' }]).map(i => ({
                id: i.id,
                report: i.report ?? '',
                remarks: i.remarks ?? ''
            })));
            setCommunicationRows(report.communicationRows || [{ id: 1, particulars: '', noOfItems: 0, contact: '', status: '' }]);
            setOtherItemsRows(report.otherItemsRows || [{ id: 1, particulars: '', noOfItems: 0, status: '' }]);
            if (report.concerns?.length) setAdminMatters(report.concerns);
            if (report.endorsed?.length) setEndorsedItems(report.endorsed);
            setPreparedBy(report.preparedBy || '');
            setPreparedPosition(report.preparedPosition || '');
            setReceivedBy(report.receivedBy || '');
            setReceivedPosition(report.receivedPosition || '');
            setNotedBy(report.notedBy || '');
            setNotedPosition(report.notedPosition || '');
            setApprovedBy(report.approvedBy || '');
            setApprovedPosition(report.approvedPosition || '');
        };

        const hasFullData = editingReport.attendanceItems != null;
        if (hasFullData) {
            applyReportToForm(editingReport);
        } else if (editingReport.id != null) {
            fetchReport(editingReport.id).then(applyReportToForm).catch(() => applyReportToForm(editingReport));
        } else {
            applyReportToForm(editingReport);
        }
    }, [editingReport, fetchReport]);
    

    const [documentName, setDocumentName] = useState('');
    
    const [forName, setForName] = useState('');
    const [forPosition, setForPosition] = useState('');
    const [thruName, setThruName] = useState('');
    const [thruPosition, setThruPosition] = useState('');
    const [fromName, setFromName] = useState('');
    const [fromPosition, setFromPosition] = useState('');
    const [subject, setSubject] = useState('');
    const [dateTime, setDateTime] = useState('');
    
    const [status, setStatus] = useState('WHITE ALERT');
    

    const [attendanceItems, setAttendanceItems] = useState(DEFAULT_ATTENDANCE_ITEMS);
    const [reportsItems, setReportsItems] = useState(createDefaultReportsItems);
    const [tempReportsItems, setTempReportsItems] = useState([]);
    const [tempAttendanceItems, setTempAttendanceItems] = useState([]);
    const [tempCommunicationRows, setTempCommunicationRows] = useState([]);
    const [tempOtherItemsRows, setTempOtherItemsRows] = useState([]);

    const [showCommunicationModal, setShowCommunicationModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [showOtherItemsModal, setShowOtherItemsModal] = useState(false);
    const [showAdminMattersModal, setShowAdminMattersModal] = useState(false);
    const [focusedCounterKey, setFocusedCounterKey] = useState(null);

    // C. Other Administrative Matters
    const [adminMatters, setAdminMatters] = useState(DEFAULT_ADMIN_MATTERS);
    const [endorsedItems, setEndorsedItems] = useState(DEFAULT_ENDORSED_ITEMS);
    
    // Communication and Other Items
    const [communicationRows, setCommunicationRows] = useState(DEFAULT_COMMUNICATION_ROWS);
    const [otherItemsRows, setOtherItemsRows] = useState(DEFAULT_OTHER_ITEMS_ROWS);
    
    // Signatures
    const [preparedBy, setPreparedBy] = useState('');
    const [preparedPosition, setPreparedPosition] = useState('');
    const [receivedBy, setReceivedBy] = useState('');
    const [receivedPosition, setReceivedPosition] = useState('');
    const [notedBy, setNotedBy] = useState('');
    const [notedPosition, setNotedPosition] = useState('');
    const [approvedBy, setApprovedBy] = useState('');
    const [approvedPosition, setApprovedPosition] = useState('');

    const draftSaveTimeoutRef = useRef(null);

    // Persist form to localStorage (create mode only) so refresh/hot-reload does not lose data
    useEffect(() => {
        if (isEditing) return;
        if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current);
        draftSaveTimeoutRef.current = setTimeout(() => {
            try {
                const draft = {
                    documentName,
                    forName,
                    forPosition,
                    thruName,
                    thruPosition,
                    fromName,
                    fromPosition,
                    subject,
                    dateTime,
                    status,
                    attendanceItems,
                    reportsItems,
                    communicationRows,
                    otherItemsRows,
                    adminMatters,
                    endorsedItems,
                    preparedBy,
                    preparedPosition,
                    receivedBy,
                    receivedPosition,
                    notedBy,
                    notedPosition,
                    approvedBy,
                    approvedPosition
                };
                localStorage.setItem(ADR_FORM_DRAFT_KEY, JSON.stringify(draft));
            } catch (_) {}
            draftSaveTimeoutRef.current = null;
        }, 500);
        return () => {
            if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current);
        };
    }, [
        isEditing,
        documentName,
        forName,
        forPosition,
        thruName,
        thruPosition,
        fromName,
        fromPosition,
        subject,
        dateTime,
        status,
        attendanceItems,
        reportsItems,
        communicationRows,
        otherItemsRows,
        adminMatters,
        endorsedItems,
        preparedBy,
        preparedPosition,
        receivedBy,
        receivedPosition,
        notedBy,
        notedPosition,
        approvedBy,
        approvedPosition
    ]);

    const handleReturn = () => {
        navigate('/adr-reports');
    };

    const handleNameFieldKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const group = e.target.closest('.adr-form__field-group, .adr-form__signature-item');
            if (group) {
                const positionInput = group.querySelector('textarea.adr-form__position-line');
                if (positionInput) positionInput.focus();
            }
        }
    };

    const showNotification = (message, type = 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };
    
    const handleConfirm = async () => {
        // Get the final values - use temp values if available, otherwise use main state
        const finalAttendanceItems = tempAttendanceItems.length > 0 ? tempAttendanceItems : attendanceItems;
        const finalReportsItems = tempReportsItems.length > 0 ? tempReportsItems : reportsItems;
        const finalCommunicationRows = tempCommunicationRows.length > 0 ? tempCommunicationRows : communicationRows;
        const finalOtherItemsRows = tempOtherItemsRows.length > 0 ? tempOtherItemsRows : otherItemsRows;

        if (!documentName.trim()) {
            setShowErrorNotification(true);
            return;
        }

        const payload = {
            report: {
                documentName,
                subject,
                alertStatus: status,
                templates_id: templateId, 

                forName,
                forPosition,
                thruName,
                thruPosition,
                fromName,
                fromPosition,
                dateTime,
                status,
                attendanceItems: finalAttendanceItems,
                reportsItems: finalReportsItems,
                communicationRows: finalCommunicationRows,
                otherItemsRows: finalOtherItemsRows,
                concerns: adminMatters,
                endorsed: endorsedItems,
                preparedBy,
                preparedPosition,
                receivedBy,
                receivedPosition,
                notedBy,
                notedPosition,
                approvedBy,
                approvedPosition
            }
        };

        // Clear temp states after getting values
        setTempReportsItems([]);
        setTempAttendanceItems([]);
        setTempCommunicationRows([]);
        setTempOtherItemsRows([]);

        try {
            if (isEditing && editingReport.id) {
                // Update existing report
                await updateReport(editingReport.id, payload.report);
            } else {
                // Create new report
                await addReport(payload.report);
            }

            if (!isEditing) {
                try {
                    localStorage.removeItem(ADR_FORM_DRAFT_KEY);
                } catch (_) {}
            }
            setShowSuccessNotification(true);
            setTimeout(() => {
                navigate('/adr-reports');
            }, 1500);
        } catch (error) {
            console.error("Failed to save ADR form:", error);
            showNotification(
                error.response?.data?.message || 'Failed to save report. Please try again.',
                'error'
            );
        }
    };

    
    
    // const handleViewDocument = () => {
    //     // Functionality disabled for now
    // };

    

    const addAttendanceItem = () => {
        const newId = Math.max(...attendanceItems.map(item => item.id), 0) + 1;
        setAttendanceItems([...attendanceItems, { id: newId, name: '', task: '' }]);
    };

    const removeAttendanceItem = (id) => {
        if (attendanceItems.length > 1) {
            setAttendanceItems(attendanceItems.filter(item => item.id !== id));
        }
    };

    const addReportsItem = () => {
        const newId = Math.max(...tempReportsItems.map(item => item.id), 0) + 1;
        setTempReportsItems([...tempReportsItems, { id: newId, report: '', remarks: DEFAULT_REPORTS_REMARKS }]);
    };

    const removeReportsItem = (id) => {
        if (tempReportsItems.length > 1) {
            setTempReportsItems(tempReportsItems.filter(item => item.id !== id));
        }
    };

    const addCommunicationRow = () => {
        const newId = Math.max(...communicationRows.map(row => row.id), 0) + 1;
        setCommunicationRows([...communicationRows, { id: newId, particulars: '', noOfItems: 0, contact: '', status: '' }]);
    };

    const removeCommunicationRow = (id) => {
        setCommunicationRows(communicationRows.filter(row => row.id !== id));
    };

    const updateCommunicationRow = (id, field, value) => {
        setCommunicationRows(communicationRows.map(row => 
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const incrementCounter = (id) => {
        setCommunicationRows(communicationRows.map(row => 
            row.id === id ? { ...row, noOfItems: row.noOfItems + 1 } : row
        ));
    };

    const decrementCounter = (id) => {
        setCommunicationRows(communicationRows.map(row => 
            row.id === id && row.noOfItems > 0 ? { ...row, noOfItems: row.noOfItems - 1 } : row
        ));
    };

    const addOtherItemsRow = () => {
        const newId = Math.max(...otherItemsRows.map(row => row.id), 0) + 1;
        setOtherItemsRows([...otherItemsRows, { id: newId, particulars: '', noOfItems: 0, status: '' }]);
    };

    const removeOtherItemsRow = (id) => {
        setOtherItemsRows(otherItemsRows.filter(row => row.id !== id));
    };

    const updateOtherItemsRow = (id, field, value) => {
        setOtherItemsRows(otherItemsRows.map(row => 
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const incrementOtherItemsCounter = (id) => {
        setOtherItemsRows(otherItemsRows.map(row => 
            row.id === id ? { ...row, noOfItems: row.noOfItems + 1 } : row
        ));
    };

    const decrementOtherItemsCounter = (id) => {
        setOtherItemsRows(otherItemsRows.map(row => 
            row.id === id && row.noOfItems > 0 ? { ...row, noOfItems: row.noOfItems - 1 } : row
        ));
    };

    return (
        <div className="adr-form">
            {notification && (
                <div className={`adr-form__notification adr-form__notification--${notification.type}`}>
                    <div className="adr-form__notification-content">
                        {notification.message}
                    </div>
                    <button 
                        className="adr-form__notification-close" 
                        onClick={() => setNotification(null)}
                        type="button"
                    >
                        &times;
                    </button>
                </div>
            )}
            <SuccessNotification 
                message="Report submitted successfully!" 
                isVisible={showSuccessNotification} 
                onClose={() => setShowSuccessNotification(false)} 
            />
            <SuccessNotification 
                message="Please enter a document name." 
                isVisible={showErrorNotification} 
                onClose={() => setShowErrorNotification(false)}
                type="error"
            />
            <div className="adr-form__top">
                <div className="adr-form__top-left">
                    <h1 className="adr-form__title">RDRRMOC DUTY REPORT</h1>
                    <input 
                        type="text" 
                        className="adr-form__document-name" 
                        placeholder="Enter document name..." 
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                    />
                </div>
                <div className="adr-form__top-right">
                    <button className="adr-form__return-btn" onClick={handleReturn}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Return
                    </button>
                    <div className="adr-form__actions">
                        <button className="adr-form__action-btn adr-form__action-btn--confirm" onClick={handleConfirm}>
                            <img src={`${window.location.origin}/images/confirm_icon.svg`} alt="Confirm" />
                            Confirm
                        </button>
                    </div>
                </div>
            </div>

            <div className="adr-form__content">
                <div className="adr-form__top-fields">
                    <div className="adr-form__field-group">
                        <div className="adr-form__field">
                            <label>For:</label>
                            <input type="text" value={forName} onChange={(e) => setForName(e.target.value.toUpperCase())} onKeyDown={handleNameFieldKeyDown} placeholder="Enter full name" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={forPosition} onChange={(e) => setForPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__field-group">
                        <div className="adr-form__field">
                            <label>Thru:</label>
                            <input type="text" value={thruName} onChange={(e) => setThruName(e.target.value.toUpperCase())} onKeyDown={handleNameFieldKeyDown} placeholder="Enter full name" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={thruPosition} onChange={(e) => setThruPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__field-group">
                        <div className="adr-form__field">
                            <label>From:</label>
                            <input type="text" value={fromName} onChange={(e) => setFromName(e.target.value.toUpperCase())} onKeyDown={handleNameFieldKeyDown} placeholder="Enter full name" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={fromPosition} onChange={(e) => setFromPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__field-group adr-form__field-group--subject">
                        <div className="adr-form__subject-header">
                            <label>Subject:</label>
                            <span className="adr-form__subject-text">After Duty Report for the Period Covered</span>
                            <input type="text" className="adr-form__subject-input" value={dateTime} onChange={(e) => setDateTime(e.target.value)} placeholder="e.g. Jan 01 to Jan 02, 2025 (0800H to 0800H)" />
                        </div>
                    </div>
                </div>

                <div className="adr-form__section">
                    <label className="adr-form__section-label">1. Status</label>
                    <select className="adr-form__select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option>WHITE ALERT</option>
                        <option>BLUE ALERT</option>
                        <option>RED ALERT</option>
                    </select>
                </div>

                <div className="adr-form__section">
                    <label className="adr-form__section-label">3. Reports and Advisories:</label>
                    <div className="adr-form__customize-group">
                        <label>Reports and Advisories List</label>
                        <button className="adr-form__customize-btn" type="button" onClick={() => { if (tempReportsItems.length === 0) { setTempReportsItems([...reportsItems]); } setShowReportsModal(true); }}>
                            CUSTOMIZE
                        </button>
                    </div>
                </div>

                <div className="adr-form__section">
                    <label className="adr-form__section-label">2. Attendance:</label>
                    <div className="adr-form__customize-group">
                        <label>Attendance List</label>
                        <button className="adr-form__customize-btn" type="button" onClick={() => { if (tempAttendanceItems.length === 0) { setTempAttendanceItems([...attendanceItems]); } setShowAttendanceModal(true); }}>
                            CUSTOMIZE
                        </button>
                    </div>
                </div>

                <div className="adr-form__section">
                    <label className="adr-form__section-label">4. Administrative Matters:</label>
                    <div className="adr-form__customize-group">
                        <label>A. Status of Communication Lines</label>
                        <button className="adr-form__customize-btn" type="button" onClick={() => { if (tempCommunicationRows.length === 0) { setTempCommunicationRows([...communicationRows]); } setShowCommunicationModal(true); }}>
                            CUSTOMIZE
                        </button>
                    </div>
                    <div className="adr-form__customize-group">
                        <label>B. Status of Other Items</label>
                        <button className="adr-form__customize-btn" type="button" onClick={() => { if (tempOtherItemsRows.length === 0) { setTempOtherItemsRows([...otherItemsRows]); } setShowOtherItemsModal(true); }}>
                            CUSTOMIZE
                        </button>
                    </div>
                    <div className="adr-form__customize-group">
                        <label>C. Other Administrative Matters</label>
                        <button className="adr-form__customize-btn" type="button" onClick={() => setShowAdminMattersModal(true)}>
                            CUSTOMIZE
                        </button>
                    </div>
                </div>

                <div className="adr-form__signature-fields">
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Prepared By:</label>
                            <input type="text" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value.toUpperCase())} onKeyDown={handleNameFieldKeyDown} placeholder="Enter full name" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={preparedPosition} onChange={(e) => setPreparedPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Received By:</label>
                            <input type="text" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value.toUpperCase())} onKeyDown={handleNameFieldKeyDown} placeholder="Enter full name" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={receivedPosition} onChange={(e) => setReceivedPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Noted By:</label>
                            <input type="text" value={notedBy} onChange={(e) => setNotedBy(e.target.value.toUpperCase())} onKeyDown={handleNameFieldKeyDown} placeholder="Enter full name" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={notedPosition} onChange={(e) => setNotedPosition(e.target.value)}></textarea>
                    </div>
                    <div className="adr-form__signature-item">
                        <div className="adr-form__field">
                            <label>Approved:</label>
                            <input type="text" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value.toUpperCase())} onKeyDown={handleNameFieldKeyDown} placeholder="Enter full name" />
                        </div>
                        <textarea className="adr-form__position-line" placeholder="(Position)" rows="2" value={approvedPosition} onChange={(e) => setApprovedPosition(e.target.value)}></textarea>
                    </div>
                </div>
            </div>

            {showCommunicationModal && (
                <div className="adr-form__modal adr-form__modal--active" onClick={() => setShowCommunicationModal(false)}>
                    <div className="adr-form__modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="adr-form__modal-header">
                            <h2>Status of Communication Lines</h2>
                            <button className="adr-form__modal-close" type="button" onClick={() => setShowCommunicationModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="adr-form__modal-body">
                            <table className="adr-form__modal-table">
                                <thead>
                                    <tr>
                                        <th className="adr-form__modal-table-comm-particulars-col">Particulars</th>
                                        <th className="adr-form__modal-table-comm-no-col">No. of Items</th>
                                        <th className="adr-form__modal-table-comm-contact-col">Contact No. / Freq / Channel</th>
                                        <th className="adr-form__modal-table-comm-status-col">Status / Remarks</th>
                                        <th className="adr-form__modal-table-actions-col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="adr-form__modal-table-body">
                                    {tempCommunicationRows.map((row) => (
                                        <tr className="adr-form__modal-table-row" key={row.id}>
                                            <td className="adr-form__modal-table-comm-particulars-col">
                                                <input 
                                                    type="text" 
                                                    className="adr-form__modal-input" 
                                                    placeholder="Enter particulars"
                                                    value={row.particulars ?? ''}
                                                    onChange={(e) => setTempCommunicationRows(tempCommunicationRows.map(r => r.id === row.id ? { ...r, particulars: e.target.value } : r))}
                                                />
                                            </td>
                                            <td className="adr-form__modal-table-comm-no-col">
                                                <div className="adr-form__counter">
                                                    <button 
                                                        className="adr-form__counter-btn" 
                                                        type="button"
                                                        onClick={() => setTempCommunicationRows(tempCommunicationRows.map(r => r.id === row.id ? { ...r, noOfItems: Math.max(0, r.noOfItems - 1) } : r))}
                                                    >
                                                        −
                                                    </button>
                                                    <input 
                                                        type="number" 
                                                        className="adr-form__counter-input" 
                                                        value={row.noOfItems} 
                                                        min="0"
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            if (v === '') {
                                                                setTempCommunicationRows(tempCommunicationRows.map(r => r.id === row.id ? { ...r, noOfItems: 0 } : r));
                                                                return;
                                                            }
                                                            const n = parseInt(v, 10);
                                                            if (!isNaN(n) && n >= 0) setTempCommunicationRows(tempCommunicationRows.map(r => r.id === row.id ? { ...r, noOfItems: n } : r));
                                                        }}
                                                    />
                                                    <button 
                                                        className="adr-form__counter-btn" 
                                                        type="button"
                                                        onClick={() => setTempCommunicationRows(tempCommunicationRows.map(r => r.id === row.id ? { ...r, noOfItems: r.noOfItems + 1 } : r))}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="adr-form__modal-table-comm-contact-col">
                                                <textarea 
                                                    className="adr-form__modal-input adr-form__modal-textarea adr-form__modal-textarea--md" 
                                                    placeholder="Enter contact/freq/channel (multiple lines allowed)"
                                                    rows="2"
                                                    value={row.contact ?? ''}
                                                    onChange={(e) => setTempCommunicationRows(tempCommunicationRows.map(r => r.id === row.id ? { ...r, contact: e.target.value } : r))}
                                                />
                                            </td>
                                            <td className="adr-form__modal-table-comm-status-col">
                                                <textarea 
                                                    className="adr-form__modal-input adr-form__modal-textarea adr-form__modal-textarea--md" 
                                                    placeholder="Enter status/remarks (multiple lines allowed)"
                                                    rows="2"
                                                    value={row.status ?? ''}
                                                    onChange={(e) => setTempCommunicationRows(tempCommunicationRows.map(r => r.id === row.id ? { ...r, status: e.target.value } : r))}
                                                />
                                            </td>
                                            <td className="adr-form__modal-table-actions-col">
                                                <button 
                                                    className="adr-form__modal-action-btn" 
                                                    type="button"
                                                    onClick={() => setTempCommunicationRows(tempCommunicationRows.filter(r => r.id !== row.id))}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="adr-form__modal-add-row" type="button" onClick={() => { const newId = Math.max(...tempCommunicationRows.map(row => row.id), 0) + 1; setTempCommunicationRows([...tempCommunicationRows, { id: newId, particulars: '', noOfItems: 0, contact: '', status: '' }]); }}>
                                +
                            </button>
                        </div>
                        <div className="adr-form__modal-footer">
                            <button className="adr-form__modal-confirm" type="button" onClick={() => setShowCommunicationModal(false)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAttendanceModal && (
                <div className="adr-form__modal adr-form__modal--active" onClick={() => setShowAttendanceModal(false)}>
                    <div className="adr-form__modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="adr-form__modal-header">
                            <h2>Attendance List</h2>
                            <button className="adr-form__modal-close" type="button" onClick={() => setShowAttendanceModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="adr-form__modal-body">
                            <table className="adr-form__modal-table">
                                <thead>
                                    <tr>
                                        <th className="adr-form__modal-table-number">#</th>
                                        <th className="adr-form__modal-table-name-col">Name</th>
                                        <th className="adr-form__modal-table-task-col">Task</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="adr-form__modal-table-body">
                                    {tempAttendanceItems.map((item, index) => (
                                        <tr className="adr-form__modal-table-row" key={item.id}>
                                            <td className="adr-form__modal-table-number">{index + 1}</td>
                                            <td className="adr-form__modal-table-name-col">
                                                <textarea 
                                                    className="adr-form__modal-input adr-form__modal-textarea" 
                                                    placeholder="Enter name (multiple names: one per line)"
                                                    rows="2"
                                                    value={item.name ?? ''}
                                                    onChange={(e) => {
                                                        setTempAttendanceItems(tempAttendanceItems.map(i => 
                                                            i.id === item.id ? { ...i, name: e.target.value } : i
                                                        ));
                                                    }}
                                                />
                                            </td>
                                            <td className="adr-form__modal-table-task-col">
                                                <textarea 
                                                    className="adr-form__modal-input adr-form__modal-textarea adr-form__modal-textarea--task" 
                                                    placeholder="Enter task (press Enter for new line or bullet points)"
                                                    rows="5"
                                                    value={item.task ?? ''}
                                                    onChange={(e) => {
                                                        setTempAttendanceItems(tempAttendanceItems.map(i => 
                                                            i.id === item.id ? { ...i, task: e.target.value } : i
                                                        ));
                                                    }}
                                                ></textarea>
                                            </td>
                                            <td>
                                                <button 
                                                    className="adr-form__modal-action-btn" 
                                                    type="button"
                                                    onClick={() => {
                                                        if (tempAttendanceItems.length > 1) {
                                                            setTempAttendanceItems(tempAttendanceItems.filter(i => i.id !== item.id));
                                                        }
                                                    }}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="adr-form__modal-add-row" type="button" onClick={() => { const newId = Math.max(...tempAttendanceItems.map(item => item.id), 0) + 1; setTempAttendanceItems([...tempAttendanceItems, { id: newId, name: '', task: '' }]); }}>
                                +
                            </button>
                        </div>
                        <div className="adr-form__modal-footer">
                            <button className="adr-form__modal-confirm" type="button" onClick={() => setShowAttendanceModal(false)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReportsModal && (
                <div className="adr-form__modal adr-form__modal--active" onClick={() => setShowReportsModal(false)}>
                    <div className="adr-form__modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="adr-form__modal-header">
                            <h2>Reports and Advisories</h2>
                            <button className="adr-form__modal-close" type="button" onClick={() => setShowReportsModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="adr-form__modal-body">
                            <table className="adr-form__modal-table">
                                <thead>
                                    <tr>
                                        <th className="adr-form__modal-table-number">#</th>
                                        <th className="adr-form__modal-table-report-col">Reports and Advisories Released</th>
                                        <th className="adr-form__modal-table-remarks-col">Remarks</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="adr-form__modal-table-body">
                                    {tempReportsItems.map((item, index) => (
                                        <tr className="adr-form__modal-table-row" key={item.id}>
                                            <td className="adr-form__modal-table-number">{index + 1}</td>
                                            <td className="adr-form__modal-table-report-col">
                                                <textarea
                                                    className="adr-form__modal-input adr-form__modal-textarea adr-form__modal-textarea--report"
                                                    placeholder="Enter reports and advisories released"
                                                    rows="5"
                                                    value={item.report ?? ''}
                                                    onChange={(e) => {
                                                        setTempReportsItems(tempReportsItems.map(i => 
                                                            i.id === item.id ? { ...i, report: e.target.value } : i
                                                        ));
                                                    }}
                                                ></textarea>
                                            </td>
                                            <td className="adr-form__modal-table-remarks-col">
                                                <textarea 
                                                    className="adr-form__modal-input adr-form__modal-textarea" 
                                                    placeholder="Enter remarks (multiple lines allowed)"
                                                    rows="2"
                                                    value={item.remarks ?? ''}
                                                    onChange={(e) => {
                                                        setTempReportsItems(tempReportsItems.map(i => 
                                                            i.id === item.id ? { ...i, remarks: e.target.value } : i
                                                        ));
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <button 
                                                    className="adr-form__modal-action-btn" 
                                                    type="button"
                                                    onClick={() => removeReportsItem(item.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="adr-form__modal-add-row" type="button" onClick={addReportsItem}>
                                +
                            </button>
                        </div>
                        <div className="adr-form__modal-footer">
                            <button className="adr-form__modal-confirm" type="button" onClick={() => setShowReportsModal(false)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showOtherItemsModal && (
                <div className="adr-form__modal adr-form__modal--active" onClick={() => setShowOtherItemsModal(false)}>
                    <div className="adr-form__modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="adr-form__modal-header">
                            <h2>Status of Other Items</h2>
                            <button className="adr-form__modal-close" type="button" onClick={() => setShowOtherItemsModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="adr-form__modal-body">
                            <table className="adr-form__modal-table">
                                <thead>
                                    <tr>
                                        <th className="adr-form__modal-table-other-particulars-col">Particulars</th>
                                        <th className="adr-form__modal-table-other-no-col">No. of Items</th>
                                        <th className="adr-form__modal-table-other-status-col">Status / Remarks</th>
                                        <th className="adr-form__modal-table-actions-col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="adr-form__modal-table-body">
                                    {otherItemsRows.map((row) => (
                                        <tr className="adr-form__modal-table-row" key={row.id}>
                                            <td className="adr-form__modal-table-other-particulars-col">
                                                <input 
                                                    type="text" 
                                                    className="adr-form__modal-input" 
                                                    placeholder="Enter particulars"
                                                    value={row.particulars ?? ''}
                                                    onChange={(e) => updateOtherItemsRow(row.id, 'particulars', e.target.value)}
                                                />
                                            </td>
                                            <td className="adr-form__modal-table-other-no-col">
                                                <div className="adr-form__counter">
                                                    <button 
                                                        className="adr-form__counter-btn" 
                                                        type="button"
                                                        onClick={() => decrementOtherItemsCounter(row.id)}
                                                    >
                                                        −
                                                    </button>
                                                    <input 
                                                        type="number" 
                                                        className="adr-form__counter-input" 
                                                        value={row.noOfItems === 0 && focusedCounterKey === `other-${row.id}` ? '' : (row.noOfItems === 0 ? '0' : row.noOfItems)} 
                                                        min="0"
                                                        onFocus={() => setFocusedCounterKey(`other-${row.id}`)}
                                                        onBlur={() => setFocusedCounterKey(null)}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            if (v === '') {
                                                                updateOtherItemsRow(row.id, 'noOfItems', 0);
                                                                return;
                                                            }
                                                            const n = parseInt(v, 10);
                                                            if (!isNaN(n) && n >= 0) updateOtherItemsRow(row.id, 'noOfItems', n);
                                                        }}
                                                    />
                                                    <button 
                                                        className="adr-form__counter-btn" 
                                                        type="button"
                                                        onClick={() => incrementOtherItemsCounter(row.id)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="adr-form__modal-table-other-status-col">
                                                <textarea 
                                                    className="adr-form__modal-input adr-form__modal-textarea adr-form__modal-textarea--md" 
                                                    placeholder="Enter status/remarks (multiple lines allowed)"
                                                    rows="2"
                                                    value={row.status ?? ''}
                                                    onChange={(e) => updateOtherItemsRow(row.id, 'status', e.target.value)}
                                                />
                                            </td>
                                            <td className="adr-form__modal-table-actions-col">
                                                <button 
                                                    className="adr-form__modal-action-btn" 
                                                    type="button"
                                                    onClick={() => removeOtherItemsRow(row.id)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="adr-form__modal-add-row" type="button" onClick={addOtherItemsRow}>
                                +
                            </button>
                        </div>
                        <div className="adr-form__modal-footer">
                            <button className="adr-form__modal-confirm" type="button" onClick={() => setShowOtherItemsModal(false)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAdminMattersModal && (
                <div className="adr-form__modal adr-form__modal--active" onClick={() => setShowAdminMattersModal(false)}>
                    <div className="adr-form__modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="adr-form__modal-header">
                            <h2>C. Other Administrative Matters</h2>
                            <button className="adr-form__modal-close" type="button" onClick={() => setShowAdminMattersModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="adr-form__modal-body">
                            <div className="adr-form__admin-matters-description">
                                List down administrative concerns such as but not limited to: Duty driver on-call, vehicle activities,
                                internet or other ICT equipment issues, parcel or documents received/delivered, untoward
                                incidents that should be elevated to the management level.
                            </div>

                            <div className="adr-form__field" style={{ marginBottom: 0 }}>
                                <label>C. Other Administrative Matters:</label>
                                <textarea
                                    className="adr-form__modal-input adr-form__modal-textarea"
                                    rows="4"
                                    placeholder="Enter each concern on a new line..."
                                    value={adminMatters.map(m => m.concern).join('\n')}
                                    onChange={(e) => {
                                        const lines = e.target.value.split('\n');
                                        setAdminMatters(lines.map((concern, index) => ({ id: index + 1, concern: concern || '' })));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const { selectionStart } = e.target;
                                            const val = e.target.value;
                                            const newVal = val.substring(0, selectionStart) + '\n' + val.substring(selectionStart);
                                            const lines = newVal.split('\n');
                                            setAdminMatters(lines.map((concern, index) => ({ id: index + 1, concern: concern || '' })));
                                            setTimeout(() => {
                                                e.target.setSelectionRange(selectionStart + 1, selectionStart + 1);
                                            }, 0);
                                        }
                                    }}
                                />
                            </div>

                            <div className="adr-form__field" style={{ marginBottom: 0 }}>
                                <label>1. The following were endorsed to incoming Operations Duty Staff:</label>
                                <textarea
                                    className="adr-form__modal-input adr-form__modal-textarea"
                                    rows="3"
                                    placeholder="Enter each endorsed item on a new line (e.g. 2 units of mobile phones)..."
                                    value={endorsedItems.map(e => e.endorsed).join('\n')}
                                    onChange={(e) => {
                                        const lines = e.target.value.split('\n');
                                        setEndorsedItems(lines.map((endorsed, index) => ({ id: index + 1, endorsed: endorsed || '' })));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const { selectionStart } = e.target;
                                            const val = e.target.value;
                                            const newVal = val.substring(0, selectionStart) + '\n' + val.substring(selectionStart);
                                            const lines = newVal.split('\n');
                                            setEndorsedItems(lines.map((endorsed, index) => ({ id: index + 1, endorsed: endorsed || '' })));
                                            setTimeout(() => {
                                                e.target.setSelectionRange(selectionStart + 1, selectionStart + 1);
                                            }, 0);
                                        }
                                    }}
                                />
                            </div>

                            <div className="adr-form__info-static">
                                2. For information of the OCD Officer-In-Charge.
                            </div>
                        </div>
                        <div className="adr-form__modal-footer">
                            <button className="adr-form__modal-confirm" type="button" onClick={() => setShowAdminMattersModal(false)}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ADRForm; 