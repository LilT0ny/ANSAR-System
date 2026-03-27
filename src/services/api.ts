import { supabase } from '../lib/supabase';
import { 
    Patient, 
    ClinicalHistory, 
    Appointment, 
    OrthoBlock, 
    User 
} from '../types';

// Helper to handle Supabase responses and throw errors if needed
async function handleSupabase<T>(promise: PromiseLike<{ data: T | null; error: any }>): Promise<T> {
    const { data, error } = await promise;
    if (error) {
        console.error('Supabase Error:', error);
        const err = new Error(error.message) as any;
        err.status = error.code === 'PGRST116' ? 404 : 400;
        throw err;
    }
    return data as T;
}

// ── AUTH ───────────────────────────────────────────────────────
export const authAPI = {
    login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        if (!data.session || !data.user) throw new Error('No session data');
        
        return {
            access_token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email || '',
                full_name: data.user.user_metadata?.full_name || 'User',
                role: data.user.user_metadata?.role || 'doctor'
            }
        };
    },

    register: async (userData: any): Promise<any> => {
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    full_name: userData.full_name,
                    role: userData.role || 'doctor'
                }
            }
        });
        if (error) throw error;
        return data;
    },

    me: async (): Promise<User> => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw new Error('Not authenticated');
        return {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || 'User',
            role: user.user_metadata?.role || 'doctor'
        };
    },

    signInWithOtp: async (email: string): Promise<void> => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false, // Generally for admin portal we don't want auto-registration
            }
        });
        if (error) throw error;
    },

    verifyOtp: async (email: string, token: string): Promise<{ session: any; user: User }> => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });
        if (error) throw error;
        if (!data.session || !data.user) throw new Error('No session data');

        return {
            session: data.session,
            user: {
                id: data.user.id,
                email: data.user.email || '',
                full_name: data.user.user_metadata?.full_name || 'User',
                role: data.user.user_metadata?.role || 'doctor'
            }
        };
    },

    logout: async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }
};

