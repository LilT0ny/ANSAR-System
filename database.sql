-- =============================================
-- SCHEMA PARA SUPABASE (Basado en el original)
-- =============================================

-- 1. Pacientes
CREATE TABLE IF NOT EXISTS patients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    document_id     TEXT NOT NULL UNIQUE,
    email           TEXT,
    phone           TEXT,
    date_of_birth   DATE,
    address         TEXT,
    city            TEXT,
    gender          TEXT CHECK (gender IN ('masculino', 'femenino', 'otro')),
    debt            NUMERIC(12,2) DEFAULT 0.00,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Historial Clínico
CREATE TABLE IF NOT EXISTS clinical_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    motivo_consulta TEXT,
    hipertension    BOOLEAN DEFAULT FALSE,
    enfermedad_cardiaca BOOLEAN DEFAULT FALSE,
    enfermedad_cardiaca_cual TEXT,
    diabetes        BOOLEAN DEFAULT FALSE,
    hemorragias     BOOLEAN DEFAULT FALSE,
    alergico        BOOLEAN DEFAULT FALSE,
    alergico_cual   TEXT,
    vih             BOOLEAN DEFAULT FALSE,
    embarazada      BOOLEAN DEFAULT FALSE,
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
    created_by      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Odontogramas
CREATE TABLE IF NOT EXISTS odontograms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    data            JSONB NOT NULL DEFAULT '{}',
    updated_by      UUID,
    last_updated    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Citas
CREATE TABLE IF NOT EXISTS appointments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id           UUID,
    start_time          TIMESTAMPTZ NOT NULL,
    end_time            TIMESTAMPTZ NOT NULL,
    reason              TEXT DEFAULT 'Consulta General',
    status              TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'atendido', 'rechazada', 'anulada', 'completada')),
    appointment_type    TEXT DEFAULT 'general' CHECK (appointment_type IN ('general', 'ortodoncia')),
    appointment_date    DATE,
    appointment_time    TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bloqueos de Ortodoncia
CREATE TABLE IF NOT EXISTS ortho_blocks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date            DATE NOT NULL,
    start_time      TEXT NOT NULL,
    end_time        TEXT NOT NULL,
    label           TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Logs de Notificaciones
CREATE TABLE IF NOT EXISTS notification_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id      UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id          UUID REFERENCES patients(id) ON DELETE SET NULL,
    recipient_email     TEXT,
    notification_type   TEXT DEFAULT 'EMAIL' CHECK (notification_type IN ('EMAIL', 'SMS', 'WHATSAPP')),
    status              TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    subject             TEXT,
    message_content     TEXT,
    error_detail        TEXT,
    is_read             BOOLEAN DEFAULT FALSE,
    is_deleted          BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
