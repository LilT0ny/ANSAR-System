-- =============================================
-- PATIENTS SERVICE – PostgreSQL Schema
-- =============================================

DROP TABLE IF EXISTS odontograms CASCADE;
DROP TABLE IF EXISTS clinical_history CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- ── Patients ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
    id              SERIAL PRIMARY KEY,
    first_name      VARCHAR(80)     NOT NULL,
    last_name       VARCHAR(80)     NOT NULL,
    document_id     VARCHAR(30)     NOT NULL UNIQUE,
    email           VARCHAR(255),
    phone           VARCHAR(30),
    date_of_birth   DATE,
    address         VARCHAR(255),
    city            VARCHAR(100),
    gender          VARCHAR(20)     CHECK (gender IN ('masculino', 'femenino', 'otro')),
    debt            NUMERIC(12,2)   NOT NULL DEFAULT 0.00,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_document ON patients(document_id);
CREATE INDEX IF NOT EXISTS idx_patients_email    ON patients(email);

-- ── Clinical History ─────────────────────────────────────────────
-- Stores the complete medical questionnaire per patient
CREATE TABLE IF NOT EXISTS clinical_history (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER         NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

    -- 1. Motivo de consulta
    motivo_consulta             TEXT,

    -- 2. Antecedentes Patológicos – cuestionario SI/NO
    hipertension                BOOLEAN DEFAULT FALSE,
    enfermedad_cardiaca         BOOLEAN DEFAULT FALSE,
    enfermedad_cardiaca_cual    VARCHAR(255),
    diabetes                    BOOLEAN DEFAULT FALSE,
    hemorragias                 BOOLEAN DEFAULT FALSE,
    alergico                    BOOLEAN DEFAULT FALSE,
    alergico_cual               VARCHAR(255),
    vih                         BOOLEAN DEFAULT FALSE,
    embarazada                  BOOLEAN DEFAULT FALSE,
    embarazada_semanas          INTEGER,
    medicamentos_en_uso         BOOLEAN DEFAULT FALSE,
    medicamentos_cual           VARCHAR(255),
    otras_enfermedades          BOOLEAN DEFAULT FALSE,
    otras_enfermedades_cual     VARCHAR(255),
    antecedentes_familiares     TEXT,

    -- 3. Antecedentes Estomatológicos
    golpes_cara_dientes         BOOLEAN DEFAULT FALSE,
    ulceras_bucales             BOOLEAN DEFAULT FALSE,
    sangrado_encias             BOOLEAN DEFAULT FALSE,
    cepillado_veces_dia         INTEGER,
    ultima_visita_odontologo    TEXT,

    -- Doctor asignado
    doctor_asignado_id          INTEGER,

    -- Metadata
    created_by      INTEGER,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_patient ON clinical_history(patient_id);

-- ── Odontograms ──────────────────────────────────────────────────
-- data field holds tooth data; its structure varies by age (deciduous vs permanent)
CREATE TABLE IF NOT EXISTS odontograms (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER         NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    data            JSONB           NOT NULL DEFAULT '{}',
    updated_by      INTEGER,
    last_updated    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_odontogram_patient ON odontograms(patient_id);
