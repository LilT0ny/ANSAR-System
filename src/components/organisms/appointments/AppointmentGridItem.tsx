import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle, XCircle } from 'lucide-react';

const AppointmentGridItem = ({
    appt,
    className,
    style,
    onAttendanceChange
}) => {
    return (
        <div
            className={clsx(
                "absolute inset-x-1 rounded-xl p-2 cursor-pointer transition-all hover:shadow-lg hover:z-20 group flex flex-col gap-0.5",
                className
            )}
            style={style}
        >
            <div className="font-bold truncate text-xs">
                {appt.patientName || appt.patient}
            </div>
            <div className="truncate text-[10px] font-semibold opacity-85">
                {appt.type || appt.title}
            </div>
            <div className="truncate text-[10px] font-semibold">
                {appt.start} – {appt.end}
            </div>

            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5 bg-white/90 rounded-lg p-0.5 shadow-sm">
                {!['llegó', 'no_llegó', 'completada'].includes(appt.status) && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAttendanceChange(appt.id, 'llegó');
                            }}
                            className="text-emerald-600 p-1 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Marcar como llegó"
                        >
                            <CheckCircle size={13} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAttendanceChange(appt.id, 'no_llegó');
                            }}
                            className="text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors"
                            title="Marcar como no llegó"
                        >
                            <XCircle size={13} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AppointmentGridItem;
