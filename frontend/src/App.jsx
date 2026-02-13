import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import ClinicalHistory from './pages/ClinicalHistory';
import Analytics from './pages/Analytics';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Booking from './pages/Booking';
import Billing from './pages/Billing';
import FinanceDashboard from './pages/FinanceDashboard';
import AdminLayout from './layouts/AdminLayout';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="font-sans text-secondary bg-gray-50 min-h-screen">
                <Routes>
                    {/* Public Route */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/reserva" element={<Booking />} />

                    {/* Admin Routes (Wrapped in Layout) */}
                    <Route element={<AdminLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/pacientes" element={<Patients />} />
                        <Route path="/historia/:id?" element={<ClinicalHistory />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/citas" element={<Appointments />} />
                        <Route path="/facturacion" element={<Billing />} />
                        <Route path="/finanzas" element={<FinanceDashboard />} />
                        <Route path="/configuracion" element={<Settings />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
