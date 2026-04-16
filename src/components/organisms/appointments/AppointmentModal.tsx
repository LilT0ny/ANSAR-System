import React, { useState, useEffect } from 'react';
import { X, CheckCircle, MessageCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { appointmentsAPI } from '../../../services/api';

const AppointmentModal = ({
    isOpen,
    onClose,
    onSuccess,
    apiPatients,
    timeOptions,
    initialDate,
    toast
}) => {
    const [newEvent, setNewEvent] = useState({
        patient: '',
        patientId: null,
        patientPhone: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        start: '09:00',
        end: '10:00',
        type: 'general',
        reason: '',
        status: 'pendiente',
        sendWhatsApp: true,
    });
    const [patientSearch, setPatientSearch] = useState('');
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);

    // Reset date when initialDate changes
    useEffect(() => {
        if (isOpen && initialDate) {
            setNewEvent(prev => ({
                ...prev,
                date: format(initialDate, 'yyyy-MM-dd'),
                patient: '',
                patientId: null,
                reason: '',
                start: '09:00',
                end: '10:00'
            }));
            setPatientSearch('');
        }
    }, [isOpen, initialDate]);

    const filteredPatients = apiPatients.filter(p =>
        `${p.name} ${p.docId}`.toLowerCase().includes(patientSearch.toLowerCase())
    );

    const handleCreateEvent = async () => {
        if (!newEvent.patient || !newEvent.date || !newEvent.start || !newEvent.end || !newEvent.reason) {
            toast('Completa todos los campos requeridos.');
            return;
        }
        if (newEvent.start >= newEvent.end) {
            toast('La hora de inicio debe ser antes de la hora de fin.');
            return;
        }

        try {
            await appointmentsAPI.create({
                patient_id: newEvent.patientId,
                date: newEvent.date,
                start_time: newEvent.start,
                end_time: newEvent.end,
                reason: newEvent.reason,
                type: newEvent.type,
                status: 'pendiente'
            });

            // Send WhatsApp notification
            if (newEvent.sendWhatsApp && newEvent.patientPhone) {
                const phone = newEvent.patientPhone.replace(/\D/g, '');
                const dateFormatted = format(parseISO(newEvent.date), "d 'de' MMMM", { locale: es });
                const message = encodeURIComponent(
                    `Hola ${newEvent.patient.split(' ')[0]}, te informamos que tienes una cita programada el ${dateFormatted} a las ${newEvent.start}. Por favor arrives 10 minutos antes. ¡Te esperamos!`
                );
                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
            }

            onSuccess();
            toast('Cita programada con éxito');
            onClose();
        } catch (err) {
            console.error('Error creating appointment:', err);
            toast('Error al programar la cita. Verifica disponibilidad.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Nueva Cita</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Paciente</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar paciente por nombre o documento..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                value={newEvent.patient || patientSearch}
                                onChange={(e) => {
                                    setPatientSearch(e.target.value);
                                    setNewEvent(prev => ({ ...prev, patient: '', patientId: null }));
                                    setShowPatientDropdown(true);
                                }}
                            />
                            {showPatientDropdown && !newEvent.patient && (
                                <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                                    {filteredPatients.length > 0 ? filteredPatients.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setNewEvent(prev => ({ ...prev, patient: p.name, patientId: p.id, patientPhone: p.phone || '' }));
                                                setShowPatientDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-primary/5 border-b border-gray-50 last:border-0 text-sm"
                                        >
                                            <span className="font-bold text-gray-800">{p.name}</span>
                                            {p.docId && <span className="text-gray-400 text-xs ml-2">({p.docId})</span>}
                                        </button>
                                    )) : (
                                        <div className="px-4 py-2 text-sm text-gray-500 italic">No se encontraron pacientes</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Servicio a Realizar</label>
                        <input
                            type="text"
                            placeholder="Ej: Limpieza, Empaste, Extracción, Ortodoncia..."
                            value={newEvent.reason}
                            onChange={e => setNewEvent({ ...newEvent, reason: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Hora Inicio</label>
                            <select
                                value={newEvent.start}
                                onChange={e => setNewEvent({ ...newEvent, start: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                            >
                                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Hora Fin</label>
                            <select
                                value={newEvent.end}
                                onChange={e => setNewEvent({ ...newEvent, end: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                            >
                                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                        <input
                            type="checkbox"
                            checked={newEvent.sendWhatsApp}
                            onChange={(e) => setNewEvent({ ...newEvent, sendWhatsApp: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <MessageCircle size={16} className="text-green-500" />
                        Enviar Recordatorio por WhatsApp
                    </label>
                    <button
                        onClick={handleCreateEvent}
                        className="w-full bg-primary hover:bg-green-600 text-white py-3 rounded-xl font-bold mt-4 shadow-lg transition-colors"
                    >
                        Crear Cita
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentModal;
