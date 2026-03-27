import React from 'react';

import AnalyticsCharts from '../components/AnalyticsCharts';
import { Star, TrendingUp, Users, DollarSign } from 'lucide-react';

const Analytics = () => {
    // Mock data for KPIs
    const kpis = [
        { label: 'Tasa de Retención', value: '85%', subtext: '+3% vs mes anterior', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Satisfacción', value: '4.8/5.0', subtext: 'Basado en 120 encuestas', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { label: 'Tratamientos Activos', value: '42', subtext: '12 Ortodoncias nuevas', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Ingresos Mensuales', value: '$12,450', subtext: 'Meta: $15,000', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-8">
            <header className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">Panel de Análisis</h1>
                <p className="text-secondary mt-1 text-sm md:text-base">Visión estratégica del rendimiento de la clínica.</p>
            </header>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 transition-all hover:shadow-md duration-300 group">
                        <div className={`${kpi.bg} p-3 rounded-xl transform transition-transform group-hover:scale-110 shrink-0`}>
                            <kpi.icon size={24} className={kpi.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-500 font-sans truncate">{kpi.label}</p>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mt-1 font-sans">{kpi.value}</h3>
                            <p className="text-[10px] md:text-xs text-green-600 mt-1 font-sans truncate">{kpi.subtext}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts — grouped container */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <h3 className="text-base md:text-lg font-serif font-bold text-gray-800 mb-6">Gráficos de Rendimiento</h3>
                <AnalyticsCharts />
            </div>

            {/* Visual divider */}
            <div className="border-t border-gray-200"></div>

            {/* Satisfaction Survey Feedback (Mock) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-6">Feedback Reciente de Pacientes</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0 hover:bg-gray-50/50 p-2 rounded-lg transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 mr-4 font-sans border border-gray-200">
                                {['JP', 'MG', 'AR'][i]}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-gray-800 font-sans">Paciente Anónimo</h4>
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, j) => <Star key={j} size={14} fill={j < (5 - i % 2) ? "currentColor" : "none"} />)}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 italic font-medium font-serif">"Excelente atención, el doctor fue muy amable y el tratamiento indoloro. Recomendado!"</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
