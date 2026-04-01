import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qrfggyjhdbqjnbjydymc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_UQAoATfEELUnRmWNK-p5ag_Xy9dNMHc';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Variables de entorno no encontradas, usando valores por defecto');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ configurada' : '✗ faltante');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    }
});