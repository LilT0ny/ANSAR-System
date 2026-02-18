import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Clock, Calendar, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import 'react-day-picker/style.css';

// ── Mock ortho blocks (would come from backend in production) ──
// Now uses specific dates instead of recurring day-of-week
const ORTHO_BLOCKS = [
    { id: 1, date: '2026-02-23', startTime: '12:00', endTime: '17:00', label: 'Lun 23 Feb – Ortodoncia' },
    { id: 2, date: '2026-02-25', startTime: '09:00', endTime: '12:00', label: 'Mié 25 Feb – Ortodoncia' },
    { id: 3, date: '2026-03-02', startTime: '14:00', endTime: '18:00', label: 'Lun 2 Mar – Ortodoncia' },
];

// ── Mock booked slots (simulates already-taken appointments) ──
const BOOKED_SLOTS = [
    { date: '2026-02-19', time: '09:00' },
    { date: '2026-02-19', time: '10:00' },
    { date: '2026-02-26', time: '15:30' },
];

const SLOT_DURATION = 30; // minutes

function generateTimeSlots(startTime, endTime) {
    const slots = [];
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let current = sh * 60 + sm;
    const end = eh * 60 + em;
    while (current < end) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        current += SLOT_DURATION;
    }
    return slots;
}

const OrthodonticsBooking = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || 'default';

    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(undefined);
    const [selectedTime, setSelectedTime] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [slotTaken, setSlotTaken] = useState(false);

    // Collect the specific dates that have ortho blocks
    const orthoDates = ORTHO_BLOCKS.map(b => b.date);

    // Disable days that don't have ortho blocks and past days
    const isDateDisabled = (date) => {
        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
        const dateStr = format(date, 'yyyy-MM-dd');
        return !orthoDates.includes(dateStr);
    };

    // When a date is selected, generate available time slots
    useEffect(() => {
        if (!selectedDate) { setAvailableSlots([]); return; }
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const blocks = ORTHO_BLOCKS.filter(b => b.date === dateStr);
        let allSlots = [];
        blocks.forEach(block => {
            const slots = generateTimeSlots(block.startTime, block.endTime);
            allSlots = [...allSlots, ...slots];
        });
        // Remove booked slots
        const free = allSlots.filter(slot =>
            !BOOKED_SLOTS.some(bs => bs.date === dateStr && bs.time === slot)
        );
        setAvailableSlots(free);
        setSelectedTime(null);
        setSlotTaken(false);
    }, [selectedDate]);

    // Simulate real-time availability check (CA 5)
    const validateSlot = () => {
        if (!selectedDate || !selectedTime) return false;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const taken = BOOKED_SLOTS.some(bs => bs.date === dateStr && bs.time === selectedTime);
        if (taken) { setSlotTaken(true); return false; }
        setSlotTaken(false);
        return true;
    };

    const handleConfirm = async (e) => {
        e.preventDefault();
        if (!validateSlot()) return;
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setStep(3);
        }, 1800);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[620px] border border-gray-100">

                {/* ── Left Panel ─────────────────────── */}
                <div className="md:w-[300px] shrink-0 bg-ortho text-white p-8 flex flex-col relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-white/5 rounded-full" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck size={22} className="text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Ortodoncia</span>
                        </div>
                        <h2 className="text-2xl font-serif font-bold mt-4 leading-tight">Reserva tu Cita de Ortodoncia</h2>
                        <p className="text-sm text-white/60 mt-3 leading-relaxed">
                            Selecciona entre los horarios exclusivos habilitados para tratamientos de ortodoncia.
                        </p>
                    </div>

                    <div className="mt-10 space-y-5 relative z-10">
                        <div className={clsx("transition-all duration-300", step >= 1 ? "opacity-100" : "opacity-30")}>
                            <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Fecha</p>
                            <p className="font-medium text-sm mt-0.5">
                                {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es }) : '—'}
                            </p>
                        </div>
                        <div className={clsx("transition-all duration-300", step >= 1 && selectedTime ? "opacity-100" : "opacity-30")}>
                            <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Hora</p>
                            <p className="font-medium text-sm mt-0.5">{selectedTime ? `${selectedTime} hrs` : '—'}</p>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-white/10 relative z-10">
                        <p className="text-xs text-white/40">Clínica Dental AN-SAR</p>
                        <p className="text-xs text-white/30 mt-1">Horarios exclusivos para ortodoncia</p>
                    </div>
                </div>

                {/* ── Right Content ───────────────────── */}
                <div className="flex-1 p-8 md:p-10 relative flex flex-col">
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={clsx(
                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                i <= step ? "bg-ortho" : "bg-gray-200"
                            )} />
                        ))}
                    </div>

                    {/* ── Step 1: Date & Time ──────────── */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
                            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-1">Fecha y Hora</h2>
                            <p className="text-sm text-gray-400 mb-6">Solo se muestran horarios exclusivos para ortodoncia.</p>

                            <div className="flex flex-col lg:flex-row gap-8 flex-1">
                                {/* Calendar */}
                                <div className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex justify-center ortho-cal self-start">
                                    <style>{`
                                        .ortho-cal .rdp-root {
                                            --rdp-accent-color: #8CC63E;
                                            --rdp-accent-background-color: rgba(140,198,62,0.08);
                                            --rdp-today-color: #8CC63E;
                                            --rdp-selected-border: 2px solid #8CC63E;
                                            --rdp-day_button-border-radius: 10px;
                                        }
                                        .ortho-cal .rdp-chevron { fill: #8CC63E; }
                                        .ortho-cal .rdp-selected .rdp-day_button {
                                            background-color: #8CC63E;
                                            color: white;
                                            border-color: #8CC63E;
                                        }
                                        .ortho-cal .rdp-today:not(.rdp-selected) .rdp-day_button {
                                            color: #8CC63E; font-weight: 800;
                                        }
                                        .ortho-cal .rdp-day_button:hover {
                                            background-color: rgba(140,198,62,0.08) !important;
                                        }
                                    `}</style>
                                    <DayPicker
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        locale={es}
                                        disabled={isDateDisabled}
                                    />
                                </div>

                                {/* Time Slots - Pill buttons */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Clock size={16} className="text-ortho" />
                                        Horarios Disponibles
                                    </p>
                                    {!selectedDate ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-xl p-4">
                                            <Calendar size={16} />
                                            Selecciona una fecha para ver horarios.
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl p-4">
                                            <AlertCircle size={16} />
                                            No hay horarios disponibles para esta fecha.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {availableSlots.map(time => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() => { setSelectedTime(time); setSlotTaken(false); }}
                                                    className={clsx(
                                                        "py-2.5 px-3 rounded-full text-sm font-semibold transition-all border text-center",
                                                        selectedTime === time
                                                            ? "bg-ortho text-white border-ortho shadow-lg shadow-ortho/20 scale-105"
                                                            : "bg-white text-gray-600 border-ortho/20 hover:border-ortho/50 hover:bg-ortho/5"
                                                    )}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {slotTaken && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3 animate-in fade-in duration-200">
                                            <AlertCircle size={16} />
                                            Este horario acaba de ser tomado. Por favor elige otro.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => { if (validateSlot()) setStep(2); }}
                                    disabled={!selectedDate || !selectedTime}
                                    className="bg-ortho text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-ortho/20 hover:shadow-xl hover:bg-ortho/90 disabled:opacity-40 disabled:shadow-none transition-all flex items-center gap-2"
                                >
                                    Continuar <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Patient Details ─────── */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-serif font-bold text-gray-800">Tus Datos</h2>
                                <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Volver</button>
                            </div>

                            <form onSubmit={handleConfirm} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre Completo *</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ortho/20 focus:border-ortho outline-none transition-all"
                                        placeholder="Tu nombre completo" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono *</label>
                                        <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ortho/20 focus:border-ortho outline-none transition-all"
                                            placeholder="555-1234" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ortho/20 focus:border-ortho outline-none transition-all"
                                            placeholder="correo@email.com" />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button type="submit" disabled={isSubmitting}
                                        className="w-full bg-ortho text-white py-4 rounded-xl font-bold shadow-lg shadow-ortho/20 hover:shadow-xl hover:bg-ortho/90 disabled:opacity-70 transition-all flex justify-center items-center gap-2">
                                        {isSubmitting ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Confirmar Cita de Ortodoncia <CheckCircle size={20} /></>
                                        )}
                                    </button>
                                    <p className="text-xs text-center text-gray-400 mt-4">
                                        Al confirmar, tu cita se sincronizará automáticamente con Google Calendar.
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── Step 3: Success ─────────────── */}
                    {step === 3 && (
                        <div className="animate-in zoom-in duration-300 flex flex-col items-center justify-center flex-1 text-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">¡Cita Confirmada!</h2>
                            <p className="text-gray-500 max-w-md mx-auto mb-2">
                                Tu cita de <span className="font-bold text-ortho">ortodoncia</span> ha sido reservada para:
                            </p>
                            <div className="bg-ortho/5 border border-ortho/10 rounded-2xl p-5 max-w-sm w-full mb-6">
                                <p className="text-lg font-bold text-ortho capitalize">
                                    {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                                </p>
                                <p className="text-2xl font-bold text-ortho mt-1">{selectedTime} hrs</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl max-w-sm w-full mb-8 flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <Calendar size={20} className="text-blue-500" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-blue-800 text-sm">Google Calendar</p>
                                    <p className="text-xs text-blue-600">Sincronizado automáticamente (CA 8)</p>
                                </div>
                            </div>

                            <a href="/" className="text-ortho font-bold hover:underline">Volver al inicio</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrthodonticsBooking;
