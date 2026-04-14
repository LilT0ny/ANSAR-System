import { useState, useEffect, useCallback } from 'react';
import { appointmentsAPI } from '../services/api';
import { Appointment } from '../types';

/** Hook para gestionar citas médicas */
interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: (params?: Record<string, any>) => Promise<void>;
  createAppointment: (data: Partial<Appointment>) => Promise<Appointment | null>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<Appointment | null>;
  deleteAppointment: (id: string) => Promise<boolean>;
}

export const useAppointments = (): UseAppointmentsReturn => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsAPI.list(params);
      setAppointments(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar citas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (data: Partial<Appointment>): Promise<Appointment | null> => {
    try {
      const newAppointment = await appointmentsAPI.create(data);
      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cita';
      setError(errorMessage);
      return null;
    }
  }, []);

  const updateAppointment = useCallback(async (id: string, data: Partial<Appointment>): Promise<Appointment | null> => {
    try {
      const updated = await appointmentsAPI.update(id, data);
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cita';
      setError(errorMessage);
      return null;
    }
  }, []);

  const deleteAppointment = useCallback(async (id: string): Promise<boolean> => {
    try {
      await appointmentsAPI.delete(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar cita';
      setError(errorMessage);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
};

export default useAppointments;
