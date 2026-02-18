import React, { useState, useEffect, useRef } from 'react';
import {
    Calendar as CalendarIcon, CheckCircle, XCircle,
    ChevronLeft, ChevronRight, Clock, Plus, X, User,
    MoreVertical, AlertCircle, Settings, Link2, Copy,
    Trash2, ShieldCheck
} from 'lucide-react';
import {
    format, isSameDay, parseISO, startOfWeek,
    endOfWeek, eachDayOfInterval,
    addWeeks, subWeeks
} from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { clsx } from 'clsx';

// ── Treatment Types ───────────────────────────────────────────
const TREATMENT_TYPES = [
    'Consulta General',
    'Limpieza',
    'Ortodoncia',
    'Blanqueamiento',
    'Extracción',
    'Endodoncia',
    'Resina',
    'Radiografía',
    'Control',
];

// ── Mock Patients ─────────────────────────────────────────────
const MOCK_PATIENTS = [
    { id: 1, name: 'Juan Pérez', docId: '12345678' },
    { id: 2, name: 'María Gómez', docId: '87654321' },
    { id: 3, name: 'Pedro Torres', docId: '11223344' },
    { id: 4, name: 'Ana Silva', docId: '55667788' },
    { id: 5, name: 'Carlos Ruiz', docId: '99001122' },
];



