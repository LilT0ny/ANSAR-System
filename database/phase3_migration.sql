-- Surveys Table
-- Stores satisfaction feedback from patients.
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1 to 5 stars
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orthodontic Gallery Table
-- Stores metadata for patient photos (before/after/progress).
CREATE TABLE orthodontic_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL, -- Path to file
    stage VARCHAR(50) NOT NULL, -- 'initial', 'progress', 'final'
    notes TEXT,
    taken_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_gallery_patient ON orthodontic_gallery(patient_id);
CREATE INDEX idx_surveys_rating ON surveys(rating);
