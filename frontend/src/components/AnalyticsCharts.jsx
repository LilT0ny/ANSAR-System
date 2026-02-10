import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AnalyticsCharts = ({ data }) => {
    // Mock data if no data provided
    const chartData = data || [
        { name: 'Ene', ingresos: 4000, pacientes: 24 },
        { name: 'Feb', ingresos: 3000, pacientes: 18 },
        { name: 'Mar', ingresos: 2000, pacientes: 15 },
        { name: 'Abr', ingresos: 2780, pacientes: 20 },
        { name: 'May', ingresos: 1890, pacientes: 12 },
        { name: 'Jun', ingresos: 2390, pacientes: 16 },
        { name: 'Jul', ingresos: 3490, pacientes: 22 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Ingresos Mensuales</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#6D6E72" fontSize={12} />
                            <YAxis stroke="#6D6E72" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}
                                cursor={{ fill: '#f9fafb' }}
                            />
                            <Bar dataKey="ingresos" fill="#8CC63E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Evolución de Pacientes</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#6D6E72" fontSize={12} />
                            <YAxis stroke="#6D6E72" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}
                            />
                            <Line type="monotone" dataKey="pacientes" stroke="#6D6E72" strokeWidth={3} dot={{ fill: '#8CC63E', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
