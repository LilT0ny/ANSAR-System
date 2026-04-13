// =============================================
// MEDICORE - TIPOS TypeScript
// =============================================

// 1. USER (Doctor)
export interface User {
    id: string;
    email: string;
    password_hash?: string;
    full_name: string;
    specialty?: string;
    phone?: string;
    avatar_url?: string;
    clinic_name?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

// 2. PATIENT (Paciente)
export interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    document_id: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    address?: string;
    city?: string;
    gender?: 'masculino' | 'femenino' | 'otro';
    debt: number;
    created_at?: string;
    updated_at?: string;
}

// 3. APPOINTMENT (Cita)
export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id?: string;
    date: string;
    start_time: string;
    end_time: string;
    reason: string;
    status: 'pendiente' | 'confirmada' | 'completada' | 'anulada';
    type: 'general' | 'ortodoncia';
    notes?: string;
    attended: boolean;
    created_at?: string;
    updated_at?: string;
}

// 4. CLINICAL_HISTORY (Historia Clínica)
export interface ClinicalHistory {
    id: string;
    patient_id: string;
    motivo_consulta?: string;
    // Patológicos
    hipertension: boolean;
    enfermedad_cardiaca: boolean;
    enfermedad_cardiaca_cual?: string;
    diabetes: boolean;
    hemorragias: boolean;
    alergico: boolean;
    alergico_cual?: string;
    vih: boolean;
    embarazada: boolean;
    embarazada_semanas?: number;
    medicamentos_en_uso: boolean;
    medicamentos_cual?: string;
    otras_enfermedades: boolean;
    otras_enfermedades_cual?: string;
    antecedentes_familiares?: string;
    // Estomatológicos
    golpes_cara_dientes: boolean;
    ulceras_bucales: boolean;
    sangrado_encias: boolean;
    cepillado_veces_dia?: number;
    ultima_visita_odontologo?: string;
    created_at?: string;
    updated_at?: string;
}

// 5. ODONTOGRAM (Odontograma)
export interface Odontogram {
    id: string;
    patient_id: string;
    data: Record<string, any>;
    notes?: string;
    updated_by?: string;
    created_at?: string;
    updated_at?: string;
}

// 6. SCHEDULE (Horario)
export interface Schedule {
    id: string;
    user_id: string;
    day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    start_time: string;
    end_time: string;
    is_enabled: boolean;
    created_at?: string;
    updated_at?: string;
}

// 7. SERVICE (Servicio)
export interface Service {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

// 8. INVOICE (Factura)
export interface Invoice {
    id: string;
    patient_id: string;
    appointment_id?: string;
    invoice_number: string;
    description?: string;
    amount: number;
    discount: number;
    subtotal: number;
    payment_method?: 'efectivo' | 'tarjeta' | 'transferencia';
    status: 'pendiente' | 'pagado' | 'cancelado';
    due_date?: string;
    paid_at?: string;
    created_at?: string;
    updated_at?: string;
}
