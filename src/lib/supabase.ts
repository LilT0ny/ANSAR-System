import { createClient } from '@supabase/supabase-js';

// Debug en desarrollo
console.log('🔧 Entorno:', import.meta.env.MODE);
console.log('🔧 URL de Supabase:', import.meta.env.VITE_SUPABASE_URL || 'NO CONFIGURADA');
console.log('🔧 Key de Supabase:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ configurada' : '✗ NO CONFIGURADA');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qrfggyjhdbqjnbjydymc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_UQAoATfEELUnRmWNK-p5ag_Xy9dNMHc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
    // Agregar headers para debug
    global: {
        headers: {
            'x-client-info': 'ansar-frontend'
        }
    }
});