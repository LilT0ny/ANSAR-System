import React, { useState, useMemo } from 'react';
import {
    DollarSign, TrendingDown, TrendingUp, Wallet, Plus, X,
    Calendar, Filter, ArrowUpRight, ArrowDownRight, CheckCircle,
    Receipt, CreditCard, Building, Zap, Package
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Legend, LineChart, Line, Cell, PieChart, Pie,
    Treemap
} from 'recharts';

// ── Category Icons & Colors ───────────────────────────────────────────
const EXPENSE_CATEGORIES = [
    { id: 'materiales', label: 'Materiales Dentales', icon: Package, color: '#8b5cf6' },
    { id: 'servicios', label: 'Servicios (Agua, Luz, Internet)', icon: Zap, color: '#f59e0b' },
    { id: 'renta', label: 'Renta / Alquiler', icon: Building, color: '#ef4444' },
    { id: 'nomina', label: 'Nómina / Salarios', icon: CreditCard, color: '#3b82f6' },
    { id: 'otros', label: 'Otros Gastos', icon: Receipt, color: '#6b7280' },
];

// ── Mock Data ─────────────────────────────────────────────────────────
const generateMonthlyData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months.map((m, i) => ({
        month: m,
        ingresos: Math.floor(3000 + Math.random() * 9000),
        egresos: Math.floor(1500 + Math.random() * 5000),
    }));
};

const INITIAL_EXPENSES = [
    { id: 1, description: 'Resinas Compostas 3M', category: 'materiales', amount: 450, date: '2026-02-01' },
    { id: 2, description: 'Alquiler Local - Febrero', category: 'renta', amount: 1200, date: '2026-02-01' },
    { id: 3, description: 'Servicio de Electricidad', category: 'servicios', amount: 180, date: '2026-02-05' },
    { id: 4, description: 'Brackets cerámicos (lote)', category: 'materiales', amount: 800, date: '2026-01-28' },
    { id: 5, description: 'Asistente dental - Enero', category: 'nomina', amount: 950, date: '2026-01-31' },
    { id: 6, description: 'Agua potable', category: 'servicios', amount: 65, date: '2026-01-15' },
    { id: 7, description: 'Guantes y material descartable', category: 'materiales', amount: 210, date: '2026-02-08' },
];

const YEARS = [2024, 2025, 2026];

// ── Custom Tooltip ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
            <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="text-sm" style={{ color: p.color }}>
                    <span className="font-semibold">{p.name}:</span> ${p.value.toLocaleString()}
                </p>
            ))}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────
