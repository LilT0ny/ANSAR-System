import React from 'react';
import { Activity } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

const DaySummarySidebar = ({
    selectedDate,
    setSelectedDate,
    appointments,
    children
}) => {
    // Helper to count appointments by status for the selected date
    const getCountByStatuses = (statuses) => {
        return appointments.filter(a =>
            isSameDay(parseISO(a.date), selectedDate) && statuses.includes(a.status)
        ).length;
    };

    const pendingCount = getCountByStatuses(['pendiente', 'confirmada']);
    const completedCount = getCountByStatuses(['atendido', 'completada']);

    const todayAppointments = appointments
        .filter(a => isSameDay(parseISO(a.date), selectedDate))
        .sort((a, b) => a.start.localeCompare(b.start));

    return (
        <aside className="hidden lg:block w-[300px] xl:w-[320px] h-[calc(100vh-140px)] shrink-0 space-y-3 overflow-hidden min-h-0 flex flex-col justify-start">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 overflow-hidden mini-cal shrink-0">
                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={es}
                    weekStartsOn={1}
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
                <h3 className="text-base font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    Resumen del Día
                </h3>

                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                    <div className="grid grid-cols-2 gap-2 shrink-0">
                        <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100">
                            <p className="text-[9px] uppercase font-bold text-orange-400 tracking-wider">Pendientes</p>
                            <p className="text-lg font-bold text-orange-600">
                                {pendingCount}
                            </p>
                        </div>
                        <div className="bg-green-50 p-2.5 rounded-xl border border-green-100">
                            <p className="text-[9px] uppercase font-bold text-green-400 tracking-wider">Atendidos</p>
                            <p className="text-lg font-bold text-green-600">
                                {completedCount}
                            </p>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-gray-50 flex-1 min-h-0 flex flex-col">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 shrink-0">Próximas Citas</p>
                        <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar flex-1">
                            {todayAppointments.map(appt => (
                                <div key={appt.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                    <div className="text-[9px] font-bold text-primary bg-primary/5 w-10 py-0.5 rounded text-center shrink-0">
                                        {appt.start}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-bold text-gray-800 truncate">{appt.patientName}</p>
                                        <p className="text-[9px] text-gray-400 truncate">{appt.type}</p>
                                    </div>
                                </div>
                            ))}
                            {todayAppointments.length === 0 && (
                                <p className="text-[10px] text-gray-400 text-center py-4 italic">Sin citas hoy</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {children}
        </aside>
    );
};

export default DaySummarySidebar;
