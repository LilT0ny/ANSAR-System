import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Calendar, FileText, Settings, LogOut, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
    const menuItems = [
        { name: 'Inicio', path: '/dashboard', icon: Home },
        { name: 'Pacientes', path: '/pacientes', icon: User },
        { name: 'Citas', path: '/citas', icon: Calendar },
        { name: 'Historia Clínica', path: '/historia', icon: FileText },
        { name: 'Analítica', path: '/analytics', icon: TrendingUp },
        { name: 'Configuración', path: '/configuracion', icon: Settings },
    ];

    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm sticky top-0 z-40">
            <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg mr-3">
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

            <button className="flex items-center text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" title="Cerrar Sesión">
                <LogOut size={20} />
            </button>
        </div>
    );
};

export default Sidebar;
