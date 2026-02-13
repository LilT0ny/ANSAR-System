import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, Calendar, FileText, Settings, LogOut, TrendingUp, Receipt, BarChart3, Bell, X } from 'lucide-react';
import clsx from 'clsx';

// Mock notifications data for patient reservations
const mockNotifications = [
    { id: 1, patient: 'Maria Garcia', type: 'Limpieza', date: 'Hoy, 10:00 AM', status: 'Confirmada', read: false },
    { id: 2, patient: 'Juan Lopez', type: 'Consulta', date: 'Hoy, 11:30 AM', status: 'Pendiente', read: false },
    { id: 3, patient: 'Ana Martinez', type: 'Ortodoncia', date: 'Hoy, 03:00 PM', status: 'En Sala', read: false },
    { id: 4, patient: 'Carlos Ruiz', type: 'Blanqueamiento', date: 'Mañana, 09:00 AM', status: 'Confirmada', read: true },
    { id: 5, patient: 'Laura Fernández', type: 'Implantes', date: 'Mañana, 11:00 AM', status: 'Pendiente', read: true },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const notifRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Confirmada': return 'bg-blue-100 text-blue-600';
            case 'Pendiente': return 'bg-yellow-100 text-yellow-600';
            case 'En Sala': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const menuItems = [
        { name: 'Inicio', path: '/dashboard', icon: Home },
        { name: 'Pacientes', path: '/pacientes', icon: User },
        { name: 'Citas', path: '/citas', icon: Calendar },
        { name: 'Historia Clínica', path: '/historia', icon: FileText },
        { name: 'Facturación', path: '/facturacion', icon: Receipt },
        { name: 'Finanzas', path: '/finanzas', icon: BarChart3 },
        { name: 'Analítica', path: '/analytics', icon: TrendingUp },
        { name: 'Configuración', path: '/configuracion', icon: Settings },
    ];

    const handleLogout = () => {
        if (window.confirm('¿Estás segura de que quieres cerrar sesión?')) {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm sticky top-0 z-40">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg mr-3 shadow-sm hover:shadow-md transition-shadow">
                    A
                </div>
                <h1 className="text-xl font-serif font-bold text-gray-800 tracking-wide hidden md:block">AN-SAR</h1>
            </div>

            <nav className="flex space-x-1 overflow-x-auto no-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            )
                        }
                    >
                        <item.icon size={18} className="mr-2" />
                        <span className="hidden md:inline">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Right section: Notifications + Logout */}
            <div className="flex items-center space-x-2">
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative flex items-center text-gray-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-green-50"
                        title="Notificaciones"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
                            {/* Dropdown Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 font-serif">Notificaciones</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Reservas de pacientes</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-primary hover:underline font-medium"
                                        >
                                            Marcar todo leído
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Notification Items */}
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm">
                                        No hay notificaciones
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => markAsRead(notif.id)}
                                            className={clsx(
                                                'flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0',
                                                !notif.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50'
                                            )}
                                        >
                                            {/* Patient avatar */}
                                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                                {notif.patient.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={clsx('text-sm truncate', !notif.read ? 'font-bold text-gray-800' : 'font-medium text-gray-600')}>
                                                        {notif.patient}
                                                    </p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusStyle(notif.status)}`}>
                                                        {notif.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{notif.type} · {notif.date}</p>
                                            </div>
                                            {/* Unread dot */}
                                            {!notif.read && (
                                                <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Dropdown Footer */}
                            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                                <button
                                    onClick={() => { navigate('/citas'); setShowNotifications(false); }}
                                    className="w-full text-center text-sm text-primary font-medium hover:underline"
                                >
                                    Ver todas las citas
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                    title="Cerrar Sesión"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
