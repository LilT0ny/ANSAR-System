-- Leads Table
-- Captures interest from the landing page contact form.
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT,
    status VARCHAR(20) DEFAULT 'nuevo', -- 'nuevo', 'contactado', 'convertido'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Temporary Tokens
-- Secure one-time links for surveys or appointment confirmations without login.
CREATE TABLE temporary_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(255) UNIQUE NOT NULL, -- UUID or Random String
    type VARCHAR(50) NOT NULL, -- 'SURVEY', 'CONFIRM_EMAIL'
    related_id UUID, -- Can link to appointment_id or patient_id
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update Appointments Enum (if needed, though we can use 'pendiente')
-- Checking if we need to alter the type. 'pendiente' works well for "Por Confirmar".
