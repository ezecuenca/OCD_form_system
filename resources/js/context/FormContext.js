import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const FormContext = createContext();

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};

const sameId = (a, b) => (a == null && b == null) || (Number(a) === Number(b));

export const FormProvider = ({ children }) => {
    const [profileImageUrl, setProfileImageUrlState] = useState(null);
    const [userFullName, setUserFullName] = useState('');
    const [reports, setReports] = useState([]);
    const [reportsLoaded, setReportsLoaded] = useState(false);

    // Fetch profile from server on mount to get user-specific image
    useEffect(() => {
        let isMounted = true;
        axios.get('/api/profile', { withCredentials: true })
            .then((res) => {
                if (isMounted) {
                    if (res.data?.full_name) {
                        setUserFullName(String(res.data.full_name).trim());
                    }
                    // Set profile image from server - this is user-specific
                    if (res.data?.image_path) {
                        setProfileImageUrlState(`/${res.data.image_path}`);
                    }
                }
            })
            .catch(() => {});
        return () => { isMounted = false; };
    }, []);

    const setProfileImageUrl = (url) => {
        // Just update state - no localStorage needed
        setProfileImageUrlState(url);
    };

    // Function to refresh profile data (called after login)
    const refreshProfile = useCallback(() => {
        axios.get('/api/profile', { withCredentials: true })
            .then((res) => {
                if (res.data?.full_name) {
                    setUserFullName(String(res.data.full_name).trim());
                } else {
                    setUserFullName('');
                }
                // Set profile image from server - this is user-specific
                if (res.data?.image_path) {
                    setProfileImageUrlState(`/${res.data.image_path}`);
                } else {
                    setProfileImageUrlState(null);
                }
            })
            .catch(() => {
                setUserFullName('');
                setProfileImageUrlState(null);
            });
    }, []);

    const loadReports = useCallback(() => {
        axios.get('/api/adr-forms', { withCredentials: true })
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setReports(res.data);
                }
            })
            .catch(() => {
                setReports([]);
            })
            .finally(() => {
                setReportsLoaded(true);
            });
    }, []);

    // Load reports from API when app mounts (authenticated user)
    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const fetchReport = (id) => {
        return axios.get(`/api/adr-forms/${id}`, { withCredentials: true })
            .then((res) => {
                const full = res.data;
                setReports(prev => {
                    const exists = prev.some(r => sameId(r.id, id));
                    if (exists) return prev.map(r => sameId(r.id, id) ? full : r);
                    return [full, ...prev];
                });
                return full;
            });
    };

    const addReport = async (reportData) => {
        const payload = {
            documentName: reportData.documentName ?? '',
            subject: reportData.subject ?? '',
            status: reportData.status ?? 'WHITE ALERT',
            alertStatus: reportData.alertStatus ?? reportData.status ?? 'WHITE ALERT',
            ...reportData
        };
        const { data } = await axios.post('/api/adr-forms', { report: payload }, { withCredentials: true });
        setReports(prev => [data, ...prev]);
        return data;
    };

    const updateReport = async (id, reportData) => {
        const payload = {
            documentName: reportData.documentName ?? '',
            subject: reportData.subject ?? '',
            status: reportData.status ?? 'WHITE ALERT',
            alertStatus: reportData.alertStatus ?? reportData.status ?? 'WHITE ALERT',
            ...reportData
        };
        const { data } = await axios.put(`/api/adr-forms/${id}`, { report: payload }, { withCredentials: true });
        setReports(prev => prev.map(r => sameId(r.id, id) ? data : r));
        return data;
    };

    const getReport = (id) => {
        return reports.find(report => sameId(report.id, id));
    };

    const deleteReport = (id) => {
        setReports(prev => prev.filter(report => !sameId(report.id, id)));
    };

    const archiveReport = async (id) => {
        try {
            const { data } = await axios.patch(`/api/adr-forms/${id}/archive`, {}, { withCredentials: true });
            setReports(prev => prev.map(r => sameId(r.id, id) ? data : r));
        } catch (_) {
            setReports(prev => prev.map(r => sameId(r.id, id) ? { ...r, status: 'Archived' } : r));
        }
    };

    const restoreReport = async (id) => {
        try {
            const { data } = await axios.patch(`/api/adr-forms/${id}/restore`, {}, { withCredentials: true });
            setReports(prev => prev.map(r => sameId(r.id, id) ? data : r));
        } catch (_) {
            setReports(prev => prev.map(r => sameId(r.id, id) ? { ...r, status: 'Active' } : r));
        }
    };

    return (
        <FormContext.Provider value={{
            reports,
            reportsLoaded,
            loadReports,
            addReport,
            updateReport,
            getReport,
            fetchReport,
            deleteReport,
            archiveReport,
            restoreReport,
            profileImageUrl,
            setProfileImageUrl,
            userFullName,
            setUserFullName,
            refreshProfile
        }}>
            {children}
        </FormContext.Provider>
    );
};