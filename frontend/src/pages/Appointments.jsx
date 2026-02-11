import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon, Trash2, CheckCircle, XCircle,
    ChevronLeft, ChevronRight, Clock, Plus, Filter, MoreVertical
} from 'lucide-react';
import {
    format, addDays, subDays, isSameDay, parseISO, startOfWeek,
    endOfWeek, eachDayOfInterval, setHours, setMinutes, differenceInMinutes,
    addWeeks, subWeeks, isSameMonth
} from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { clsx } from 'clsx';

const Appointments = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());

    // Effect to update current time line
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Mock data for appointments (Weekly structure)
    const [appointments, setAppointments] = useState([
        { id: 1, patient: 'Juan Pérez', date: '2026-02-11', start: '10:00', end: '11:00', type: 'Consulta General', status: 'confirmada' },
        { id: 2, patient: 'María Gómez', date: '2026-02-11', start: '11:30', end: '12:15', type: 'Limpieza', status: 'llegó' },
        { id: 3, patient: 'Pedro Torres', date: '2026-02-11', start: '14:00', end: '15:30', type: 'Ortodoncia', status: 'pendiente' },
        { id: 4, patient: 'Ana Silva', date: '2026-02-12', start: '09:00', end: '10:00', type: 'Blanqueamiento', status: 'confirmada' },
        { id: 5, patient: 'Carlos Ruiz', date: '2026-02-13', start: '16:00', end: '17:00', type: 'Consulta General', status: 'completada' },
    ]);

    const START_HOUR = 7;
    const END_HOUR = 19; // 7 PM
    const TIME_SLOTS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

    // Get week days
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday start
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'confirmada': return 'bg-blue-100 border-l-4 border-blue-500 text-blue-700';
            case 'pendiente': return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700';
            case 'completada': return 'bg-gray-100 border-l-4 border-gray-500 text-gray-700';
            case 'llegó': return 'bg-green-100 border-l-4 border-green-500 text-green-700';
            case 'no_llegó': return 'bg-red-100 border-l-4 border-red-500 text-red-700';
            default: return 'bg-gray-100 border-l-4 border-gray-400 text-gray-600';
        }
    };

    const handleAttendance = (id, status) => {
        setAppointments(appointments.map(appt =>
            appt.id === id ? { ...appt, status } : appt
        ));
    };

    const getPositionStyle = (start, end) => {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);

        const startMinutes = (startH - START_HOUR) * 60 + startM;
        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

        return {
            top: `${(startMinutes / 60) * 64}px`, // 64px per hour height
            height: `${(durationMinutes / 60) * 64}px`,
        };
    };

    return (
        <div className="flex bg-white h-screen overflow-hidden">
            {/* Sidebar (Mini Calendar & Filters) */}
            <aside className="w-64 border-r border-gray-200 p-4 flex flex-col hidden md:flex bg-gray-50">
                <button className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-full font-medium shadow-sm flex items-center gap-2 mb-6 transition-all hover:shadow-md">
                    <Plus className="text-primary w-6 h-6" />
                    <span className="text-sm">Crear</span>
                </button>

                <div className="mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <style>{`.rdp-day_selected { background-color: var(--color-primary, #8CC63E) !important; color: white !important; }`}</style>
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        locale={es}
                        styles={{ caption: { color: '#6D6E72' } }}
                    />
                </div>

                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center justify-between">
                        Mis Calendarios <ChevronLeft className="rotate-270 w-4 h-4 cursor-pointer" />
                    </h3>
                    <div className="space-y-2">
                        {['Dra. Ansar', 'Higiene', 'Ortodoncia'].map((cal, i) => (
                            <label key={i} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors">
                                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary accent-primary w-4 h-4" />
                                <span>{cal}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Calendar View */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-6">
                        <h1 className="text-2xl font-serif font-bold text-gray-800 hidden lg:block">Agenda</h1>
                        <button
                            onClick={() => setSelectedDate(new Date())}
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 bg-white"
                        >
                            Hoy
                        </button>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedDate(subWeeks(selectedDate, 1))} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setSelectedDate(addWeeks(selectedDate, 1))} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <h2 className="text-xl font-medium text-gray-700 capitalize">
                            {format(selectedDate, "MMMM yyyy", { locale: es })}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <select className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none">
                            <option>Semana</option>
                            <option>Día</option>
                            <option>Mes</option>
                        </select>
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                            DA
                        </div>
                    </div>
                </header>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-y-auto relative bg-white flex flex-col">
                    {/* Days Header */}
                    <div className="flex border-b border-gray-200 min-h-[50px] sticky top-0 bg-white z-20">
                        <div className="w-16 border-r border-gray-100 shrink-0"></div> {/* Time axis spacer */}
                        {weekDays.map((day, i) => {
                            const isToday = isSameDay(day, new Date());
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-center border-r border-gray-100 py-2">
                                    <span className={clsx("text-xs font-semibold uppercase mb-1", isToday ? "text-primary" : "text-gray-500")}>
                                        {format(day, 'EEE', { locale: es })}
                                    </span>
                                    <span className={clsx(
                                        "w-8 h-8 flex items-center justify-center rounded-full text-lg",
                                        isToday ? "bg-primary text-white font-bold shadow-md" : "text-gray-700 hover:bg-gray-100"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Scrollable Time Grid */}
                    <div className="flex-1 relative min-h-[800px]"> {/* Ensure enough height for scrolling */}
                        {/* Time Slots Background */}
                        <div className="absolute inset-0 flex">
                            <div className="w-16 border-r border-gray-100 shrink-0 bg-white z-10 text-xs text-gray-400 font-medium text-right pr-2 pt-2 select-none">
                                {TIME_SLOTS.map(hour => (
                                    <div key={hour} className="h-16 -mt-3"> {/* Negative margin to align label with line */}
                                        {hour}:00
                                    </div>
                                ))}
                            </div>
                            {weekDays.map((_, i) => (
                                <div key={i} className="flex-1 border-r border-gray-100 relative">
                                    {TIME_SLOTS.map(hour => (
                                        <div key={hour} className="h-16 border-b border-gray-50"></div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Events Overlay */}
                        <div className="absolute inset-0 flex ml-16"> {/* Offset by time column width */}
                            {weekDays.map((day, dayIndex) => {
                                const dayAppointments = appointments.filter(appt => isSameDay(parseISO(appt.date), day));

                                return (
                                    <div key={dayIndex} className="flex-1 relative">
                                        {/* Current Time Indicator Red Line */}
                                        {isSameDay(day, new Date()) && (
                                            <div
                                                className="absolute w-full border-t-2 border-red-500 z-30 pointer-events-none flex items-center"
                                                style={{ top: `${((currentTime.getHours() - START_HOUR) * 60 + currentTime.getMinutes()) / 60 * 64}px` }}
                                            >
                                                <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 shadow-sm"></div>
                                            </div>
                                        )}

                                        {dayAppointments.map(appt => (
                                            <div
                                                key={appt.id}
                                                className={clsx(
                                                    "absolute left-1 right-2 rounded-md p-2 text-xs shadow-sm cursor-pointer transition-all hover:shadow-md hover:z-20 group overflow-hidden border border-gray-200/50",
                                                    getStatusStyles(appt.status) // Fixed typo in function call
                                                )}
                                                style={getPositionStyle(appt.start, appt.end)}
                                            >
                                                <div className="font-bold truncate">{appt.type}</div>
                                                <div className="truncate text-[10px] opacity-90">{appt.start} - {appt.end}</div>
                                                <div className="mt-1 font-medium truncate">{appt.patient}</div>

                                                {/* Hover Actions */}
                                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 bg-white/80 rounded-full p-0.5 backdrop-blur-sm transition-opacity">
                                                    {['llegó', 'no_llegó'].includes(appt.status) ? null : (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleAttendance(appt.id, 'llegó'); }}
                                                                title="Llegó"
                                                                className="text-green-600 hover:bg-green-100 p-1 rounded-full"
                                                            >
                                                                <CheckCircle size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleAttendance(appt.id, 'no_llegó'); }}
                                                                title="No Llegó"
                                                                className="text-red-500 hover:bg-red-100 p-1 rounded-full"
                                                            >
                                                                <XCircle size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        className="text-gray-500 hover:bg-gray-200 p-1 rounded-full"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreVertical size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Appointments;
