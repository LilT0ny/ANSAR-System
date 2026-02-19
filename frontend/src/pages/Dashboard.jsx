import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Users, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { patientsAPI, appointmentsAPI } from '../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [patientsCount, setPatientsCount] = useState(0);
    const [recentPatients, setRecentPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const patients = await patientsAPI.list();
            setPatientsCount(patients.length);
            // Get the 3 most recent patients for "Próximas Citas" mock display
            const sorted = [...patients].sort((a, b) =>
                new Date(b.created_at || 0) - new Date(a.created_at || 0)
            );
            setRecentPatients(sorted.slice(0, 3));
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            if (err.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const kpis = [
        { label: 'Total Pacientes', value: loading ? '...' : String(patientsCount), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Citas Pendientes', value: '—', icon: Calendar, color: 'text-primary', bg: 'bg-green-50' },
        { label: 'Ingresos del Mes', value: '—', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Tratamientos', value: '—', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.full_name || 'Doctor(a)';

    return (
        <div className="space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-serif font-bold text-gray-800">Hola, {userName}</h1>
                <p className="text-secondary mt-1 font-medium">
                    Resumen general. Tienes <span className="text-primary font-bold">{patientsCount} paciente{patientsCount !== 1 ? 's' : ''}</span> registrado{patientsCount !== 1 ? 's' : ''}.
                </p>
            </header>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 transition-transform hover:-translate-y-1 duration-300">
                        <div className={`${kpi.bg} p-3 rounded-xl`}>
                            <kpi.icon size={24} className={kpi.color} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 font-sans">{kpi.label}</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1 font-sans">{kpi.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section - Rendimiento Mensual */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-serif">Rendimiento Mensual</h3>
                    {/* Charts embedded directly inside */}
                    <AnalyticsCharts />
                </div>

                {/* Recent Patients */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-serif">Pacientes Recientes</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-primary" size={24} />
                            </div>
                        ) : recentPatients.length === 0 ? (
                            <p className="text-gray-400 text-center py-8 text-sm">No hay pacientes registrados.</p>
                        ) : (
                            recentPatients.map((p, i) => (
                                <div
                                    key={p.id || i}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group cursor-pointer"
                                    onClick={() => navigate(`/historia/${p.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                            {(p.first_name || '?')[0]}{(p.last_name || '?')[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{p.first_name} {p.last_name}</p>
                                            <p className="text-xs text-gray-500">{p.document_id || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">
                                            {p.created_at ? new Date(p.created_at).toLocaleDateString('es-ES') : '—'}
                                        </p>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                                            Activo
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/pacientes')}
                        className="w-full mt-6 py-2 text-primary font-medium text-sm hover:underline"
                    >
                        Ver Todos los Pacientes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
