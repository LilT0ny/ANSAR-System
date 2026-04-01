import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />
            <main 
                className="flex-1 overflow-y-auto transition-all duration-300"
                style={{ marginLeft: isSidebarCollapsed ? 80 : 280 }}
            >
                <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;