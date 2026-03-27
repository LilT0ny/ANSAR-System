import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, Calendar, FileText, Settings, LogOut, TrendingUp, Receipt, BarChart3, Bell, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import { notificationsAPI, authAPI } from '../services/api';

const Sidebar = () => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);

    // Polling original
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const notifs = await notificationsAPI.getDoctorNotifications();
                if (Array.isArray(notifs)) {
                    setNotifications(notifs.map(n => ({ ...n, read: n.is_read })));
                }
            } catch (err) {
                console.error("Error fetching notifications via Sidebar:", err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30 sec polling
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    const clearAllNotifications = async () => {
        try {
            await notificationsAPI.clearDoctorNotifications();
            setNotifications([]);
        } catch (err) {
            console.error("Error clearing notifications:", err);
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

    const handleLogout = async () => {
        if (window.confirm('¿Estás segura de que quieres cerrar sesión?')) {
            try {
                await authAPI.logout();
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login');
            } catch (err) {
                console.error('Logout error:', err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    return (
        <>
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm sticky top-0 z-40">
                <div className="flex items-center">
                    {/* Hamburger Menu (Mobile only) */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg mr-2 md:mr-3 shadow-sm hover:shadow-md transition-shadow">
                            A
                        </div>
                        <h1 className="text-xl font-serif font-bold text-gray-800 tracking-wide">AN-SAR</h1>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-1">
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
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Right section: Notifications + Logout */}
                <div className="flex items-center space-x-1 md:space-x-2">
                    {/* Notifications Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative flex items-center text-gray-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-green-50"
                            title="Notificaciones"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 md:h-5 md:w-5 bg-red-500 rounded-full text-white text-[8px] md:text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
                                {/* Dropdown Header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800 font-serif">Notificaciones</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Reservas de pacientes</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={clearAllNotifications}
                                                className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium"
                                            >
                                                Limpiar todas
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
                                        notifications.map((notif) => {
                                            const d = new Date(notif.created_at + 'Z');
                                            const timeAgo = Math.floor((new Date().getTime() - d.getTime()) / 60000);
                                            let timeText = 'ahora';
                                            if (timeAgo > 60) timeText = `hace ${Math.floor(timeAgo / 60)}h`;
                                            else if (timeAgo > 0) timeText = `hace ${timeAgo}m`;

                                            const pName = notif.subject || 'Cita';
                                            const shortName = pName.split(' ').map((n: string) => n?.[0]).join('').substring(0, 2);

                                            return (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => { markAsRead(notif.id); setIsMobileMenuOpen(false); }}
                                                    className={clsx(
                                                        'flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0',
                                                        !notif.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50'
                                                    )}
                                                >
                                                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                                        {shortName}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className={clsx('text-sm truncate', !notif.read ? 'font-bold text-gray-800' : 'font-medium text-gray-600')}>
                                                                {pName}
                                                            </p>
                                                            <span className="text-[10px] text-gray-400 font-medium shrink-0">{timeText}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5" dangerouslySetInnerHTML={{ __html: notif.message_content?.replace(/<[^>]*>?/gm, ' ') || '' }}></p>
                                                    </div>
                                                    {!notif.read && (
                                                        <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

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
                    <span className="text-xs text-gray-400 font-medium hidden lg:inline">Salir</span>
                </div>
            </div>

            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg mr-2">
                                        A
                                    </div>
                                    <h1 className="text-xl font-serif font-bold text-gray-800">AN-SAR</h1>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                                {menuItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            clsx(
                                                'flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all',
                                                isActive
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            )
                                        }
                                    >
                                        <item.icon size={22} className="mr-3" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors"
                                >
                                    <LogOut size={22} className="mr-3" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
