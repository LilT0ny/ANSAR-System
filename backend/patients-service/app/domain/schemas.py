from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


# ── Patient ─────────────────────────────────────────────────────
class PatientCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=80)
    last_name: str = Field(..., min_length=1, max_length=80)
    document_id: str = Field(..., min_length=1, max_length=30)
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    city: Optional[str] = None
    gender: Optional[str] = Field(default=None, pattern="^(masculino|femenino|otro)$")
    debt: Optional[Decimal] = 0.00


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    gender: Optional[str] = Field(default=None, pattern="^(masculino|femenino|otro)$")
    debt: Optional[Decimal] = None
    date_of_birth: Optional[date] = None
    email: Optional[str] = None


class PatientResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    document_id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    city: Optional[str] = None
    gender: Optional[str] = None
    debt: Optional[Decimal] = 0.00
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Clinical History ────────────────────────────────────────────
class ClinicalHistoryCreate(BaseModel):
    patient_id: int

    # 1. Motivo de consulta
    motivo_consulta: Optional[str] = None

    # 2. Antecedentes Patológicos
    hipertension: Optional[bool] = False
    enfermedad_cardiaca: Optional[bool] = False
    enfermedad_cardiaca_cual: Optional[str] = None
    diabetes: Optional[bool] = False
    hemorragias: Optional[bool] = False
    alergico: Optional[bool] = False
    alergico_cual: Optional[str] = None
    vih: Optional[bool] = False
    embarazada: Optional[bool] = False
    embarazada_semanas: Optional[int] = None
    medicamentos_en_uso: Optional[bool] = False
    medicamentos_cual: Optional[str] = None
    otras_enfermedades: Optional[bool] = False
    otras_enfermedades_cual: Optional[str] = None
    antecedentes_familiares: Optional[str] = None

    # 3. Antecedentes Estomatológicos
    golpes_cara_dientes: Optional[bool] = False
    ulceras_bucales: Optional[bool] = False
    sangrado_encias: Optional[bool] = False
    cepillado_veces_dia: Optional[int] = None
    ultima_visita_odontologo: Optional[str] = None

    # Doctor asignado
    doctor_asignado_id: Optional[int] = None


class ClinicalHistoryUpdate(BaseModel):
    motivo_consulta: Optional[str] = None
    hipertension: Optional[bool] = None
    enfermedad_cardiaca: Optional[bool] = None
    enfermedad_cardiaca_cual: Optional[str] = None
    diabetes: Optional[bool] = None
    hemorragias: Optional[bool] = None
    alergico: Optional[bool] = None
    alergico_cual: Optional[str] = None
    vih: Optional[bool] = None
    embarazada: Optional[bool] = None
    embarazada_semanas: Optional[int] = None
    medicamentos_en_uso: Optional[bool] = None
    medicamentos_cual: Optional[str] = None
    otras_enfermedades: Optional[bool] = None
    otras_enfermedades_cual: Optional[str] = None
    antecedentes_familiares: Optional[str] = None
    golpes_cara_dientes: Optional[bool] = None
    ulceras_bucales: Optional[bool] = None
    sangrado_encias: Optional[bool] = None
    cepillado_veces_dia: Optional[int] = None
    ultima_visita_odontologo: Optional[str] = None
    doctor_asignado_id: Optional[int] = None


class ClinicalHistoryResponse(BaseModel):
    id: int
    patient_id: int
    motivo_consulta: Optional[str] = None
    hipertension: Optional[bool] = False
    enfermedad_cardiaca: Optional[bool] = False
    enfermedad_cardiaca_cual: Optional[str] = None
    diabetes: Optional[bool] = False
    hemorragias: Optional[bool] = False
    alergico: Optional[bool] = False
    alergico_cual: Optional[str] = None
    vih: Optional[bool] = False
    embarazada: Optional[bool] = False
    embarazada_semanas: Optional[int] = None
    medicamentos_en_uso: Optional[bool] = False
    medicamentos_cual: Optional[str] = None
    otras_enfermedades: Optional[bool] = False
    otras_enfermedades_cual: Optional[str] = None
    antecedentes_familiares: Optional[str] = None
    golpes_cara_dientes: Optional[bool] = False
    ulceras_bucales: Optional[bool] = False
    sangrado_encias: Optional[bool] = False
    cepillado_veces_dia: Optional[int] = None
    ultima_visita_odontologo: Optional[str] = None
    doctor_asignado_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Odontogram ──────────────────────────────────────────────────
class OdontogramUpdate(BaseModel):
    data: dict


class OdontogramResponse(BaseModel):
    id: int
    patient_id: int
    data: dict
    updated_by: Optional[int] = None
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True
