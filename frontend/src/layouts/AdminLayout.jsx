import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="flex flex-col bg-gray-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 pb-16">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
