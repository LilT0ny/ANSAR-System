-- =============================================
-- NOTIFICATIONS SERVICE – PostgreSQL Schema
-- =============================================

CREATE TABLE IF NOT EXISTS notification_logs (
    id                  SERIAL PRIMARY KEY,
    appointment_id      INTEGER,
    patient_id          INTEGER,
    recipient_email     VARCHAR(255),
    notification_type   VARCHAR(30)     NOT NULL DEFAULT 'EMAIL'
                            CHECK (notification_type IN ('EMAIL', 'SMS', 'WHATSAPP')),
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    subject             VARCHAR(255),
    message_content     TEXT,
    error_detail        TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_appointment ON notification_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notif_patient     ON notification_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_notif_status      ON notification_logs(status);
