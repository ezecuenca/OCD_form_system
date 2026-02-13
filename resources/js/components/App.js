import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { FormProvider } from '../context/FormContext';
import Sidebar from './Sidebar';
import Header from './Header';
import ADRReports from './ADRReports';
import ADRForm from './ADRForm';
import Schedule from './Schedule';
import SwapForm from './SwapForm';
import ArchivedReports from './ArchivedReports';
import Settings from './Settings';
import Profile from './Profile';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';

function ViewRedirect() {
    const { id } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/adr-reports', { replace: true, state: { openDocumentId: id } });
    }, [id, navigate]);
    return null;
}

function AppLayout() {
    return (
        <>
            <Sidebar />
            <Header />
            <main className="main-content" id="app-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/dashboard" element={<Navigate to="/schedule" replace />} />
                    <Route path="/adr-reports" element={<ADRReports />} />
                    <Route path="/adr-reports/create" element={<ADRForm />} />
                    <Route path="/adr-reports/view/:id" element={<ViewRedirect />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/swap-form" element={<SwapForm />} />
                    <Route path="/archived-reports" element={<ArchivedReports />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </main>
        </>
    );
}

function App() {
    return (
        <FormProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/*" element={<AppLayout />} />
                </Routes>
            </Router>
        </FormProvider>
    );
}

export default App;
