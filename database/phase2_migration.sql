-- Odontograms Table
-- Stores the dental status of a patient. Using JSONB allows for flexible storage of each tooth's condition
-- without needing a massive table structure for 32 teeth * 5 faces.
CREATE TABLE odontograms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- JSONB Structure example: 
    -- { "11": { "condition": "caries", "surfaces": ["distal", "oclusal"], "notes": "Deep caries" }, ... }
    data JSONB NOT NULL DEFAULT '{}', 
    
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id) -- Doctor who last modified it
);

-- Notification Logs
-- To track communication history and prevent spamming.
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id),
    type VARCHAR(50) NOT NULL, -- 'EMAIL', 'WHATSAPP', 'SMS'
    status VARCHAR(50) NOT NULL, -- 'SENT', 'FAILED', 'PENDING'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    message_content TEXT,
    metadata JSONB -- Store external API response IDs (e.g., SendGrid/Twilio IDs)
);

-- Index for fast retrieval of patient's latest odontogram
CREATE INDEX idx_odontograms_patient ON odontograms(patient_id);
-- Index for finding appointments that need reminders (filtering by logs might be needed later)
CREATE INDEX idx_notification_logs_appointment ON notification_logs(appointment_id);
