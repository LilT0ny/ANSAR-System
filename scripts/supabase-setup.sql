-- =============================================
-- SCRIPT COMPLETO PARA SUPABASE - AN-SAR System
-- Ejecute este script en el SQL Editor de Supabase
-- =============================================

-- =============================================
-- 1. ELIMINAR TABLAS EXISTENTES (si hay problemas)
-- =============================================
DROP TABLE IF EXISTS notification_logs CASCADE;
DROP TABLE IF EXISTS ortho_blocks CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS odontograms CASCADE;
DROP TABLE IF EXISTS clinical_history CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- =============================================
-- 2. CREAR TABLAS
-- =============================================

-- Pacientes
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    document_id TEXT NOT NULL UNIQUE,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    address TEXT,
    city TEXT,
    gender TEXT CHECK (gender IN ('masculino', 'femenino', 'otro')),
    debt NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historial Clínico
CREATE TABLE clinical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    motivo_consulta TEXT,
    hipertension BOOLEAN DEFAULT FALSE,
    enfermedad_cardiaca BOOLEAN DEFAULT FALSE,
    enfermedad_cardiaca_cual TEXT,
    diabetes BOOLEAN DEFAULT FALSE,
    hemorragias BOOLEAN DEFAULT FALSE,
    alergico BOOLEAN DEFAULT FALSE,
    alergico_cual TEXT,
    vih BOOLEAN DEFAULT FALSE,
    embarazada BOOLEAN DEFAULT FALSE,
    embarazada_semanas INTEGER,
    medicamentos_en_uso BOOLEAN DEFAULT FALSE,
    medicamentos_cual TEXT,
    otras_enfermedades BOOLEAN DEFAULT FALSE,
    otras_enfermedades_cual TEXT,
    antecedentes_familiares TEXT,
    golpes_cara_dientes BOOLEAN DEFAULT FALSE,
    ulceras_bucales BOOLEAN DEFAULT FALSE,
    sangrado_encias BOOLEAN DEFAULT FALSE,
    cepillado_veces_dia INTEGER,
    ultima_visita_odontologo TEXT,
    doctor_asignado_id UUID,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Odontogramas
CREATE TABLE odontograms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}',
    updated_by UUID,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Citas
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reason TEXT DEFAULT 'Consulta General',
    status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'atendido', 'rechazada', 'anulada', 'completada')),
    appointment_type TEXT DEFAULT 'general' CHECK (appointment_type IN ('general', 'ortodoncia')),
    appointment_date DATE,
    appointment_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bloqueos de Ortodoncia
CREATE TABLE ortho_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    label TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de Notificaciones
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    recipient_email TEXT,
    notification_type TEXT DEFAULT 'EMAIL' CHECK (notification_type IN ('EMAIL', 'SMS', 'WHATSAPP')),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    subject TEXT,
    message_content TEXT,
    error_detail TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. HABILITAR RLS (Row Level Security)
-- =============================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontograms ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ortho_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. POLÍTICAS RLS - ACCESO PÚBLICO PARA USO DEL APP
-- =============================================

-- Pacientes - Cualquier persona autenticada puede ver, insertar, actualizar, eliminar
CREATE POLICY "Allow all for authenticated users - patients" ON patients
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- También permitir para anon (necesario para el app)
CREATE POLICY "Allow all for anon - patients" ON patients
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

-- Historial Clínico
CREATE POLICY "Allow all for authenticated - clinical_history" ON clinical_history
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for anon - clinical_history" ON clinical_history
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

-- Odontogramas
CREATE POLICY "Allow all for authenticated - odontograms" ON odontograms
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for anon - odontograms" ON odontograms
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

-- Citas
CREATE POLICY "Allow all for authenticated - appointments" ON appointments
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for anon - appointments" ON appointments
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

-- Bloques Ortodoncia
CREATE POLICY "Allow all for authenticated - ortho_blocks" ON ortho_blocks
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for anon - ortho_blocks" ON ortho_blocks
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

-- Notificaciones
CREATE POLICY "Allow all for authenticated - notification_logs" ON notification_logs
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for anon - notification_logs" ON notification_logs
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

-- =============================================
-- 5. VERIFICACIÓN
-- =============================================
SELECT 'Tablas creadas exitosamente!' as mensaje;
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- =============================================
-- NOTAS FINALES:
-- 1. Ejecute todo el script en el SQL Editor de Supabase
-- 2. Luego cree un usuario en Authentication > Users > Add user
-- 3. Use ese email y contraseña para hacer login en la app
-- =============================================