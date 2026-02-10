import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Check, User } from 'lucide-react';
import clsx from 'clsx';
// Simulating axios or fetch
// import api from '../utils/api'; 

const BookingWidget = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [details, setDetails] = useState({ name: '', email: '', phone: '', reason: '' });
    const [loading, setLoading] = useState(false);

    // Mock slots
    const timeSlots = ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00'];

    const handleBook = async () => {
        setLoading(true);
        // TODO: Call API
        // await api.post('/public/book', { ...details, date, time });
        setTimeout(() => {
            setLoading(false);
            setStep(4);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <X size={24} />
                </button>

                {/* Header Progress */}
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-serif font-bold text-gray-800">Agendar Cita</h2>
                        <p className="text-sm text-gray-500">Paso {step} de 3</p>
                    </div>
                    <div className="flex space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${step >= i ? 'bg-primary' : 'bg-gray-300'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                            >
                                <h3 className="text-lg font-bold mb-4 flex items-center"><Calendar className="mr-2 text-primary" /> Selecciona una Fecha</h3>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none mb-4"
                                    onChange={(e) => setDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />

                                {date && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-bold text-gray-500 mb-2">Horarios Disponibles</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {timeSlots.map(slot => (
                                                <button
                                                    key={slot}
                                                    onClick={() => setTime(slot)}
                                                    className={clsx(
                                                        "py-2 px-3 rounded-lg text-sm font-medium transition-colors border",
                                                        time === slot ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
                                                    )}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end">
                                    <button
                                        disabled={!date || !time}
                                        onClick={() => setStep(2)}
                                        className="bg-primary disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                            >
                                <h3 className="text-lg font-bold mb-4 flex items-center"><User className="mr-2 text-primary" /> Mis Datos</h3>
                                <div className="space-y-4">
                                    <input placeholder="Nombre Completo" className="w-full p-3 border rounded-lg outline-none focus:border-primary" onChange={e => setDetails({ ...details, name: e.target.value })} />
                                    <input placeholder="Email" type="email" className="w-full p-3 border rounded-lg outline-none focus:border-primary" onChange={e => setDetails({ ...details, email: e.target.value })} />
                                    <input placeholder="Teléfono" type="tel" className="w-full p-3 border rounded-lg outline-none focus:border-primary" onChange={e => setDetails({ ...details, phone: e.target.value })} />
                                    <input placeholder="Motivo de consulta (opcional)" className="w-full p-3 border rounded-lg outline-none focus:border-primary" onChange={e => setDetails({ ...details, reason: e.target.value })} />
                                </div>

                                <div className="mt-8 flex justify-between">
                                    <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-800">Atrás</button>
                                    <button
                                        disabled={!details.name || !details.email}
                                        onClick={handleBook}
                                        className="bg-primary disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium flex items-center"
                                    >
                                        {loading ? 'Procesando...' : 'Confirmar Reserva'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                    <Check size={40} />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">¡Solicitud Recibida!</h3>
                                <p className="text-gray-600 mb-6">
                                    Hemos recibido tu solicitud para el <strong>{date}</strong> a las <strong>{time}</strong>.
                                    <br />Te enviaremos un correo de confirmación en breve.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="bg-gray-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-black transition-colors"
                                >
                                    Volver al sitio
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default BookingWidget;
