import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    Home, 
    Users, 
    Calendar, 
    FileText, 
    Settings, 
    LogOut, 
    Receipt, 
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import { authAPI } from '../../services/api';
import useConfigStore from '../../store/useConfigStore';

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
    isMobileMenuOpen?: boolean;
    onCloseMobileMenu?: () => void;
    isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    isCollapsed = false, 
    onToggle, 
    isMobileMenuOpen = false,
    onCloseMobileMenu,
    isMobile = false
}) => {
    const navigate = useNavigate();
    const { clinicName } = useConfigStore();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Pacientes', path: '/pacientes', icon: Users },
        { name: 'Citas', path: '/citas', icon: Calendar },
        { name: 'Historia Clínica', path: '/historia', icon: FileText },
        { name: 'Facturación', path: '/facturacion', icon: Receipt },
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

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || user.full_name || 'Doctor';
    const userInitial = userName.charAt(0).toUpperCase();

    const sidebarContent = (
        <>
            {/* Logo Section */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className={clsx("flex items-center transition-all", (isCollapsed && !isMobile) ? "justify-center" : "gap-3")}>
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                            {clinicName?.charAt(0) || 'M'}
                        </div>
                        {(!isCollapsed || isMobile) && (
                            <div className="min-w-0">
                                <h1 className="text-lg font-bold text-gray-800 truncate">{clinicName || 'MedicCore'}</h1>
                                <p className="text-[10px] text-gray-400 truncate">Portal Clínico</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-4 px-2 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                onClick={onCloseMobileMenu}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    )
                                }
                            >
                                <item.icon size={20} className="shrink-0" />
                                {(!isCollapsed || isMobile) && (
                                    <span className="font-medium text-sm truncate">{item.name}</span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-100">
                {/* User Profile */}
                <div className={clsx(
                    "flex items-center rounded-xl bg-gray-50 p-2",
                    (isCollapsed && !isMobile) ? "justify-center" : "gap-3"
                )}>
                    <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {userInitial}
                    </div>
                    {(!isCollapsed || isMobile) && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
                            <p className="text-[10px] text-gray-400 truncate">{user.email || 'Doctor'}</p>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className={clsx(
                        "flex items-center w-full mt-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors p-2",
                        (isCollapsed && !isMobile) ? "justify-center" : "px-3"
                    )}
                >
                    <LogOut size={18} />
                    {(!isCollapsed || isMobile) && <span className="ml-2 text-sm font-medium">Cerrar Sesión</span>}
                </button>
            </div>

            {/* Toggle Button - Always visible on desktop */}
            {!isMobile && onToggle && (
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary shadow-md transition-all z-50"
                    title={isCollapsed ? "Expandir" : "Colapsar"}
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            )}
        </>
    );

    // Mobile Drawer
    if (isMobile) {
        return (
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 h-screen bg-white z-50 flex flex-col shadow-xl border-r border-gray-200 w-[280px]"
                    >
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>
        );
    }

    // Desktop Sidebar
    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="fixed left-0 top-0 h-screen bg-white z-40 flex flex-col shadow-xl border-r border-gray-200"
        >
            {sidebarContent}
        </motion.aside>
    );
};

export default Sidebar;
