import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { FormProvider } from '../context/FormContext';
import Sidebar from './Sidebar';
import Header from './Header';
import ADRReports from './ADRReports';
import ADRForm from './ADRForm';
import Schedule from './Schedule';
import SwapForm from './SwapForm';
import ArchivedReports from './ArchivedReports';
import Settings from './Settings';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';

// Redirect old /adr-reports/view/:id to list with modal open (modal-only flow)
function ViewRedirect() {
    const { id } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/adr-reports', { replace: true, state: { openDocumentId: id } });
    }, [id, navigate]);
    return null;
}

function AppContent() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    return (
        <>
            {!isAuthPage && <Sidebar />}
            {!isAuthPage && <Header />}
            <main className={isAuthPage ? "" : "main-content"} id="app-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/adr-reports" replace />} />
                    <Route path="/dashboard" element={<Navigate to="/adr-reports" replace />} />
                    <Route path="/adr-reports" element={<ADRReports />} />
                    <Route path="/adr-reports/create" element={<ADRForm />} />
                    <Route path="/adr-reports/view/:id" element={<ViewRedirect />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/swap-form" element={<SwapForm />} />
                    <Route path="/archived-reports" element={<ArchivedReports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                </Routes>
            </main>
        </>
    );
}

function App() {
    return (
        <FormProvider>
            <Router>
                <AppContent />
            </Router>
        </FormProvider>
    );
}

export default App;
