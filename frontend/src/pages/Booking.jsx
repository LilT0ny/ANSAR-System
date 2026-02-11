import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Calendar, Clock, User, ChevronRight, ChevronLeft, CalendarCheck } from 'lucide-react';
import { clsx } from 'clsx';
import 'react-day-picker/style.css';

const services = [
    { id: 1, name: 'Consulta General', price: '$50', duration: '30 min', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 2, name: 'Limpieza Dental', price: '$80', duration: '45 min', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: 3, name: 'Blanqueamiento', price: '$200', duration: '60 min', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 4, name: 'Ortodoncia', price: '$100', duration: '30 min', color: 'bg-orange-100 text-orange-700 border-orange-200' },
];

const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:45',
    '14:00', '14:30', '15:15', '16:00', '16:30', '17:00'
];

const Booking = () => {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(undefined);
    const [selectedTime, setSelectedTime] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', reason: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call and Google Calendar Integration (UH 3)
        setTimeout(() => {
            setIsSubmitting(false);
            setStep(4);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Sidebar Summary */}
                <div className="bg-primary/5 md:w-1/3 p-8 border-r border-gray-100 flex flex-col">
                    <div className="mb-8">
                        <h2 className="text-2xl font-serif font-bold text-gray-800">Tu Cita</h2>
                        <p className="text-sm text-gray-500 mt-2">Clínica Dental OdontoPremium</p>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className={clsx("transition-opacity duration-300", step >= 1 ? "opacity-100" : "opacity-30")}>
                            <p className="text-xs uppercase font-bold text-gray-400 mb-1">Servicio</p>
                            <div className="font-medium text-gray-800 flex items-center gap-2">
                                <span className={clsx("w-2 h-2 rounded-full", selectedService ? "bg-green-500" : "bg-gray-300")} />
                                {selectedService?.name || 'Selecciona un servicio'}
                            </div>
                        </div>

                        <div className={clsx("transition-opacity duration-300", step >= 2 ? "opacity-100" : "opacity-30")}>
                            <p className="text-xs uppercase font-bold text-gray-400 mb-1">Fecha y Hora</p>
                            <div className="font-medium text-gray-800">
                                {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : 'Selecciona fecha'}
                            </div>
                            <div className="font-medium text-gray-800 text-sm mt-1">
                                {selectedTime ? `${selectedTime} hrs` : '--:--'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Total Estimado</span>
                            <span className="text-xl font-bold text-primary">{selectedService?.price || '$0'}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 md:p-12 relative">
                    {/* Steps Indicator */}
                    <div className="flex items-center space-x-2 mb-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={clsx("h-1 flex-1 rounded-full transition-all duration-300", i <= step ? "bg-primary" : "bg-gray-200")} />
                        ))}
                    </div>

                    {/* Step 1: Services */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 font-serif">Selecciona tu Tratamiento</h2>
                            <div className="grid gap-4">
                                {services.map((service) => (
                                    <button
                                        key={service.id}
                                        onClick={() => { setSelectedService(service); handleNext(); }}
                                        className="text-left w-full p-4 rounded-xl border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all group flex items-center justify-between bg-white"
                                    >
                                        <div>
                                            <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors">{service.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{service.duration} • Especialista Dr. Martínez</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-gray-800">{service.price}</span>
                                            <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Seleccionar</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Date & Time */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 font-serif">Fecha y Hora</h2>
                                <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-800">Cambiar servicio</button>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-8 flex-1">
                                <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex justify-center">
                                    <style>{`.rdp-day_selected { background-color: var(--color-primary) !important; color: white !important; } .rdp-button:hover:not([disabled]) { background-color: #f3f4f6; }`}</style>
                                    <DayPicker
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        locale={es}
                                        disabled={{ before: new Date() }}
                                        className="rdp-custom"
                                    />
                                </div>

                                <div className="flex-1">
                                    <p className="font-medium text-gray-700 mb-3">Horarios Disponibles</p>
                                    <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {timeSlots.map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                disabled={!selectedDate}
                                                className={clsx(
                                                    "py-2 px-4 rounded-lg text-sm font-medium transition-all border",
                                                    selectedTime === time
                                                        ? "bg-primary text-white border-primary shadow-md transform scale-105"
                                                        : "bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:bg-gray-50",
                                                    !selectedDate && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                    {!selectedDate && <p className="text-xs text-red-400 mt-2">Por favor selecciona una fecha primero.</p>}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={!selectedDate || !selectedTime}
                                    className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:bg-green-600 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                                >
                                    Continuar <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 font-serif">Tus Datos</h2>
                                <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-800">Volver</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            required
                                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                        <input
                                            required type="tel"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="555-1234"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            required type="email"
                                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder="juan@email.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de consulta (Opcional)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Descripción breve..."
                                    />
                                </div>

                                <div className="mt-8 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:bg-green-600 disabled:opacity-70 transition-all flex justify-center items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Confirmar HORA <CalendarCheck size={20} /></>
                                        )}
                                    </button>
                                    <p className="text-xs text-center text-gray-400 mt-4">
                                        Al confirmar, aceptas nuestras políticas de privacidad y cancelación (24h antes).
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="animate-in zoom-in duration-300 flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">¡Reserva Confirmada!</h2>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                Hemos enviado un correo a <span className="font-bold text-gray-700">{formData.email}</span> con los detalles.
                            </p>

                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl max-w-sm w-full mb-8 flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4Z" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M16 2V6" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8 2V6" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M4 10H20" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-blue-800 text-sm">Google Calendar</p>
                                    <p className="text-xs text-blue-600">Tu cita ha sido agendada automáticamente (UH 3)</p>
                                </div>
                            </div>

                            <a href="/" className="text-primary font-bold hover:underline">Volver al inicio</a>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Booking;
