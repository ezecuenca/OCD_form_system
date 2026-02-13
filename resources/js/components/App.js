import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
import LoadingScreen from './LoadingScreen';

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

function RequireAuth({ children }) {
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        let isMounted = true;
        axios.get('/api/auth/me')
            .then(() => {
                if (isMounted) setStatus('authed');
            })
            .catch(() => {
                if (isMounted) setStatus('guest');
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === 'loading') {
        return <LoadingScreen message="Loading your workspace..." />;
    }

    if (status === 'guest') {
        return <Navigate to="/login" replace state={{ reason: 'session-expired' }} />;
    }

    return children;
}

function App() {
    return (
        <FormProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route
                        path="/*"
                        element={
                            <RequireAuth>
                                <AppLayout />
                            </RequireAuth>
                        }
                    />
                </Routes>
            </Router>
        </FormProvider>
    );
}

export default App;