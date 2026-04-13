import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Invoice } from '../types';

interface UseInvoicesReturn {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  totalIncome: number;
  pendingIncome: number;
  fetchInvoices: () => Promise<void>;
  createInvoice: (data: Partial<Invoice>) => Promise<Invoice | null>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<Invoice | null>;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setInvoices(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvoice = useCallback(async (data: Partial<Invoice>): Promise<Invoice | null> => {
    try {
      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      setInvoices(prev => [newInvoice, ...prev]);
      return newInvoice;
    } catch (err: any) {
      setError(err.message || 'Error al crear factura');
      return null;
    }
  }, []);

  const updateInvoice = useCallback(async (id: string, data: Partial<Invoice>): Promise<Invoice | null> => {
    try {
      const { data: updated, error } = await supabase
        .from('invoices')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar factura');
      return null;
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const totalIncome = invoices
    .filter(inv => inv.status === 'pagado')
    .reduce((sum, inv) => sum + Number(inv.subtotal || 0), 0);

  const pendingIncome = invoices
    .filter(inv => inv.status === 'pendiente')
    .reduce((sum, inv) => sum + Number(inv.subtotal || 0), 0);

  return {
    invoices,
    loading,
    error,
    totalIncome,
    pendingIncome,
    fetchInvoices,
    createInvoice,
    updateInvoice,
  };
};

export default useInvoices;