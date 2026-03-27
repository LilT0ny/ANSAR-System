export interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    document_id: string;
    email?: string | null;
    phone?: string | null;
    date_of_birth?: string | null;
    address?: string | null;
    city?: string | null;
    gender?: 'masculino' | 'femenino' | 'otro' | null;
    debt: number;
    created_at?: string;
    updated_at?: string;
}

export interface ClinicalHistory {
    id: string;
    patient_id: string;
    motivo_consulta?: string;
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
    golpes_cara_dientes: boolean;
    ulceras_bucales: boolean;
    sangrado_encias: boolean;
    cepillado_veces_dia?: number;
    ultima_visita_odontologo?: string;
    doctor_asignado_id?: string;
    created_at?: string;
}

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id?: string;
    start_time: string;
    end_time: string;
    reason: string;
    status: 'pendiente' | 'confirmada' | 'atendido' | 'rechazada' | 'anulada' | 'completada';
    appointment_type: 'general' | 'ortodoncia';
    appointment_date: string;
    appointment_time: string;
}

export interface OrthoBlock {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    label?: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'doctor';
}
