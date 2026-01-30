import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FormProvider } from '../context/FormContext';
import Sidebar from './Sidebar';
import Header from './Header';
import ADRReports from './ADRReports';
import ADRForm from './ADRForm';
import Schedule from './Schedule';
import ArchivedReports from './ArchivedReports';
import Settings from './Settings';
import DocumentViewer from './DocumentViewer';
import SwapForm from './SwapForm';

function App() {
    return (
        <FormProvider>
            <Router>
                <Sidebar />
                <Header />
                <main className="main-content" id="app-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/adr-reports" replace />} />
                        <Route path="/dashboard" element={<Navigate to="/adr-reports" replace />} />
                        <Route path="/adr-reports" element={<ADRReports />} />
                        <Route path="/adr-reports/create" element={<ADRForm />} />
                        <Route path="/adr-reports/view/:id" element={<DocumentViewer />} />
                        <Route path="/schedule" element={<Schedule />} />
                        <Route path="/swap-form" element={<SwapForm />} />
                        <Route path="/archived-reports" element={<ArchivedReports />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </main>
            </Router>
        </FormProvider>
    );
}

export default App;
