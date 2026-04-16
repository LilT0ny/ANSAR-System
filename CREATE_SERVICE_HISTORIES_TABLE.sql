-- Create service_histories table to store all service transactions/atenciones
CREATE TABLE IF NOT EXISTS service_histories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    payment_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    debt DECIMAL(10, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50),
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_total CHECK (total >= 0),
    CONSTRAINT valid_subtotal CHECK (subtotal >= 0),
    CONSTRAINT valid_discount CHECK (discount >= 0),
    CONSTRAINT valid_payment CHECK (payment_amount >= 0)
);

-- Create index for faster queries by patient_id
CREATE INDEX IF NOT EXISTS idx_service_histories_patient_id ON service_histories(patient_id);

-- Create index for faster queries by created_at (for sorting)
CREATE INDEX IF NOT EXISTS idx_service_histories_created_at ON service_histories(created_at DESC);

-- Create index for invoice_number lookups
CREATE INDEX IF NOT EXISTS idx_service_histories_invoice_number ON service_histories(invoice_number);

-- Enable Row Level Security (RLS)
ALTER TABLE service_histories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view service histories for their patients
CREATE POLICY "Users can view service histories for their patients"
    ON service_histories FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patients
            WHERE clinic_id = auth.jwt() ->> 'clinic_id'
        )
    );

-- RLS Policy: Users can insert service histories for their patients
CREATE POLICY "Users can insert service histories for their patients"
    ON service_histories FOR INSERT
    WITH CHECK (
        patient_id IN (
            SELECT id FROM patients
            WHERE clinic_id = auth.jwt() ->> 'clinic_id'
        )
    );

-- RLS Policy: Users can update service histories for their patients
CREATE POLICY "Users can update service histories for their patients"
    ON service_histories FOR UPDATE
    USING (
        patient_id IN (
            SELECT id FROM patients
            WHERE clinic_id = auth.jwt() ->> 'clinic_id'
        )
    );

-- RLS Policy: Users can delete service histories for their patients
CREATE POLICY "Users can delete service histories for their patients"
    ON service_histories FOR DELETE
    USING (
        patient_id IN (
            SELECT id FROM patients
            WHERE clinic_id = auth.jwt() ->> 'clinic_id'
        )
    );

-- Create trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_service_histories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_service_histories_updated_at ON service_histories;
CREATE TRIGGER trg_service_histories_updated_at
    BEFORE UPDATE ON service_histories
    FOR EACH ROW
    EXECUTE FUNCTION update_service_histories_updated_at();
