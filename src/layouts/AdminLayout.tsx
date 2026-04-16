import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/organisms/Sidebar';
import { Menu, X } from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setIsSidebarCollapsed(true);
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isMobileMenuOpen={isMobileMenuOpen}
                onCloseMobileMenu={closeMobileMenu}
                isMobile={isMobile}
            />
            
            {/* Mobile Overlay */}
            {isMobile && isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Main Content */}
            <main 
                className="flex-1 overflow-y-auto transition-all duration-300"
                style={{ 
                    marginLeft: isMobile ? 0 : (isSidebarCollapsed ? 80 : 280)
                }}
            >
                {/* Mobile Header */}
                {isMobile && (
                    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                        <button 
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-gray-800">MedicCore</h1>
                            <p className="text-xs text-gray-400">Portal Clínico</p>
                        </div>
                    </div>
                )}

                <div className={`px-4 md:px-8 py-6 ${isMobile ? 'pb-20' : ''}`}>
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
