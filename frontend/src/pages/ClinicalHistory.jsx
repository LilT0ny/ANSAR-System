import React from 'react';

import Odontogram from '../components/Odontogram';
import OrthodonticGallery from '../components/OrthodonticGallery';
import { History, FileText, Save, Camera } from 'lucide-react';

const ClinicalHistory = () => {
    const patientId = "mock-patient-id"; // In real app, get from params

    const handleSave = () => {
        // TODO: Call API to save odontogram
        console.log("Saving odontogram...");
        alert("Odontograma guardado (simulación)");
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-800">Historia Clínica Digital</h1>
                        <p className="text-secondary mt-1">Gestión integral del estado bucal del paciente.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        className="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 shadow-md transition-colors"
                    >
                        <Save size={20} />
                        <span>Guardar Cambios</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Odontogram Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <Odontogram patientId={patientId} />

                        <OrthodonticGallery patientId={patientId} />

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold font-serif mb-4 flex items-center">
                                <FileText className="mr-2 text-primary" size={20} />
                                Notas de Evolución
                            </h3>
                            <textarea
                                className="w-full border border-gray-200 rounded-lg p-4 h-32 text-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                                placeholder="Escribe aquí las notas de la consulta de hoy..."
                            ></textarea>
                        </div>
                    </div>

                    {/* Right Sidebar: History Timeline */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                        <h3 className="text-lg font-bold font-serif mb-6 flex items-center">
                            <History className="mr-2 text-secondary" size={20} />
                            Historial de Tratamientos
                        </h3>

                        <div className="space-y-6 relative ml-2 border-l-2 border-gray-100 pl-6">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm"></div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-bold text-gray-800">Tratamiento de Caries</span>
                                        <span className="text-xs text-gray-400">Hace {i + 1} meses</span>
                                    </div>
                                    <p className="text-sm text-gray-500">pieza #16 tratada con resina compuesta.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicalHistory;
