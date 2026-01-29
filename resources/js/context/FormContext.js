import React, { createContext, useContext, useState, useEffect } from 'react';

const FormContext = createContext();

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};

// Normalize id so string "123" and number 123 match (e.g. from URL vs state)
const sameId = (a, b) => (a == null && b == null) || (Number(a) === Number(b));

export const FormProvider = ({ children }) => {
    // Load reports from localStorage on initialization
    const [reports, setReports] = useState(() => {
        const savedReports = localStorage.getItem('adr_reports');
        return savedReports ? JSON.parse(savedReports) : [];
    });

    // Save reports to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('adr_reports', JSON.stringify(reports));
    }, [reports]);

    const addReport = (reportData) => {
        const newReport = {
            id: Date.now(),
            ...reportData,
            createdAt: new Date().toISOString(),
            alertStatus: reportData.status ?? 'WHITE ALERT', // WHITE ALERT, etc. from form dropdown
            status: 'Active' // Active/Archived for reports list
        };
        setReports(prev => [newReport, ...prev]);
        return newReport;
    };

    const updateReport = (id, reportData) => {
        setReports(prev => prev.map(report => {
            if (sameId(report.id, id)) {
                return {
                    ...report,
                    ...reportData,
                    id: report.id,
                    createdAt: report.createdAt,
                    updatedAt: new Date().toISOString(),
                    alertStatus: reportData.status ?? report.alertStatus ?? 'WHITE ALERT',
                    status: report.status // Preserve Active/Archived for list
                };
            }
            return report;
        }));
    };

    const getReport = (id) => {
        return reports.find(report => sameId(report.id, id));
    };

    const deleteReport = (id) => {
        setReports(prev => prev.filter(report => !sameId(report.id, id)));
    };

    const archiveReport = (id) => {
        setReports(prev => prev.map(report =>
            sameId(report.id, id) ? { ...report, status: 'Archived' } : report
        ));
    };

    const restoreReport = (id) => {
        setReports(prev => prev.map(report =>
            sameId(report.id, id) ? { ...report, status: 'Active' } : report
        ));
    };

    return (
        <FormContext.Provider value={{ reports, addReport, updateReport, getReport, deleteReport, archiveReport, restoreReport }}>
            {children}
        </FormContext.Provider>
    );
};
