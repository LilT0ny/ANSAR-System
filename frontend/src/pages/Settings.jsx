import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
    const [clinicName, setClinicName] = useState('Clínica Dental AN-SAR');
    const [email, setEmail] = useState('contacto@ansar.com');

    return (
        <div className="space-y-8">
            {/* Standard Header */}
            <header>
                <h1 className="text-3xl font-serif font-bold text-gray-800">Configuración</h1>
                <p className="text-secondary mt-1">Ajustes generales del sistema.</p>
            </header>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Información de la Clínica</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Clínica</label>
                        <input
                            value={clinicName}
                            onChange={(e) => setClinicName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <button className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