// ── PATIENTS ──────────────────────────────────────────────────
export const patientsAPI = {
    list: async (): Promise<Patient[]> => {
        return handleSupabase(
            supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false })
        );
    },

    getById: async (id: string): Promise<Patient> => {
        return handleSupabase(
            supabase
                .from('patients')
                .select('*')
                .eq('id', id)
                .single()
        );
    },

    search: async (query: string): Promise<Patient[]> => {
        return handleSupabase(
            supabase
                .from('patients')
                .select('*')
                .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,document_id.ilike.%${query}%`)
        );
    },

    create: async (patientData: Partial<Patient>): Promise<Patient> => {
        return handleSupabase(
            supabase
                .from('patients')
                .insert([patientData])
                .select()
                .single()
        );
    },

    update: async (id: string, patientData: Partial<Patient>): Promise<Patient> => {
        return handleSupabase(
            supabase
                .from('patients')
                .update(patientData)
                .eq('id', id)
                .select()
                .single()
        );
    },

    delete: async (id: string): Promise<null> => {
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return null;
    },

    // Clinical History
    getHistory: async (patientId: string): Promise<ClinicalHistory[]> => {
        return handleSupabase(
            supabase
                .from('clinical_history')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false })
        );
    },

    upsertHistory: async (patientId: string, data: Partial<ClinicalHistory>): Promise<ClinicalHistory> => {
        const { data: existing } = await supabase
            .from('clinical_history')
            .select('id')
            .eq('patient_id', patientId)
            .maybeSingle();

        if (existing) {
            return handleSupabase(
                supabase
                    .from('clinical_history')
                    .update({ ...data, patient_id: patientId })
                    .eq('id', existing.id)
                    .select()
                    .single()
            );
        } else {
            return handleSupabase(
                supabase
                    .from('clinical_history')
                    .insert([{ ...data, patient_id: patientId }])
                    .select()
                    .single()
            );
        }
    },

    createHistoryRecord: async (patientId: string, data: Partial<ClinicalHistory>): Promise<ClinicalHistory> => {
        return handleSupabase(
            supabase
                .from('clinical_history')
                .insert([{ ...data, patient_id: patientId }])
                .select()
                .single()
        );
    },

    // Odontogram
    getOdontogram: async (patientId: string): Promise<any> => {
        return handleSupabase(
            supabase
                .from('odontograms')
                .select('*')
                .eq('patient_id', patientId)
                .maybeSingle()
        );
    },

    updateOdontogram: async (patientId: string, data: any): Promise<any> => {
        const { data: existing } = await supabase
            .from('odontograms')
            .select('id')
            .eq('patient_id', patientId)
            .maybeSingle();

        if (existing) {
            return handleSupabase(
                supabase
                    .from('odontograms')
                    .update({ data, last_updated: new Date().toISOString() })
                    .eq('id', existing.id)
                    .select()
                    .single()
            );
        } else {
            return handleSupabase(
                supabase
                    .from('odontograms')
                    .insert([{ patient_id: patientId, data }])
                    .select()
                    .single()
            );
        }
    },
};

// ── APPOINTMENTS ──────────────────────────────────────────────
export const appointmentsAPI = {
    list: async (params: any = {}): Promise<Appointment[]> => {
        let query = supabase.from('appointments').select('*');
        
        if (params.date) {
            query = query.eq('appointment_date', params.date);
        }
        if (params.status) {
            query = query.eq('status', params.status);
        }
        if (params.doctor_id) {
            query = query.eq('doctor_id', params.doctor_id);
        }

        return handleSupabase(query.order('start_time', { ascending: true }));
    },

    create: async (data: Partial<Appointment>): Promise<Appointment> => {
        return handleSupabase(
            supabase
                .from('appointments')
                .insert([data])
                .select()
                .single()
        );
    },

    update: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
        return handleSupabase(
            supabase
                .from('appointments')
                .update(data)
                .eq('id', id)
                .select()
                .single()
        );
    },

    delete: async (id: string): Promise<null> => {
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return null;
    },

    // Ortho Blocks
    listOrthoBlocks: async (): Promise<OrthoBlock[]> => {
        return handleSupabase(
            supabase
                .from('ortho_blocks')
                .select('*')
                .order('date', { ascending: true })
        );
    },

    createOrthoBlock: async (data: Partial<OrthoBlock>): Promise<OrthoBlock> => {
        return handleSupabase(
            supabase
                .from('ortho_blocks')
                .insert([data])
                .select()
                .single()
        );
    },

    deleteOrthoBlock: async (id: string): Promise<null> => {
        const { error } = await supabase
            .from('ortho_blocks')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return null;
    },

    // Public endpoints
    getAvailability: async (date: string): Promise<string[]> => {
        const appts = await handleSupabase<any[]>(
            supabase.from('appointments').select('appointment_time').eq('appointment_date', date)
        );
        return appts.map(a => a.appointment_time);
    },

    getGeneralAvailability: async (date: string): Promise<string[]> => {
        const appts = await handleSupabase<any[]>(
            supabase.from('appointments')
                .select('appointment_time')
                .eq('appointment_date', date)
                .eq('appointment_type', 'general')
        );
        return appts.map(a => a.appointment_time);
    },

    getOrthoDates: async (): Promise<{ date: string }[]> => {
        return handleSupabase(
            supabase.from('ortho_blocks').select('date').gte('date', new Date().toISOString().split('T')[0])
        );
    },

    publicBookOrtho: async (data: any): Promise<Appointment> => {
        return handleSupabase(
            supabase.from('appointments').insert([{ ...data, appointment_type: 'ortodoncia', status: 'pendiente' }]).select().single()
        );
    },

    publicBookGeneral: async (data: any): Promise<Appointment> => {
        return handleSupabase(
            supabase.from('appointments').insert([{ ...data, appointment_type: 'general', status: 'pendiente' }]).select().single()
        );
    },
};

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const notificationsAPI = {
    list: async (): Promise<any[]> => {
        return handleSupabase(
            supabase
                .from('notification_logs')
                .select('*')
                .order('created_at', { ascending: false })
        );
    },

    send: async (data: any): Promise<any> => {
        return handleSupabase(
            supabase
                .from('notification_logs')
                .insert([data])
                .select()
                .single()
        );
    },

    getDoctorNotifications: async (): Promise<any[]> => {
        return handleSupabase(
            supabase
                .from('notification_logs')
                .select('*')
                .eq('is_read', false)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false })
        );
    },

    markAsRead: async (logId: string): Promise<any> => {
        return handleSupabase(
            supabase
                .from('notification_logs')
                .update({ is_read: true })
                .eq('id', logId)
                .select()
                .single()
        );
    },

    clearDoctorNotifications: async (): Promise<null> => {
        const { error } = await supabase
            .from('notification_logs')
            .update({ is_deleted: true })
            .eq('is_read', true);
        if (error) throw error;
        return null;
    },
};

// Legacy export for backward compatibility
export const api = { auth: authAPI };
