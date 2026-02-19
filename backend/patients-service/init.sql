-- =============================================
-- PATIENTS SERVICE – PostgreSQL Schema
-- =============================================

CREATE TABLE IF NOT EXISTS patients (
    id              SERIAL PRIMARY KEY,
    first_name      VARCHAR(80)     NOT NULL,
    last_name       VARCHAR(80)     NOT NULL,
    document_id     VARCHAR(30)     NOT NULL UNIQUE,
    email           VARCHAR(255)    UNIQUE,
    phone           VARCHAR(30),
    date_of_birth   DATE,
    address         VARCHAR(255),
    city            VARCHAR(100),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_document ON patients(document_id);
CREATE INDEX IF NOT EXISTS idx_patients_email    ON patients(email);

-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinical_history (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER         NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    record_type     VARCHAR(50)     NOT NULL CHECK (record_type IN ('general', 'treatment', 'note')),
    title           VARCHAR(200),
    content         TEXT,
    created_by      INTEGER,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_patient ON clinical_history(patient_id);

-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS odontograms (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER         NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
    data            JSONB           NOT NULL DEFAULT '{}',
    updated_by      INTEGER,
    last_updated    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_odontogram_patient ON odontograms(patient_id);
