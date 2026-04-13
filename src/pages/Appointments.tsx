import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
    Calendar as CalendarIcon, CheckCircle, XCircle,
    ChevronLeft, ChevronRight, Clock, Plus, X, User,
    MoreVertical, AlertCircle, Settings, Link2, Copy,
    Trash2, ShieldCheck, Mail, Loader2, Activity
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
import { patientsAPI, appointmentsAPI } from '../services/api';
import DaySummarySidebar from '../components/appointments/DaySummarySidebar';
import AppointmentGridItem from '../components/appointments/AppointmentGridItem';
import AppointmentModal from '../components/appointments/AppointmentModal';

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

// ── Component ─────────────────────────────────────────────────
const Appointments = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'day' | 'week'
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    // ── API-loaded patients ───────────────────────────────────
    const [apiPatients, setApiPatients] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);

    const fetchPatients = useCallback(async () => {
        setLoadingPatients(true);
        try {
            const data = await patientsAPI.list();
            setApiPatients(data.map(p => ({
                id: p.id,
                name: `${p.first_name} ${p.last_name}`,
                docId: p.document_id || '',
                email: p.email || '',
                phone: p.phone || '',
            })));
        } catch (err) {
            console.error('Error fetching patients:', err);
        } finally {
            setLoadingPatients(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // ── Ortho Block Management ────────────────────────────────
    const [showOrthoPanel, setShowOrthoPanel] = useState(false);
    const [selectedPatientForNotif, setSelectedPatientForNotif] = useState(null);
    const [isNotifying, setIsNotifying] = useState(false);
    const [newBlock, setNewBlock] = useState({ date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '12:00' });
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const [orthoSearch, setOrthoSearch] = useState('');
    const [showOrthoPatientDropdown, setShowOrthoPatientDropdown] = useState(false);

    // Clock update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const scrollRef = useRef(null);
    const START_HOUR = 0;
    const END_HOUR = 23;
    const HOUR_HEIGHT = 150; // Fixed height for vertical scroll
    const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => i / 2);

    // Auto-scroll to 9 AM on mount
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 9 * HOUR_HEIGHT;
        }
    }, []);


    // Appointments & Ortho Blocks State
    const [appointments, setAppointments] = useState([]);
    const [orthoBlocks, setOrthoBlocks] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    // Fetch Data
    const fetchData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [appts, blocks] = await Promise.all([
                appointmentsAPI.list(),
                appointmentsAPI.listOrthoBlocks()
            ]);

            const mappedAppts = appts.map(a => {
                const cleanedStartTime = a.start_time.replace(/([+-]\d{2}:\d{2}|Z)$/i, '');
                const cleanedEndTime = a.end_time.replace(/([+-]\d{2}:\d{2}|Z)$/i, '');
                const startDate = typeof cleanedStartTime === 'string' ? new Date(cleanedStartTime) : new Date();
                const endDate = typeof cleanedEndTime === 'string' ? new Date(cleanedEndTime) : new Date();

                return {
                    id: a.id,
                    title: a.reason || 'Cita',
                    start: format(startDate, 'HH:mm'),
                    end: format(endDate, 'HH:mm'),
                    date: a.appointment_date || format(startDate, 'yyyy-MM-dd'),
                    type: a.appointment_type,
                    status: a.status,
                    patientId: a.patient_id,
                    patientName: a.patient ? `${a.patient.first_name} ${a.patient.last_name}` : 'Paciente',
                };
            });
            setAppointments(mappedAppts);

            const mappedBlocks = blocks.map(b => ({
                id: b.id,
                date: b.date,
                startTime: b.start_time,
                endTime: b.end_time,
                label: b.label || 'Bloque Ortodoncia',
            }));
            setOrthoBlocks(mappedBlocks);

        } catch (err) {
            console.error('Error fetching calendar data:', err);
            toast('Error al cargar citas.');
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 30000); // 30 sec polling
        return () => clearInterval(interval);
    }, [fetchData]);

    const formatHour12 = (h) => {
        const hour = Math.floor(h);
        const minutes = (h % 1) === 0 ? '00' : '30';
        const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
        const period = hour < 12 ? 'AM' : 'PM';
        return `${displayHour}:${minutes} ${period}`;
    };

    // Week days
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = viewMode === 'week'
        ? eachDayOfInterval({ start: weekStart, end: weekEnd })
        : [selectedDate];

    const getStatusStyles = (status) => {
        switch (status) {
            case 'confirmada': return 'bg-primary/10 border-l-4 border-primary text-green-800';
            case 'pendiente': return 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800';
            case 'completada': return 'bg-gray-100 border-l-4 border-gray-400 text-gray-600';
            case 'llegó':
            case 'atendido':
                return 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800';
            case 'no_llegó':
            case 'anulada':
            case 'rechazada':
                return 'bg-red-50 border-l-4 border-red-400 text-red-700';
            default: return 'bg-gray-50 border-l-4 border-gray-300 text-gray-600';
        }
    };

    const handleAttendance = async (id, statusUI) => {
        let backendStatus = statusUI;
        if (statusUI === 'llegó') backendStatus = 'atendido';
        if (statusUI === 'no_llegó') backendStatus = 'anulada';

        try {
            await appointmentsAPI.update(id, { status: backendStatus });
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: backendStatus } : a));
            toast(`Estado actualizado: ${backendStatus}`);
        } catch (err) {
            console.error(err);
            toast('Error al actualizar estado.');
        }
    };

    const getPositionStyle = (start, end) => {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const startMinutes = (startH - START_HOUR) * 60 + startM;
        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        return {
            top: `${(startMinutes / 60) * HOUR_HEIGHT}px`,
            height: `${Math.max((durationMinutes / 60) * HOUR_HEIGHT, 40)}px`,
        };
    };

    const toast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleAddOrthoBlock = async () => {
        if (!newBlock.date) {
            toast('Selecciona una fecha.');
            return;
        }
        const blockDate = parseISO(newBlock.date);
        if (blockDate < new Date(new Date().setHours(0, 0, 0, 0))) {
            toast('No se puede crear un bloque en una fecha pasada.');
            return;
        }
        if (newBlock.startTime >= newBlock.endTime) {
            toast('La hora de inicio debe ser antes de la hora de fin.');
            return;
        }

        try {
            const dateLabel = format(blockDate, "EEE d MMM", { locale: es });
            await appointmentsAPI.createOrthoBlock({
                date: newBlock.date,
                start_time: newBlock.startTime,
                end_time: newBlock.endTime,
                label: `${dateLabel} – Ortodoncia`
            });
            toast('Bloque de ortodoncia creado.');
            fetchData();
        } catch (err) {
            console.error(err);
            toast('Error al crear bloque: ' + err.message);
        }
    };

    const handleRemoveOrthoBlock = async (id) => {
        try {
            await appointmentsAPI.deleteOrthoBlock(id);
            toast('Bloque eliminado.');
            fetchData();
        } catch (err) {
            toast('Error al eliminar bloque.');
        }
    };

    const handleNotifyPatient = async () => {
        if (!selectedPatientForNotif) {
            toast('Por favor selecciona un paciente.');
            return;
        }
        setIsNotifying(true);
        try {
            const pat = apiPatients.find(p => p.id === parseInt(selectedPatientForNotif));
            if (!pat || !pat.email) {
                toast('El paciente seleccionado no tiene email registrado.');
                return;
            }

            await appointmentsAPI.sendNotification({
                patient_id: pat.id,
                recipient_email: pat.email,
                notification_type: 'EMAIL',
                subject: 'AN-SAR – Turnos de Ortodoncia Disponibles',
                message_content: `Hola ${pat.name},\n\nYa están disponibles los nuevos horarios para ortodoncia.\n\nPuedes reservar tu cita aquí:\n${orthoBookingLink}\n\n¡Te esperamos!`,
            });
            toast(`Notificación enviada a ${pat.name}`);
            setSelectedPatientForNotif(null);
        } catch (err) {
            console.error(err);
            toast('Error al enviar notificación.');
        } finally {
            setIsNotifying(false);
        }
    };

    const orthoBookingLink = `${window.location.origin}/reservar/ortodoncia?token=${btoa('ortho-' + Date.now()).slice(0, 12)}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(orthoBookingLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
    };

    const isOrthoAppointment = (appt) => appt.type === 'Ortodoncia';

    const getOrthoBlocksForDay = (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return orthoBlocks.filter(b => b.date === dateStr);
    };

    const filteredOrthoPatients = apiPatients.filter(p =>
        `${p.name} ${p.docId}`.toLowerCase().includes(orthoSearch.toLowerCase())
    );

    const timeOptions = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
        timeOptions.push(`${String(h).padStart(2, '0')}:00`);
        if (h < END_HOUR) timeOptions.push(`${String(h).padStart(2, '0')}:30`);
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Citas</h1>
                    <p className="text-gray-500 text-sm mt-1">Administra tu agenda</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowOrthoPanel(!showOrthoPanel)}
                        className="px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs md:text-sm border-2 transition-all"
                        style={showOrthoPanel
                            ? { backgroundColor: '#8CC63E', color: '#fff', borderColor: '#8CC63E' }
                            : { color: '#6aad2d', borderColor: 'rgba(140,198,62,0.4)', backgroundColor: 'transparent' }
                        }
                    >
                        <ShieldCheck size={16} />
                        <span className="hidden sm:inline">Ortodoncia</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="flex-1 sm:flex-none bg-primary hover:bg-green-600 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs md:text-sm transition-all shadow-md"
                    >
                        <Plus size={18} />
                        Nueva Cita
                    </button>
                </div>
            </div>

            {showOrthoPanel && (
                <div className="rounded-2xl p-4 md:p-6 animate-in fade-in slide-in-from-top-2 duration-300 mb-6" style={{ backgroundColor: 'rgba(140,198,62,0.04)', border: '2px solid rgba(140,198,62,0.2)' }}>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(140,198,62,0.12)' }}>
                                <ShieldCheck style={{ color: '#8CC63E' }} size={20} />
                            </div>
                            <div>
                                <h3 className="text-base md:text-lg font-serif font-bold text-gray-800">Bloques de Ortodoncia</h3>
                                <p className="text-[10px] md:text-xs text-gray-400">Define fechas y horarios exclusivos para ortodoncia</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setShowOrthoPanel(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-3 text-sm">Nuevo Bloque</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={newBlock.date}
                                        onChange={e => setNewBlock({ ...newBlock, date: e.target.value })}
                                        min={format(new Date(), 'yyyy-MM-dd')}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Inicio</label>
                                        <select value={newBlock.startTime} onChange={e => setNewBlock({ ...newBlock, startTime: e.target.value })}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-gray-50">
                                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Fin</label>
                                        <select value={newBlock.endTime} onChange={e => setNewBlock({ ...newBlock, endTime: e.target.value })}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-gray-50">
                                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button type="button" onClick={handleAddOrthoBlock}
                                    className="w-full text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                                    style={{ backgroundColor: '#8CC63E' }}>
                                    <Plus size={16} /> Crear Bloque
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-3 text-sm">Notificar Paciente</h4>
                            <div className="space-y-3">
                                <div className="relative">
                                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                                        <User className="text-gray-400 mr-2" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Buscar paciente..."
                                            className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
                                            value={selectedPatientForNotif ? (apiPatients.find(p => p.id === parseInt(selectedPatientForNotif))?.name || '') : orthoSearch}
                                            onChange={(e) => {
                                                setOrthoSearch(e.target.value);
                                                setSelectedPatientForNotif(null);
                                                setShowOrthoPatientDropdown(true);
                                            }}
                                            onFocus={() => setShowOrthoPatientDropdown(true)}
                                        />
                                    </div>
                                    {showOrthoPatientDropdown && !selectedPatientForNotif && (
                                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                            {filteredOrthoPatients.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        setSelectedPatientForNotif(p.id);
                                                        setOrthoSearch('');
                                                        setShowOrthoPatientDropdown(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-primary/5 text-xs"
                                                >
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNotifyPatient}
                                    disabled={isNotifying || !selectedPatientForNotif}
                                    className="w-full bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                                >
                                    {isNotifying ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />}
                                    Enviar Notificación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-6 h-[calc(100vh-140px)] min-h-0">
                <DaySummarySidebar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    appointments={appointments}
                >
                </DaySummarySidebar>

                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-140px)] min-w-0">
                    <div className="px-4 md:px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between shrink-0 bg-white gap-3">
                        <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                            <div className="flex items-center gap-1 md:gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDate(new Date())}
                                    className="bg-primary hover:bg-green-600 text-white px-3 md:px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition-colors"
                                >
                                    Hoy
                                </button>
                                <div className="flex items-center gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (viewMode === 'week') setSelectedDate(subWeeks(selectedDate, 1));
                                            else setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1));
                                        }}
                                        className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (viewMode === 'week') setSelectedDate(addWeeks(selectedDate, 1));
                                            else setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1));
                                        }}
                                        className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                            <h2 className="text-base font-bold text-gray-800 capitalize">
                                {viewMode === 'week'
                                    ? format(selectedDate, "MMMM yyyy", { locale: es })
                                    : format(selectedDate, "d 'de' MMMM", { locale: es })
                                }
                            </h2>
                        </div>

                        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setViewMode('day')}
                                className={clsx(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    viewMode === 'day' ? "bg-white text-primary shadow-sm" : "text-gray-500"
                                )}
                            >
                                Día
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('week')}
                                className={clsx(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    viewMode === 'week' ? "bg-white text-primary shadow-sm" : "text-gray-500"
                                )}
                            >
                                Semana
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto min-h-0 flex flex-col">
                        <div className={clsx("flex-1 flex flex-col min-h-0", viewMode === 'week' ? "min-w-[800px]" : "min-w-full")}>

                            <div className="flex border-b border-gray-100 shrink-0 bg-gray-50/50">
                                <div className="w-16 shrink-0 border-r border-gray-100"></div>
                                {weekDays.map((day, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 flex flex-col items-center justify-center border-r border-gray-100 py-3 cursor-pointer hover:bg-primary/5 transition-colors"
                                        onClick={() => setSelectedDate(day)}
                                    >
                                        <span className={clsx(
                                            "text-[10px] font-bold uppercase mb-1",
                                            isSameDay(day, new Date()) ? "text-primary" : "text-gray-400"
                                        )}>
                                            {format(day, 'EEE', { locale: es })}
                                        </span>
                                        <span className={clsx(
                                            "w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all",
                                            isSameDay(day, new Date()) ? "bg-primary text-white" : "text-gray-700"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
                                <div className="relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                                    <div className="absolute inset-0 flex">
                                        <div className="w-16 border-r border-gray-200 bg-white z-10">
                                            {TIME_SLOTS.map(hour => (
                                                <div key={hour} className="flex items-start justify-end pr-3 text-[9px] font-bold text-gray-400" style={{ height: `${HOUR_HEIGHT / 2}px` }}>
                                                    <span className="-mt-2">{formatHour12(hour)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {weekDays.map((day, i) => {
                                            const dayOrthoBlocks = getOrthoBlocksForDay(day);
                                            return (
                                                <div key={i} className="flex-1 border-r border-gray-100 relative">
                                                    {dayOrthoBlocks.map(block => {
                                                        const [sh, sm] = block.startTime.split(':').map(Number);
                                                        const [eh, em] = block.endTime.split(':').map(Number);
                                                        const topPx = ((sh - START_HOUR) * 60 + sm) / 60 * HOUR_HEIGHT;
                                                        const heightPx = ((eh * 60 + em) - (sh * 60 + sm)) / 60 * HOUR_HEIGHT;
                                                        return (
                                                            <div key={block.id} className="absolute inset-x-0 z-0 bg-primary/5 border-l-2 border-primary/20"
                                                                style={{ top: `${topPx}px`, height: `${heightPx}px` }} />
                                                        );
                                                    })}
                                                    {TIME_SLOTS.map(hour => (
                                                        <div key={hour} className={clsx("border-b relative", (hour % 1 === 0) ? "border-gray-100" : "border-gray-50 border-dashed")}
                                                            style={{ height: `${HOUR_HEIGHT / 2}px` }}>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="absolute inset-0 flex ml-16">
                                        {weekDays.map((day, dayIndex) => {
                                            const dayAppointments = appointments.filter(appt => isSameDay(parseISO(appt.date), day));
                                            return (
                                                <div key={dayIndex} className="flex-1 relative">
                                                    {isSameDay(day, new Date()) && (
                                                        <div className="absolute w-full border-t-2 border-red-500 z-30 flex items-center"
                                                            style={{ top: `${((currentTime.getHours() - START_HOUR) * 60 + currentTime.getMinutes()) / 60 * HOUR_HEIGHT}px` }}>
                                                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1.5 shadow-sm" />
                                                        </div>
                                                    )}

                                                    {dayAppointments.map(appt => (
                                                        <AppointmentGridItem
                                                            key={appt.id}
                                                            appt={appt}
                                                            className={getStatusStyles(appt.status)}
                                                            style={getPositionStyle(appt.start, appt.end)}
                                                            onAttendanceChange={handleAttendance}
                                                        />
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AppointmentModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchData}
                apiPatients={apiPatients}
                timeOptions={timeOptions}
                initialDate={selectedDate}
                toast={toast}
            />

            {
                showToast && (
                    <div className="fixed bottom-8 right-8 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 z-50">
                        <CheckCircle className="text-primary" size={20} />
                        <span className="font-medium">{toastMsg}</span>
                    </div>
                )
            }
        </div >
    );
};

export default Appointments;