// ── Component ─────────────────────────────────────────────────
const Appointments = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const scrollRef = useRef(null);

    // ── Ortho Block Management ────────────────────────────────
    const [showOrthoPanel, setShowOrthoPanel] = useState(false);
    const [orthoBlocks, setOrthoBlocks] = useState([
        { id: 1, date: '2026-02-23', startTime: '12:00', endTime: '17:00', label: 'Lun 23 Feb – Ortodoncia' },
    ]);
    const [newBlock, setNewBlock] = useState({ date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '12:00' });
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    // New event form
    const [newEvent, setNewEvent] = useState({
        patient: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        start: '09:00',
        end: '10:00',
        type: 'Consulta General',
        status: 'pendiente',
    });
    const [patientSearch, setPatientSearch] = useState('');
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);

    // Clock update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Auto-scroll to 7 AM on mount
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0; // 7AM is the start
        }
    }, []);

    // Mock appointments
    const [appointments, setAppointments] = useState([
        { id: 1, patient: 'Juan Pérez', date: '2026-02-11', start: '10:00', end: '11:00', type: 'Consulta General', status: 'confirmada' },
        { id: 2, patient: 'María Gómez', date: '2026-02-11', start: '11:30', end: '12:15', type: 'Limpieza', status: 'llegó' },
        { id: 3, patient: 'Pedro Torres', date: '2026-02-11', start: '14:00', end: '15:30', type: 'Ortodoncia', status: 'pendiente' },
        { id: 4, patient: 'Ana Silva', date: '2026-02-12', start: '09:00', end: '10:00', type: 'Blanqueamiento', status: 'confirmada' },
        { id: 5, patient: 'Carlos Ruiz', date: '2026-02-13', start: '16:00', end: '17:00', type: 'Consulta General', status: 'completada' },
    ]);

    const START_HOUR = 8;
    const END_HOUR = 19; // 9 PM — full day
    const HOUR_HEIGHT = 64; // px per hour
    const TIME_SLOTS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

    // Week days
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // ── Status styles (using system green) ────────────────────
    const getStatusStyles = (status) => {
        switch (status) {
            case 'confirmada': return 'bg-primary/10 border-l-4 border-primary text-green-800';
            case 'pendiente': return 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800';
            case 'completada': return 'bg-gray-100 border-l-4 border-gray-400 text-gray-600';
            case 'llegó': return 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800';
            case 'no_llegó': return 'bg-red-50 border-l-4 border-red-400 text-red-700';
            default: return 'bg-gray-50 border-l-4 border-gray-300 text-gray-600';
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
            top: `${(startMinutes / 60) * HOUR_HEIGHT}px`,
            height: `${Math.max((durationMinutes / 60) * HOUR_HEIGHT, 28)}px`,
        };
    };

    const toast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // ── Create Event Handler ──────────────────────────────────
    const handleCreateEvent = () => {
        if (!newEvent.patient || !newEvent.date || !newEvent.start || !newEvent.end) {
            toast('Completa todos los campos requeridos.');
            return;
        }
        // Validate start < end
        if (newEvent.start >= newEvent.end) {
            toast('La hora de inicio debe ser antes de la hora de fin.');
            return;
        }
        const event = {
            ...newEvent,
            id: Date.now(),
        };
        setAppointments([...appointments, event]);
        setShowCreateModal(false);
        setNewEvent({
            patient: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            start: '09:00',
            end: '10:00',
            type: 'Consulta General',
            status: 'pendiente',
        });
        setPatientSearch('');
        toast('Cita creada exitosamente.');
    };

    // ── Ortho Block Handlers ──────────────────────────────────
    const handleAddOrthoBlock = () => {
        if (!newBlock.date) {
            toast('Selecciona una fecha.');
            return;
        }
        // Don't allow past dates
        const blockDate = parseISO(newBlock.date);
        if (blockDate < new Date(new Date().setHours(0, 0, 0, 0))) {
            toast('No se puede crear un bloque en una fecha pasada.');
            return;
        }
        if (newBlock.startTime >= newBlock.endTime) {
            toast('La hora de inicio debe ser antes de la hora de fin.');
            return;
        }
        // Check for duplicate or overlapping blocks on the same date
        const isDuplicate = orthoBlocks.some(b => {
            if (b.date !== newBlock.date) return false;
            return newBlock.startTime < b.endTime && newBlock.endTime > b.startTime;
        });
        if (isDuplicate) {
            toast('Ya existe un bloque en esa fecha y horario. No se puede repetir.');
            return;
        }
        const dateLabel = format(blockDate, "EEE d MMM", { locale: es });
        const block = {
            ...newBlock,
            id: Date.now(),
            label: `${dateLabel} – Ortodoncia`,
        };
        setOrthoBlocks([...orthoBlocks, block]);
        toast('Bloque de ortodoncia creado.');
    };

    const handleRemoveOrthoBlock = (id) => {
        setOrthoBlocks(orthoBlocks.filter(b => b.id !== id));
        toast('Bloque eliminado.');
    };

    const orthoBookingLink = `${window.location.origin}/reservar/ortodoncia?token=${btoa('ortho-' + Date.now()).slice(0, 12)}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(orthoBookingLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
    };

    // Check if an appointment is in an ortho block
    const isOrthoAppointment = (appt) => appt.type === 'Ortodoncia';

    // Check if a weekday column has ortho blocks for background highlight
    const getOrthoBlocksForDay = (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return orthoBlocks.filter(b => b.date === dateStr);
    };

    // Filtered patients for the dropdown
    const filteredPatients = MOCK_PATIENTS.filter(p =>
        `${p.name} ${p.docId}`.toLowerCase().includes(patientSearch.toLowerCase())
    );

    // Dates with appointments for mini-calendar dots
    const appointmentDates = appointments.map(a => parseISO(a.date));

    // ── Generate time options for selects ──────────────────────
    const timeOptions = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
        timeOptions.push(`${String(h).padStart(2, '0')}:00`);
        if (h < END_HOUR) timeOptions.push(`${String(h).padStart(2, '0')}:30`);
    }

    return (
        <div className="space-y-6">
            {/* ── Standard Page Header ────────────────────────────── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">Agenda de Citas</h1>
                    <p className="text-secondary mt-1">Administra las citas y horarios de la clínica.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowOrthoPanel(!showOrthoPanel)}
                        className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-all border-2"
                        style={showOrthoPanel
                            ? { backgroundColor: '#8CC63E', color: '#fff', borderColor: '#8CC63E', boxShadow: '0 4px 14px rgba(140,198,62,0.35)' }
                            : { color: '#6aad2d', borderColor: 'rgba(140,198,62,0.4)', backgroundColor: 'transparent' }
                        }
                        onMouseEnter={e => { if (!showOrthoPanel) e.currentTarget.style.backgroundColor = 'rgba(140,198,62,0.06)'; }}
                        onMouseLeave={e => { if (!showOrthoPanel) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <ShieldCheck size={16} />
                        Ortodoncia
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setNewEvent(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
                            setShowCreateModal(true);
                        }}
                        className="bg-primary hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus size={18} />
                        Nueva Cita
                    </button>
                </div>
            </header>

            {/* ── Ortho Config Panel (CA 1, 2, 3) ─────────────────── */}
            {showOrthoPanel && (
                <div className="rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-300" style={{ backgroundColor: 'rgba(140,198,62,0.04)', border: '2px solid rgba(140,198,62,0.2)' }}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(140,198,62,0.12)' }}>
                                <ShieldCheck style={{ color: '#8CC63E' }} size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-serif font-bold text-gray-800">Bloques de Ortodoncia</h3>
                                <p className="text-xs text-gray-400">Define fechas y horarios exclusivos para ortodoncia</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setShowOrthoPanel(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Add new block */}
                    <div className="flex flex-wrap items-end gap-3 mb-5 bg-white rounded-xl p-4 border border-gray-100">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Fecha</label>
                            <input
                                type="date"
                                value={newBlock.date}
                                onChange={e => setNewBlock({ ...newBlock, date: e.target.value })}
                                min={format(new Date(), 'yyyy-MM-dd')}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Hora Inicio</label>
                            <select value={newBlock.startTime} onChange={e => setNewBlock({ ...newBlock, startTime: e.target.value })}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Hora Fin</label>
                            <select value={newBlock.endTime} onChange={e => setNewBlock({ ...newBlock, endTime: e.target.value })}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <button type="button" onClick={handleAddOrthoBlock}
                            className="text-white px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md hover:opacity-90"
                            style={{ backgroundColor: '#8CC63E' }}>
                            <Plus size={16} /> Agregar Bloque
                        </button>
                    </div>

                    {/* Active blocks list */}
                    {orthoBlocks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No hay bloques de ortodoncia configurados.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {orthoBlocks.map(block => (
                                <div key={block.id} className="bg-white rounded-xl p-4 flex items-center justify-between group transition-all" style={{ border: '2px solid rgba(140,198,62,0.2)' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(140,198,62,0.5)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(140,198,62,0.2)'}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(140,198,62,0.12)' }}>
                                            <CalendarIcon style={{ color: '#8CC63E' }} size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 capitalize">
                                                {format(parseISO(block.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                            </p>
                                            <p className="text-xs text-gray-400">{block.startTime} – {block.endTime}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveOrthoBlock(block.id)}
                                        className="text-gray-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Calendar Layout ─────────────────────────────────── */}
            <div className="flex gap-6">

                {/* ── LEFT: Mini Calendar ─────────────────────────── */}
                <aside className="hidden lg:block w-[240px] shrink-0 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mini-cal uppercase">
                        <style>{`
                            /* ── react-day-picker v9 overrides ── */
                            .mini-cal .rdp-root {
                                --rdp-accent-color: #8CC63E;
                                --rdp-accent-background-color: #8CC63E15;
                                --rdp-today-color: #8CC63E;
                                --rdp-selected-border: 2px solid #8CC63E;
                                --rdp-day-width: 32px;
                                --rdp-day-height: 32px;
                                --rdp-day_button-width: 30px;
                                --rdp-day_button-height: 30px;
                                --rdp-day_button-border-radius: 10px;
                                --rdp-nav_button-width: 28px;
                                --rdp-nav_button-height: 28px;
                                --rdp-nav-height: 36px;
                                font-size: 0.8rem;
                                width: 100%;
                            }
                            .mini-cal .rdp-months { max-width: 100%; }
                            .mini-cal .rdp-month { width: 100%; }
                            .mini-cal .rdp-month_grid { width: 100%; }
                            .mini-cal .rdp-month_caption {
                                font-family: 'Montserrat', sans-serif;
                                font-size: 0.85rem;
                                height: 36px;
                            }
                            .mini-cal .rdp-chevron { fill: #8CC63E; }
                            .mini-cal .rdp-weekday {
                                font-size: 0.65rem;
                                font-weight: 700;
                                color: #9CA3AF;
                                padding: 4px 0;
                            }
                            .mini-cal .rdp-selected .rdp-day_button {
                                background-color: #8CC63E;
                                color: white !important;
                                border-color: #8CC63E;
                                border-radius: 10px;
                            }
                            .mini-cal .rdp-selected .rdp-day_button:hover {
                                background-color: #7ab832 !important;
                                color: white !important;
                            }
                            .mini-cal .rdp-today:not(.rdp-selected) .rdp-day_button {
                                color: #8CC63E;
                                font-weight: 800;
                            }
                            .mini-cal .rdp-day_button:hover {
                                background-color: rgba(140, 198, 62, 0.08) !important;
                                border-radius: 10px;
                                color: inherit;
                            }
                            .mini-cal .rdp-focusable { cursor: pointer; }
                        `}</style>
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            locale={es}
                            weekStartsOn={1}
                        />
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <h3 className="text-sm font-serif font-bold text-gray-700 mb-3 uppercase">Resumen del Día</h3>
                        {(() => {
                            const todayAppts = appointments.filter(a => isSameDay(parseISO(a.date), selectedDate));
                            const confirmed = todayAppts.filter(a => a.status === 'confirmada').length;
                            const pending = todayAppts.filter(a => a.status === 'pendiente').length;
                            const arrived = todayAppts.filter(a => a.status === 'llegó').length;
                            return (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Total citas</span>
                                        <span className="font-bold text-gray-800">{todayAppts.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Confirmadas</span>
                                        <span className="font-bold text-primary">{confirmed}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Pendientes</span>
                                        <span className="font-bold text-yellow-600">{pending}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Atendidos</span>
                                        <span className="font-bold text-emerald-600">{arrived}</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </aside>

                {/* ── RIGHT: Weekly Calendar Grid ─────────────────── */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ minHeight: '70vh' }}>

                    {/* Calendar Toolbar */}
                    <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setSelectedDate(new Date())}
                                className="bg-primary hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-all shadow-md hover:shadow-lg"
                            >
                                Hoy
                            </button>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
                                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
                                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                            <h2 className="text-lg font-serif font-bold text-gray-800 capitalize">
                                {format(selectedDate, "MMMM yyyy", { locale: es })}
                            </h2>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                            Vista Semanal
                        </span>
                    </div>

                    {/* Days Header Row */}
                    <div className="flex border-b border-gray-100 shrink-0 bg-gray-50/50">
                        <div className="w-16 shrink-0 border-r border-gray-100"></div>
                        {weekDays.map((day, i) => {
                            const isToday = isSameDay(day, new Date());
                            const isSelected = isSameDay(day, selectedDate);
                            const dayApptCount = appointments.filter(a => isSameDay(parseISO(a.date), day)).length;
                            return (
                                <div
                                    key={i}
                                    className="flex-1 flex flex-col items-center justify-center border-r border-gray-100 py-3 cursor-pointer hover:bg-primary/5 transition-colors"
                                    onClick={() => setSelectedDate(day)}
                                >
                                    <span className={clsx(
                                        "text-[10px] font-bold uppercase tracking-wider mb-1",
                                        isToday ? "text-primary" : "text-gray-400"
                                    )}>
                                        {format(day, 'EEE', { locale: es })}
                                    </span>
                                    <span className={clsx(
                                        "w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all",
                                        isToday
                                            ? "bg-primary text-white shadow-md"
                                            : isSelected
                                                ? "bg-primary/10 text-primary"
                                                : "text-gray-700 hover:bg-gray-100"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayApptCount > 0 && (
                                        <div className="flex gap-0.5 mt-1">
                                            {Array.from({ length: Math.min(dayApptCount, 3) }).map((_, j) => (
                                                <div key={j} className="w-1 h-1 rounded-full bg-primary"></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Scrollable Time Grid */}
                    <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                        <div className="relative" style={{ height: `${TIME_SLOTS.length * HOUR_HEIGHT}px` }}>
                            {/* Time axis + grid lines */}
                            <div className="absolute inset-0 flex">
                                <div className="w-16 border-r border-gray-100 shrink-0 bg-white z-10 select-none">
                                    {TIME_SLOTS.map(hour => (
                                        <div key={hour} className="h-16 flex items-start justify-end pr-3 -mt-2">
                                            <span className="text-[11px] font-semibold text-gray-400 tabular-nums">
                                                {String(hour).padStart(2, '0')}:00
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {weekDays.map((day, i) => {
                                    const dayOrthoBlocks = getOrthoBlocksForDay(day);
                                    return (
                                        <div key={i} className="flex-1 border-r border-gray-100 relative">
                                            {/* Ortho block background bands (CA 3) */}
                                            {dayOrthoBlocks.map(block => {
                                                const [sh, sm] = block.startTime.split(':').map(Number);
                                                const [eh, em] = block.endTime.split(':').map(Number);
                                                const topPx = ((sh - START_HOUR) * 60 + sm) / 60 * HOUR_HEIGHT;
                                                const heightPx = ((eh * 60 + em) - (sh * 60 + sm)) / 60 * HOUR_HEIGHT;
                                                return (
                                                    <div key={block.id} className="absolute left-0 right-0 z-0 pointer-events-none"
                                                        style={{ top: `${topPx}px`, height: `${heightPx}px`, backgroundColor: 'rgba(140,198,62,0.06)', borderLeft: '2px solid rgba(140,198,62,0.25)' }} />
                                                );
                                            })}
                                            {TIME_SLOTS.map(hour => (
                                                <div key={hour} className="h-16 border-b border-gray-50 relative">
                                                    <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-100/80"></div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Events Overlay */}
                            <div className="absolute inset-0 flex ml-16">
                                {weekDays.map((day, dayIndex) => {
                                    const dayAppointments = appointments.filter(appt => isSameDay(parseISO(appt.date), day));
                                    return (
                                        <div key={dayIndex} className="flex-1 relative">
                                            {/* Current Time Red Line */}
                                            {isSameDay(day, new Date()) && (
                                                <div
                                                    className="absolute w-full border-t-2 border-red-500 z-30 pointer-events-none flex items-center"
                                                    style={{ top: `${((currentTime.getHours() - START_HOUR) * 60 + currentTime.getMinutes()) / 60 * HOUR_HEIGHT}px` }}
                                                >
                                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1.5 shadow-sm"></div>
                                                </div>
                                            )}

                                            {/* Events */}
                                            {dayAppointments.map(appt => (
                                                <div
                                                    key={appt.id}
                                                    className={clsx(
                                                        "absolute left-1 right-1.5 rounded-xl p-2 text-xs cursor-pointer transition-all hover:shadow-lg hover:z-20 group overflow-hidden",
                                                        isOrthoAppointment(appt)
                                                            ? "border-l-4"
                                                            : getStatusStyles(appt.status)
                                                    )}
                                                    style={{
                                                        ...getPositionStyle(appt.start, appt.end),
                                                        ...(isOrthoAppointment(appt) ? {
                                                            backgroundColor: 'rgba(140,198,62,0.1)',
                                                            borderLeftColor: '#8CC63E',
                                                            color: '#4a7a1a',
                                                        } : {}),
                                                    }}
                                                >
                                                    <div className="font-bold truncate leading-tight">{appt.type}</div>
                                                    <div className="truncate text-[10px] opacity-80 mt-0.5">
                                                        {appt.start} – {appt.end}
                                                    </div>
                                                    <div className="mt-0.5 font-medium truncate text-[10px] opacity-90">
                                                        {appt.patient}
                                                    </div>

                                                    {/* Hover actions */}
                                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5 bg-white/90 rounded-lg p-0.5 backdrop-blur-sm transition-opacity shadow-sm">
                                                        {!['llegó', 'no_llegó', 'completada'].includes(appt.status) && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleAttendance(appt.id, 'llegó'); }}
                                                                    title="Llegó"
                                                                    className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-lg transition-colors"
                                                                >
                                                                    <CheckCircle size={13} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleAttendance(appt.id, 'no_llegó'); }}
                                                                    title="No Llegó"
                                                                    className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors"
                                                                >
                                                                    <XCircle size={13} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── CREATE EVENT MODAL ──────────────────────────────── */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-xl">
                                    <CalendarIcon className="text-primary" size={20} />
                                </div>
                                <h2 className="text-xl font-serif font-bold text-gray-800">Nueva Cita</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Patient Selector */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Paciente <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                                        <User className="text-gray-400 mr-3" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Buscar paciente..."
                                            className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm"
                                            value={newEvent.patient || patientSearch}
                                            onChange={(e) => {
                                                setPatientSearch(e.target.value);
                                                setNewEvent(prev => ({ ...prev, patient: '' }));
                                                setShowPatientDropdown(true);
                                            }}
                                            onFocus={() => setShowPatientDropdown(true)}
                                        />
                                        {newEvent.patient && (
                                            <button
                                                type="button"
                                                onClick={() => { setNewEvent(prev => ({ ...prev, patient: '' })); setPatientSearch(''); }}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {showPatientDropdown && !newEvent.patient && (
                                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                            {filteredPatients.length === 0 ? (
                                                <div className="px-4 py-3 text-gray-400 text-sm">No se encontraron pacientes.</div>
                                            ) : filteredPatients.map(p => (
                                                <button
                                                    type="button"
                                                    key={p.id}
                                                    onClick={() => {
                                                        setNewEvent(prev => ({ ...prev, patient: p.name }));
                                                        setPatientSearch('');
                                                        setShowPatientDropdown(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-primary/5 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                        {p.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                                                        <p className="text-[10px] text-gray-400">Cédula: {p.docId}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Treatment Type */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Tipo de Cita <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={newEvent.type}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-white"
                                >
                                    {TREATMENT_TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                    Fecha <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                />
                            </div>

                            {/* Time Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                        Hora Inicio <span className="text-red-400">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        <select
                                            value={newEvent.start}
                                            onChange={(e) => setNewEvent(prev => ({ ...prev, start: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-white"
                                        >
                                            {timeOptions.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                        Hora Fin <span className="text-red-400">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        <select
                                            value={newEvent.end}
                                            onChange={(e) => setNewEvent(prev => ({ ...prev, end: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all bg-white"
                                        >
                                            {timeOptions.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Estado Inicial</label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'pendiente', label: 'Pendiente', color: 'yellow' },
                                        { id: 'confirmada', label: 'Confirmada', color: 'green' },
                                    ].map(s => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setNewEvent(prev => ({ ...prev, status: s.id }))}
                                            className={clsx(
                                                "flex-1 py-2 rounded-xl text-sm font-bold transition-all border-2",
                                                newEvent.status === s.id
                                                    ? s.id === 'confirmada'
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-yellow-400 bg-yellow-50 text-yellow-700"
                                                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                                            )}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateEvent}
                                className="bg-primary hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all"
                            >
                                <Plus size={16} />
                                Crear Cita
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── SEND LINK MODAL (CA 4) ───────────────────────────── */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(140,198,62,0.12)' }}>
                                    <Link2 style={{ color: '#8CC63E' }} size={20} />
                                </div>
                                <h2 className="text-xl font-serif font-bold text-gray-800">Enlace de Reserva</h2>
                            </div>
                            <button type="button" onClick={() => { setShowLinkModal(false); setLinkCopied(false); }}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={22} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-500">
                                Comparte este enlace con tus pacientes para que reserven citas de ortodoncia en los horarios que configuraste.
                            </p>
                            <div className="flex items-center gap-2">
                                <input type="text" readOnly value={orthoBookingLink}
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-600 outline-none" />
                                <button type="button" onClick={handleCopyLink}
                                    className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md"
                                    style={linkCopied
                                        ? { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
                                        : { backgroundColor: '#8CC63E', color: '#fff' }
                                    }>
                                    {linkCopied ? <><CheckCircle size={16} /> Copiado</> : <><Copy size={16} /> Copiar</>}
                                </button>
                            </div>
                            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(140,198,62,0.06)', border: '1px solid rgba(140,198,62,0.15)' }}>
                                <p className="text-xs font-bold mb-1" style={{ color: '#6aad2d' }}>Bloques activos incluidos:</p>
                                <div className="space-y-1">
                                    {orthoBlocks.map(b => (
                                        <p key={b.id} className="text-xs text-gray-600 capitalize">
                                            • {format(parseISO(b.date), "EEEE d MMM yyyy", { locale: es })}: {b.startTime} – {b.endTime}
                                        </p>
                                    ))}
                                    {orthoBlocks.length === 0 && <p className="text-xs text-gray-400">No hay bloques configurados.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Toast ──────────────────────────────────────────── */}
            {showToast && (
                <div className="fixed bottom-8 right-8 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 z-50">
                    <CheckCircle className="text-primary" size={20} />
                    <span className="font-medium">{toastMsg}</span>
                </div>
            )}
        </div>
    );
};

export default Appointments;
