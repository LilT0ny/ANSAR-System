from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime


# ── Patient ─────────────────────────────────────────────────────
class PatientCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=80)
    last_name: str = Field(..., min_length=1, max_length=80)
    document_id: str = Field(..., min_length=1, max_length=30)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    city: Optional[str] = None


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None


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
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Clinical History ────────────────────────────────────────────
class ClinicalHistoryCreate(BaseModel):
    patient_id: int
    record_type: str = Field(..., pattern="^(general|treatment|note)$")
    title: Optional[str] = None
    content: Optional[str] = None


class ClinicalHistoryResponse(BaseModel):
    id: int
    patient_id: int
    record_type: str
    title: Optional[str] = None
    content: Optional[str] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None

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
