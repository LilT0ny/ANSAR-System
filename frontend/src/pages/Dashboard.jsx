import React from 'react';
import { Bell, Activity, Users, Calendar, DollarSign } from 'lucide-react';
import AnalyticsCharts from '../components/AnalyticsCharts';

const Dashboard = () => {
    // Mock Data
    const kpis = [
        { label: 'Pacientes Hoy', value: '12', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Citas Pendientes', value: '5', icon: Calendar, color: 'text-primary', bg: 'bg-green-50' }, // Primary Green
        { label: 'Ingresos del Mes', value: '$4,500', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Tratamientos', value: '8', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-8 p-8 bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Hola, Dra. Ansar</h1>
                    <p className="text-secondary mt-1 font-medium">Resumen del día. Tienes <span className="text-primary font-bold">4 citas</span> pendientes.</p>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="relative p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-secondary hover:text-primary">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="h-10 w-10 bg-gray-200 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-serif">Rendimiento Mensual</h3>
                    <div className="h-[300px] w-full">
                        {/* We reuse the charts component but constrained */}
                        <AnalyticsCharts />
                    </div>
                </div>

                {/* Recent Activity / Next Appointments */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-serif">Próximas Citas</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Maria Garcia', time: '10:00 AM', type: 'Limpieza', status: 'Confirmada' },
                            { name: 'Juan Lopez', time: '11:30 AM', type: 'Consulta', status: 'Pendiente' },
                            { name: 'Ana Martinez', time: '03:00 PM', type: 'Ortodoncia', status: 'En Sala' },
                        ].map((appt, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                        {appt.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{appt.name}</p>
                                        <p className="text-xs text-gray-500">{appt.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-700">{appt.time}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${appt.status === 'Confirmada' ? 'bg-blue-100 text-blue-600' :
                                            appt.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-green-100 text-green-600'
                                        }`}>
                                        {appt.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 text-primary font-medium text-sm hover:underline">
                        Ver Agenda Completa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
