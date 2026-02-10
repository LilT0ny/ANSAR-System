import React from 'react';
import { Bell } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Hola, Dra. Ansar</h1>
                    <p className="text-secondary mt-1">Aquí está el resumen de hoy. Tienes <span className="text-primary font-bold">4 citas</span> pendientes.</p>
                </div>

                <div className="flex space-x-4">
                    <button className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm text-secondary hover:text-primary transition-colors">
                        <Bell size={20} />
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
                    </button>
                    <div className="h-10 w-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100" alt="Profile" />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-500 mb-2">Pacientes Hoy</h3>
                    <p className="text-4xl font-bold text-primary">12</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-500 mb-2">Citas Pendientes</h3>
                    <p className="text-4xl font-bold text-blue-500">5</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-500 mb-2">Ingresos del Mes</h3>
                    <p className="text-4xl font-bold text-green-600">$4,500.00</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
