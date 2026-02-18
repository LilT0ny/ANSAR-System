-- =============================================
-- APPOINTMENTS SERVICE – PostgreSQL Schema
-- =============================================

CREATE TABLE IF NOT EXISTS appointments (
    id                  SERIAL PRIMARY KEY,
    patient_id          INTEGER         NOT NULL,
    doctor_id           INTEGER,
    start_time          TIMESTAMPTZ     NOT NULL,
    end_time            TIMESTAMPTZ     NOT NULL,
    reason              VARCHAR(255)    DEFAULT 'Consulta General',
    status              VARCHAR(20)     NOT NULL DEFAULT 'pendiente'
                            CHECK (status IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
    appointment_type    VARCHAR(30)     NOT NULL DEFAULT 'general'
                            CHECK (appointment_type IN ('general', 'ortodoncia')),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Prevent time overlaps for the same doctor
    CONSTRAINT no_overlap_check CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_appt_patient  ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appt_doctor   ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appt_time     ON appointments(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appt_status   ON appointments(status);

-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ortho_blocks (
    id              SERIAL PRIMARY KEY,
    date            DATE            NOT NULL,
    start_time      VARCHAR(5)      NOT NULL,   -- "12:00"
    end_time        VARCHAR(5)      NOT NULL,   -- "17:00"
    label           VARCHAR(100),
    created_by      INTEGER,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT block_time_check CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_ortho_date ON ortho_blocks(date);
