-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for Appointment Status
CREATE TYPE appointment_status AS ENUM ('pendiente', 'completada', 'cancelada', 'no_asistio');

-- Enum for User Roles
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'recepcionista');

-- Users Table (Doctors, Admins, Receptionists)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'doctor',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(50) UNIQUE NOT NULL, -- Documento de Identidad Unico
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE, -- Email Unico
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable if doctor is deleted, or assign to default
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status DEFAULT 'pendiente',
    reason TEXT, -- Reason for appointment
    notes TEXT, -- Private notes for staff
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint to prevent logic-level double booking (simplified constraint here, complex logic in app)
    -- This exclusion constraint prevents overlapping appointments for the same doctor
    CONSTRAINT prevent_doctor_overlap EXCLUDE USING gist (
        doctor_id WITH =,
        tsrange(start_time, end_time) WITH &&
    )
);

-- Medical History Table (One-to-Many with Patients, usually a history contains multiple entries/notes)
-- However, the prompt says "Estructura para notas médicas cronológicas", implying a log of visits/notes.
CREATE TABLE medical_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id),
    appointment_id UUID REFERENCES appointments(id), -- Optional link to specific appointment
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    attachments JSONB, -- For future scalability (images, files)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_patients_search ON patients(last_name, first_name, document_id);
CREATE INDEX idx_appointments_date ON appointments(start_time);
CREATE INDEX idx_medical_history_patient ON medical_histories(patient_id);
