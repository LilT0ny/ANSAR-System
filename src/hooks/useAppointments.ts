import { useState, useEffect, useCallback } from 'react';
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { appointmentsAPI } from '../services/api';
import { Appointment, OrthoBlock } from '../types';

export interface AppointmentWithPatient extends Appointment {
  patientName: string;
}

export interface UseAppointmentsReturn {
  appointments: AppointmentWithPatient[];
  orthoBlocks: OrthoBlock[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  createAppointment: (data: Partial<Appointment>) => Promise<Appointment | null>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<Appointment | null>;
  deleteAppointment: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: string) => Promise<boolean>;
  getAppointmentsForDate: (date: Date) => AppointmentWithPatient[];
  getOrthoBlocksForDate: (date: Date) => OrthoBlock[];
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [orthoBlocks, setOrthoBlocks] = useState<OrthoBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [appts, blocks] = await Promise.all([
        appointmentsAPI.list(),
        appointmentsAPI.listOrthoBlocks()
      ]);

      const mappedAppts: AppointmentWithPatient[] = appts.map(a => {
        const cleanedStartTime = a.start_time.replace(/([+-]\d{2}:\d{2}|Z)$/i, '');
        const cleanedEndTime = a.end_time.replace(/([+-]\d{2}:\d{2}|Z)$/i, '');
        const startDate = typeof cleanedStartTime === 'string' ? new Date(cleanedStartTime) : new Date();
        const endDate = typeof cleanedEndTime === 'string' ? new Date(cleanedEndTime) : new Date();

        return {
          ...a,
          start: format(startDate, 'HH:mm'),
          end: format(endDate, 'HH:mm'),
          date: a.appointment_date || format(startDate, 'yyyy-MM-dd'),
          patientName: a.patient ? `${a.patient.first_name} ${a.patient.last_name}` : 'Paciente',
        };
      });

      const mappedBlocks: OrthoBlock[] = blocks.map(b => ({
        ...b,
        startTime: b.start_time,
        endTime: b.end_time,
      }));

      setAppointments(mappedAppts);
      setOrthoBlocks(mappedBlocks);
    } catch (err: any) {
      setError(err.message || 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (data: Partial<Appointment>): Promise<Appointment | null> => {
    try {
      const newAppt = await appointmentsAPI.create(data);
      await fetchData();
      return newAppt;
    } catch (err: any) {
      setError(err.message || 'Error al crear cita');
      return null;
    }
  }, [fetchData]);

  const updateAppointment = useCallback(async (id: string, data: Partial<Appointment>): Promise<Appointment | null> => {
    try {
      const updated = await appointmentsAPI.update(id, data);
      await fetchData();
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar cita');
      return null;
    }
  }, [fetchData]);

  const deleteAppointment = useCallback(async (id: string): Promise<boolean> => {
    try {
      await appointmentsAPI.delete(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cita');
      return false;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: string): Promise<boolean> => {
    try {
      await appointmentsAPI.update(id, { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado');
      return false;
    }
  }, []);

  const getAppointmentsForDate = useCallback((date: Date): AppointmentWithPatient[] => {
    return appointments.filter(appt => isSameDay(parseISO(appt.date), date));
  }, [appointments]);

  const getOrthoBlocksForDate = useCallback((date: Date): OrthoBlock[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return orthoBlocks.filter(b => b.date === dateStr);
  }, [orthoBlocks]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    appointments,
    orthoBlocks,
    loading,
    error,
    fetchData,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    updateStatus,
    getAppointmentsForDate,
    getOrthoBlocksForDate,
  };
};

export default useAppointments;