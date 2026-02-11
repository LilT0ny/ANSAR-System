import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

// Mock data for trends
const trendData = [
    { name: 'Ene', ingresos: 4000, pacientes: 24 },
    { name: 'Feb', ingresos: 3000, pacientes: 13 },
    { name: 'Mar', ingresos: 2000, pacientes: 58 },
    { name: 'Abr', ingresos: 2780, pacientes: 39 },
    { name: 'May', ingresos: 1890, pacientes: 48 },
    { name: 'Jun', ingresos: 2390, pacientes: 38 },
];

// Mock data for Pie chart (New vs Recurring) - UH 8 CA 1
const retentionData = [
    { name: 'Recurrentes', value: 400 },
    { name: 'Nuevos', value: 300 },
];

const COLORS = ['#8CC63E', '#6D6E72', '#E2251D', '#FCD34D']; // Primary, Secondary, Alert, Accent

const AnalyticsCharts = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Income Trend Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-6">Ingresos Mensuales</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8CC63E" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8CC63E" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6D6E72', fontSize: 12, fontFamily: 'Montserrat' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6D6E72', fontSize: 12, fontFamily: 'Montserrat' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="ingresos" stroke="#8CC63E" fillOpacity={1} fill="url(#colorIngresos)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Retention Pie Chart - UH 8 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-6">Fidelización de Pacientes</h3>
                <div className="h-64 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={retentionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {retentionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Treatment Types Bar Chart */}
            <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-6">Tratamientos Más Solicitados</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                { name: 'Ortodoncia', cantidad: 40 },
                                { name: 'Limpieza', cantidad: 65 },
                                { name: 'Blanqueamiento', cantidad: 25 },
                                { name: 'Implantes', cantidad: 15 },
                                { name: 'Carillas', cantidad: 10 },
                            ]}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6D6E72', fontSize: 12, fontFamily: 'Montserrat' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6D6E72', fontSize: 12, fontFamily: 'Montserrat' }} />
                            <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="cantidad" fill="#8CC63E" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