const FinanceDashboard = () => {
    const [monthlyData] = useState(generateMonthlyData);
    const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedYear, setSelectedYear] = useState(2026);
    const [dateFrom, setDateFrom] = useState('2026-01-01');
    const [dateTo, setDateTo] = useState('2026-12-31');
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    // New expense form state
    const [newExpense, setNewExpense] = useState({
        description: '', category: 'materiales', amount: '', date: new Date().toISOString().split('T')[0],
    });

    // ── Derived KPIs ─────────────────────────────────────────────────
    const totalIngresos = useMemo(() => monthlyData.reduce((s, d) => s + d.ingresos, 0), [monthlyData]);
    const totalEgresos = useMemo(() => monthlyData.reduce((s, d) => s + d.egresos, 0), [monthlyData]);
    const balanceNeto = useMemo(() => totalIngresos - totalEgresos, [totalIngresos, totalEgresos]);
    const cuentasPorCobrar = useMemo(() => Math.floor(totalIngresos * 0.12), [totalIngresos]);

    // Filtered data by date range
    const filteredData = useMemo(() => {
        // For chart: filter months by selected year
        return monthlyData;
    }, [monthlyData, selectedYear]);

    // Net balance per month
    const chartDataWithBalance = useMemo(() =>
        filteredData.map(d => ({
            ...d,
            balance: d.ingresos - d.egresos,
        }))
        , [filteredData]);

    // Category breakdown for pie chart
    const categoryBreakdown = useMemo(() => {
        const map = {};
        expenses.forEach(e => {
            const cat = EXPENSE_CATEGORIES.find(c => c.id === e.category);
            if (!map[e.category]) map[e.category] = { name: cat?.label || e.category, value: 0, color: cat?.color || '#6b7280' };
            map[e.category].value += e.amount;
        });
        return Object.values(map);
    }, [expenses]);

    // Filtered expenses by date range
    const filteredExpenses = useMemo(() =>
        expenses.filter(e => e.date >= dateFrom && e.date <= dateTo)
        , [expenses, dateFrom, dateTo]);

    // ── Handlers ─────────────────────────────────────────────────────
    const toast = (msg) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000); };

    const addExpense = () => {
        if (!newExpense.description || !newExpense.amount) {
            toast('Completa todos los campos requeridos.');
            return;
        }
        const exp = { ...newExpense, id: Date.now(), amount: Number(newExpense.amount) };
        setExpenses([exp, ...expenses]);
        setNewExpense({ description: '', category: 'materiales', amount: '', date: new Date().toISOString().split('T')[0] });
        setShowExpenseModal(false);
        toast('Egreso registrado exitosamente.');
    };

    const deleteExpense = (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
        toast('Egreso eliminado.');
    };

    // ── KPI Cards Data ───────────────────────────────────────────────
    const kpis = [
        {
            label: 'Ingresos Totales',
            value: `$${totalIngresos.toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            trend: '+12.4%',
            trendUp: true,
        },
        {
            label: 'Egresos Totales',
            value: `$${totalEgresos.toLocaleString()}`,
            icon: TrendingDown,
            color: 'text-red-500',
            bg: 'bg-red-50',
            border: 'border-red-100',
            trend: '+5.2%',
            trendUp: false,
        },
        {
            label: 'Cuentas por Cobrar',
            value: `$${cuentasPorCobrar.toLocaleString()}`,
            icon: Wallet,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            trend: '8 pendientes',
            trendUp: null,
        },
        {
            label: 'Balance Neto (Utilidad)',
            value: `$${balanceNeto.toLocaleString()}`,
            icon: DollarSign,
            color: balanceNeto >= 0 ? 'text-primary' : 'text-red-500',
            bg: balanceNeto >= 0 ? 'bg-green-50' : 'bg-red-50',
            border: balanceNeto >= 0 ? 'border-green-100' : 'border-red-100',
            trend: balanceNeto >= 0 ? 'Rentable' : 'Déficit',
            trendUp: balanceNeto >= 0,
        },
    ];

    // ── Render ────────────────────────────────────────────────────────
    return (
        <div className="space-y-8">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <DollarSign className="text-primary" size={26} />
                        </div>
                        Salud Financiera
                    </h1>
                    <p className="text-secondary mt-1">Analiza ingresos, egresos y la rentabilidad de tu clínica.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Filters */}
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                        <Filter size={16} className="text-gray-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="text-sm outline-none text-gray-600 bg-transparent"
                        />
                        <span className="text-gray-300">→</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="text-sm outline-none text-gray-600 bg-transparent"
                        />
                    </div>

                    {/* Year Selector */}
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    <button
                        onClick={() => setShowExpenseModal(true)}
                        className="bg-primary hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus size={16} /> Registrar Egreso
                    </button>
                </div>
            </header>

            {/* ── KPI Cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border ${kpi.border} transition-transform hover:-translate-y-1 duration-300`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${kpi.bg} p-3 rounded-xl`}>
                                <kpi.icon size={22} className={kpi.color} />
                            </div>
                            {kpi.trendUp !== null && (
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                    {kpi.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {kpi.trend}
                                </div>
                            )}
                            {kpi.trendUp === null && (
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-600">{kpi.trend}</span>
                            )}
                        </div>
                        <p className="text-sm font-medium text-gray-500 font-sans">{kpi.label}</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1 font-serif">{kpi.value}</h3>
                    </div>
                ))}
            </div>

            {/* ── Charts Row ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Income vs Expenses Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-serif font-bold text-gray-800">Ingresos vs. Egresos Mensuales</h3>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{selectedYear}</span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartDataWithBalance} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6D6E72', fontSize: 12, fontFamily: 'Montserrat' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6D6E72', fontSize: 11, fontFamily: 'Montserrat' }}
                                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px', fontFamily: 'Montserrat' }}
                                />
                                <Bar dataKey="ingresos" name="Ingresos" fill="#8CC63E" radius={[6, 6, 0, 0]} barSize={24} />
                                <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                {/* Expense Category Treemap */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-serif font-bold text-gray-800 mb-6">Distribución de Egresos</h3>
                    <div className="h-64"> {/* Aumenté un poco la altura para que el Treemap luzca mejor */}
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={categoryBreakdown}
                                dataKey="value"
                                aspectRatio={4 / 3}
                                stroke="#fff"
                                fill="#8884d8"
                            >
                                <Tooltip
                                    formatter={(v) => `$${v.toLocaleString()}`}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px'
                                    }}
                                />
                            </Treemap>
                        </ResponsiveContainer>
                    </div>

                    {/* Leyenda personalizada inferior */}
                    <div className="space-y-2 mt-4">
                        {categoryBreakdown.map((cat, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.color }}></div>
                                    <span className="text-gray-600 font-medium">{cat.name}</span>
                                </div>
                                <span className="font-serif font-bold text-gray-700">${cat.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ── Balance Trend Line ──────────────────────────────── */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-6">Tendencia de Balance Neto</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartDataWithBalance}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8CC63E" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8CC63E" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6D6E72', fontSize: 12, fontFamily: 'Montserrat' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6D6E72', fontSize: 11, fontFamily: 'Montserrat' }}
                                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="balance"
                                name="Balance Neto"
                                stroke="#8CC63E"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Expenses Table ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-serif font-bold text-gray-800">Registro de Egresos</h3>
                    <button
                        onClick={() => setShowExpenseModal(true)}
                        className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> Nuevo Egreso
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-medium">
                            <tr>
                                <th className="px-6 py-3 text-left">Fecha</th>
                                <th className="px-6 py-3 text-left">Descripción</th>
                                <th className="px-6 py-3 text-left">Categoría</th>
                                <th className="px-6 py-3 text-right">Monto</th>
                                <th className="px-6 py-3 text-center w-16">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                                        No hay egresos registrados en este período.
                                    </td>
                                </tr>
                            ) : filteredExpenses.map(exp => {
                                const cat = EXPENSE_CATEGORIES.find(c => c.id === exp.category);
                                return (
                                    <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-3 text-gray-500">{exp.date}</td>
                                        <td className="px-6 py-3 font-medium text-gray-800">{exp.description}</td>
                                        <td className="px-6 py-3">
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                                                style={{
                                                    backgroundColor: `${cat?.color}15`,
                                                    color: cat?.color,
                                                }}
                                            >
                                                {cat && <cat.icon size={12} />}
                                                {cat?.label || exp.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-serif font-bold text-red-500">-${exp.amount.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => deleteExpense(exp.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ─── ADD EXPENSE MODAL ──────────────────────────────────── */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-serif font-bold text-gray-800">Registrar Egreso</h2>
                            <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 font-serif">Descripción</label>
                                <input
                                    type="text"
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    placeholder="Ej: Compra de resinas..."
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 font-serif">Categoría</label>
                                <select
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-white"
                                >
                                    {EXPENSE_CATEGORIES.map(c => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount & Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 font-serif">Monto ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 font-serif">Fecha</label>
                                    <input
                                        type="date"
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowExpenseModal(false)}
                                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={addExpense}
                                className="bg-primary hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all"
                            >
                                <CheckCircle size={16} /> Guardar Egreso
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Toast ──────────────────────────────────────────────── */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 z-50">
                    <CheckCircle className="text-primary" size={20} />
                    <span>{toastMsg}</span>
                </div>
            )}
        </div>
    );
};

export default FinanceDashboard;
