import React, { useState } from 'react';
import { Calendar, Trash2 } from 'lucide-react';

const Appointments = () => {
    // Mock data for appointments
    const appointments = [
        { id: 1, patient: 'Juan Perez', date: '2026-03-01', time: '10:00', status: 'confirmada' },
        { id: 2, patient: 'Maria Gomez', date: '2026-03-02', time: '11:00', status: 'pendiente' },
        { id: 3, patient: 'Pedro Torres', date: '2026-03-02', time: '14:00', status: 'completada' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmada': return 'bg-green-100 text-green-600';
            case 'pendiente': return 'bg-yellow-100 text-yellow-600';
            case 'completada': return 'bg-blue-100 text-blue-600';
            case 'cancelada': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-800">Agenda de Citas</h1>
                <p className="text-secondary mt-1">Gestión de turnos y disponibilidades.</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                        <tr>
                            <th className="px-6 py-4">Paciente</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Hora</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {appointments.map((appt) => (
                            <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-800">{appt.patient}</td>
                                <td className="px-6 py-4 text-gray-600">{appt.date}</td>
                                <td className="px-6 py-4 text-gray-600 font-medium">{appt.time}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(appt.status)}`}>
                                        {appt.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex justify-center space-x-3">
                                    <button className="text-red-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Appointments;
