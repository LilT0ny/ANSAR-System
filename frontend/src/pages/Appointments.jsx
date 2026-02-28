import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Calendar as CalendarIcon, CheckCircle, XCircle,
    ChevronLeft, ChevronRight, Clock, Plus, X, User,
    MoreVertical, AlertCircle, Settings, Link2, Copy,
    Trash2, ShieldCheck, Mail, Loader2
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

// Patients will be loaded from API



// ── Component ─────────────────────────────────────────────────
const Appointments = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'day' | 'week'
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const scrollRef = useRef(null);

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
    // orthoBlocks state moved below to consolidated state
    const [selectedPatientForNotif, setSelectedPatientForNotif] = useState(null);
    const [isNotifying, setIsNotifying] = useState(false);
    const [newBlock, setNewBlock] = useState({ date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '12:00' });
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    // New event form
    const [newEvent, setNewEvent] = useState({
        patient: '', // Display name
        patientId: null, // Actual ID
        date: format(new Date(), 'yyyy-MM-dd'),
        start: '09:00',
        end: '10:00',
        type: 'Consulta General',
        status: 'pendiente',
    });
    const [patientSearch, setPatientSearch] = useState('');
    const [orthoSearch, setOrthoSearch] = useState('');
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const [showOrthoPatientDropdown, setShowOrthoPatientDropdown] = useState(false);

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

            // Map API appointments to frontend format
            const mappedAppts = appts.map(a => {
                // Remove Z suffix to prevent local timezone translation
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

            // Map Ortho Blocks
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
        // Option to poll for new appointments
        const interval = setInterval(() => {
            fetchData();
        }, 30000); // 30 sec polling
        return () => clearInterval(interval);
    }, [fetchData]);

    const START_HOUR = 8;
    const END_HOUR = 19; // 7 PM
    const HOUR_HEIGHT = 120; // Increased from 60 to feel spacious like GCal
    const TIME_SLOTS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

    // Week days
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = viewMode === 'week'
        ? eachDayOfInterval({ start: weekStart, end: weekEnd })
        : [selectedDate];

    // ── Status styles (using system green) ────────────────────
    // ── Status styles (using system green) ────────────────────
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
        // Map UI status to backend status
        let backendStatus = statusUI;
        if (statusUI === 'llegó') backendStatus = 'atendido';
        if (statusUI === 'no_llegó') backendStatus = 'anulada';

        try {
            await appointmentsAPI.update(id, { status: backendStatus });
            // Optimistic update
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
            height: `${Math.max((durationMinutes / 60) * HOUR_HEIGHT, 48)}px`,
        };
    };

    const toast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // ── Create Event Handler ──────────────────────────────────
    const handleCreateEvent = async () => {
        if (!newEvent.patient || !newEvent.date || !newEvent.start || !newEvent.end) {
            toast('Completa todos los campos requeridos.');
            return;
        }
        if (newEvent.start >= newEvent.end) {
            toast('La hora de inicio debe ser antes de la hora de fin.');
            return;
        }

        try {
            // Construct full ISO strings for backend
            const startDateTime = new Date(`${newEvent.date}T${newEvent.start}`);
            const endDateTime = new Date(`${newEvent.date}T${newEvent.end}`);

            await appointmentsAPI.create({
                patient_id: newEvent.patientId, // Use the stored ID
                doctor_id: 1,
                appointment_date: newEvent.date,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                reason: newEvent.type,
                status: newEvent.status,
                appointment_type: newEvent.type
            });
            toast('Cita creada exitosamente.');
            setShowCreateModal(false);
            fetchData(); // Reload
        } catch (err) {
            console.error(err);
            toast('Error al crear cita: ' + err.message);
        }
    };

    // ── Ortho Block Handlers ──────────────────────────────────
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
            // Find patient details
            const pat = apiPatients.find(p => p.id === parseInt(selectedPatientForNotif));
            if (!pat || !pat.email) {
                toast('El paciente seleccionado no tiene email registrado.');
                return;
            }

            await notificationsAPI.send({
                patient_id: pat.id,
                recipient_email: pat.email, // Ensure email field is populated in apiPatients
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

    // Check if an appointment is in an ortho block
    const isOrthoAppointment = (appt) => appt.type === 'Ortodoncia';

    // Check if a weekday column has ortho blocks for background highlight
    const getOrthoBlocksForDay = (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return orthoBlocks.filter(b => b.date === dateStr);
    };

    // Filtered patients for the dropdown (from API)
    const filteredPatients = apiPatients.filter(p =>
        `${p.name} ${p.docId}`.toLowerCase().includes(patientSearch.toLowerCase())
    );

    const filteredOrthoPatients = apiPatients.filter(p =>
        `${p.name} ${p.docId}`.toLowerCase().includes(orthoSearch.toLowerCase())
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
                <div className="rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-300 mb-6" style={{ backgroundColor: 'rgba(140,198,62,0.04)', border: '2px solid rgba(140,198,62,0.2)' }}>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* LEFT: Add new block */}
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
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50">
                                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Fin</label>
                                        <select value={newBlock.endTime} onChange={e => setNewBlock({ ...newBlock, endTime: e.target.value })}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50">
                                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button type="button" onClick={handleAddOrthoBlock}
                                    className="w-full text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:opacity-90 mt-2"
                                    style={{ backgroundColor: '#8CC63E' }}>
                                    <Plus size={16} /> Crear Bloque
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: Notify Patient */}
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-3 text-sm">Notificar Paciente</h4>
                            <p className="text-xs text-gray-500 mb-3">Envía el enlace de reserva a un paciente específico.</p>

                            <div className="space-y-3">
                                <div className="relative">
                                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all bg-gray-50">
                                        <User className="text-gray-400 mr-2" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Buscar paciente..."
                                            className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
                                            value={selectedPatientForNotif ? (apiPatients.find(p => p.id === parseInt(selectedPatientForNotif))?.name || '') : orthoSearch}
                                            onChange={(e) => {
                                                setOrthoSearch(e.target.value);
                                                setSelectedPatientForNotif(null);
                                                setShowOrthoPatientDropdown(true);
                                            }}
                                            onFocus={() => setShowOrthoPatientDropdown(true)}
                                        />
                                        {selectedPatientForNotif && (
                                            <button onClick={() => { setSelectedPatientForNotif(null); setOrthoSearch(''); }} className="text-gray-400 hover:text-red-500">
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {showOrthoPatientDropdown && !selectedPatientForNotif && (
                                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                            {filteredOrthoPatients.length === 0 ? (
                                                <div className="px-4 py-3 text-gray-400 text-sm">No se encontraron pacientes.</div>
                                            ) : filteredOrthoPatients.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        setSelectedPatientForNotif(p.id);
                                                        setOrthoSearch('');
                                                        setShowOrthoPatientDropdown(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-primary/5 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                        {p.name.slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-xs">{p.name}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNotifyPatient}
                                    disabled={isNotifying || !selectedPatientForNotif}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md mt-2"
                                >
                                    {isNotifying ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />}
                                    Enviar Notificación
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active blocks list */}
                    {orthoBlocks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4 bg-white rounded-xl border border-gray-100 border-dashed">No hay bloques de ortodoncia configurados.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {orthoBlocks.map(block => (
                                <div key={block.id} className="bg-white rounded-xl p-4 flex items-center justify-between group transition-all shadow-sm" style={{ border: '1px solid rgba(140,198,62,0.3)' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(140,198,62,0.8)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(140,198,62,0.3)'}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(140,198,62,0.12)' }}>
                                            <CalendarIcon style={{ color: '#8CC63E' }} size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 capitalize">
                                                {format(parseISO(block.date), "EEE d MMM", { locale: es })}
                                            </p>
                                            <p className="text-xs text-gray-500">{block.startTime} – {block.endTime}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveOrthoBlock(block.id)}
                                        className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
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
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-140px)] max-h-[850px]">

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
                                    onClick={() => {
                                        if (viewMode === 'week') setSelectedDate(subWeeks(selectedDate, 1));
                                        else setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)));
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (viewMode === 'week') setSelectedDate(addWeeks(selectedDate, 1));
                                        else setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)));
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                            <h2 className="text-lg font-serif font-bold text-gray-800 capitalize min-w-[140px]">
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
                                    viewMode === 'day' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Día
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('week')}
                                className={clsx(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    viewMode === 'week' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Semana
                            </button>
                        </div>
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
                                <div className="w-20 border-r border-gray-200 shrink-0 bg-white z-10 select-none">
                                    {TIME_SLOTS.map(hour => (
                                        <div key={hour} className="flex items-start justify-end pr-3 -mt-3" style={{ height: `${HOUR_HEIGHT}px` }}>
                                            <span className="text-xs font-bold text-gray-500 tabular-nums">
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
                                                <div key={hour} className="border-b border-gray-200 relative" style={{ height: `${HOUR_HEIGHT}px` }}>
                                                    <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-200"></div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Events Overlay */}
                            <div className="absolute inset-0 flex ml-20">
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
                                                        "absolute left-1 right-1.5 rounded-xl p-2 cursor-pointer transition-all hover:shadow-lg hover:z-20 group flex flex-col gap-0.5",
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
                                                    <div className="font-bold truncate leading-tight text-xs sm:text-sm">{appt.type || appt.title}</div>
                                                    <div className="truncate text-[11px] sm:text-xs font-semibold opacity-85">
                                                        {appt.start} – {appt.end}
                                                    </div>
                                                    <div className="font-bold truncate text-[11px] sm:text-xs opacity-95">
                                                        {appt.patientName || appt.patient}
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
                                                        setNewEvent(prev => ({ ...prev, patient: p.name, patientId: p.id }));
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
