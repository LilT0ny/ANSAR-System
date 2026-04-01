import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    Home, 
    Users, 
    Calendar, 
    FileText, 
    Settings, 
    LogOut, 
    TrendingUp, 
    Receipt, 
    BarChart3,
    Bell,
    ChevronLeft,
    ChevronRight,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import { notificationsAPI, authAPI } from '../services/api';

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggle }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);

    // Polling for notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const notifs = await notificationsAPI.getDoctorNotifications();
                if (Array.isArray(notifs)) {
                    setNotifications(notifs.map(n => ({ ...n, read: n.is_read })));
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
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
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Pacientes', path: '/pacientes', icon: Users },
        { name: 'Citas', path: '/citas', icon: Calendar },
        { name: 'Historia Clínica', path: '/historia', icon: FileText },
        { name: 'Facturación', path: '/facturacion', icon: Receipt },
        { name: 'Finanzas', path: '/finanzas', icon: BarChart3 },
        { name: 'Analítica', path: '/analytics', icon: TrendingUp },
        { name: 'Configuración', path: '/configuracion', icon: Settings },
    ];

    const handleLogout = async () => {
        if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
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

    // Get user info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || user.full_name || 'Doctor';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <>
            {/* Sidebar Container */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 280 }}
                className="fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 z-40 flex flex-col shadow-2xl"
            >
                {/* Logo Section */}
                <div className="p-4 md:p-6 border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                        <div className={clsx("flex items-center transition-all", isCollapsed ? "justify-center" : "gap-3")}>
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
                                A
                            </div>
                            {!isCollapsed && (
                                <div>
                                    <h1 className="text-xl font-bold text-white font-serif tracking-wide">AN-SAR</h1>
                                    <p className="text-[10px] text-gray-400 -mt-0.5">Portal Clínico</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        clsx(
                                            'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative',
                                            isActive
                                                ? 'bg-gradient-to-r from-primary to-green-500 text-white shadow-lg shadow-primary/30'
                                                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={20} className={clsx("transition-transform", !isCollapsed && "group-hover:scale-110")} />
                                            {!isCollapsed && (
                                                <span className="font-medium text-sm">{item.name}</span>
                                            )}
                                            {/* Active indicator */}
                                            {isActive && (
                                                <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-gray-700/50">
                    {/* Notifications */}
                    <div className="relative mb-3" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={clsx(
                                "flex items-center w-full rounded-xl transition-all hover:bg-gray-700/50",
                                isCollapsed ? "justify-center p-3" : "px-3 py-3"
                            )}
                        >
                            <div className="relative">
                                <Bell size={20} className="text-gray-400" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {!isCollapsed && <span className="ml-3 text-sm text-gray-400">Notificaciones</span>}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute bottom-full left-0 w-80 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800">Notificaciones</h3>
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={clearAllNotifications}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-gray-400 text-sm">
                                            Sin notificaciones
                                        </div>
                                    ) : (
                                        notifications.slice(0, 5).map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => markAsRead(notif.id)}
                                                className={clsx(
                                                    "px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50",
                                                    !notif.read && "bg-primary/5"
                                                )}
                                            >
                                                <p className="text-sm font-medium text-gray-800">{notif.subject || 'Cita'}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{notif.message_content?.substring(0, 50)}...</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className={clsx(
                        "flex items-center rounded-xl bg-gray-800/50 p-3",
                        isCollapsed ? "justify-center" : "gap-3"
                    )}>
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-green-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {userInitial}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{userName}</p>
                                <p className="text-[10px] text-gray-400 truncate">{user.email || 'Doctor'}</p>
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className={clsx(
                            "flex items-center w-full mt-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors",
                            isCollapsed ? "justify-center p-3" : "px-3 py-3"
                        )}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="ml-3 text-sm font-medium">Cerrar Sesión</span>}
                    </button>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-20 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-600 shadow-lg transition-all"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </motion.aside>
        </>
    );
};

export default Sidebar;