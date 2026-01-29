import React, { createContext, useContext, useState } from 'react';

const FormContext = createContext();

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};

export const FormProvider = ({ children }) => {
    const [reports, setReports] = useState([]);

    const addReport = (reportData) => {
        const newReport = {
            id: Date.now(),
            ...reportData,
            createdAt: new Date().toISOString(),
            status: 'Active'
        };
        setReports(prev => [newReport, ...prev]);
        return newReport;
    };

    const updateReport = (id, reportData) => {
        setReports(prev => prev.map(report => {
            if (report.id === id) {
                return {
                    ...report,
                    ...reportData,
                    id: report.id, // Ensure ID is preserved
                    createdAt: report.createdAt, // Preserve original creation date
                    updatedAt: new Date().toISOString(),
                    status: report.status // Preserve original status unless explicitly changed
                };
            }
            return report;
        }));
    };

    const getReport = (id) => {
        return reports.find(report => report.id === id);
    };

    const deleteReport = (id) => {
        setReports(prev => prev.filter(report => report.id !== id));
    };

    const archiveReport = (id) => {
        setReports(prev => prev.map(report => 
            report.id === id ? { ...report, status: 'Archived' } : report
        ));
    };

    const restoreReport = (id) => {
        setReports(prev => prev.map(report => 
            report.id === id ? { ...report, status: 'Active' } : report
        ));
    };

    return (
        <FormContext.Provider value={{ reports, addReport, updateReport, getReport, deleteReport, archiveReport, restoreReport }}>
            {children}
        </FormContext.Provider>
    );
};
