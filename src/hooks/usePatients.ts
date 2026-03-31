import { useState, useEffect, useCallback } from 'react';
import { patientsAPI } from '../services/api';
import { Patient } from '../types';

interface UsePatientsReturn {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
  createPatient: (data: Partial<Patient>) => Promise<Patient | null>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<Patient | null>;
  deletePatient: (id: string) => Promise<boolean>;
  searchPatients: (term: string) => Patient[];
}

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientsAPI.list();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPatient = useCallback(async (data: Partial<Patient>): Promise<Patient | null> => {
    try {
      const newPatient = await patientsAPI.create(data);
      setPatients(prev => [newPatient, ...prev]);
      return newPatient;
    } catch (err: any) {
      setError(err.message || 'Error al crear paciente');
      return null;
    }
  }, []);

  const updatePatient = useCallback(async (id: string, data: Partial<Patient>): Promise<Patient | null> => {
    try {
      const updated = await patientsAPI.update(id, data);
      setPatients(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar paciente');
      return null;
    }
  }, []);

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    try {
      await patientsAPI.delete(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar paciente');
      return false;
    }
  }, []);

  const searchPatients = useCallback((term: string): Patient[] => {
    const q = term.toLowerCase();
    return patients.filter(p =>
      p.first_name?.toLowerCase().includes(q) ||
      p.last_name?.toLowerCase().includes(q) ||
      p.document_id?.includes(term)
    );
  }, [patients]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
  };
};

export default usePatients;