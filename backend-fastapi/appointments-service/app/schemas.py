from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


# ── Appointment ─────────────────────────────────────────────────
class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: Optional[int] = None
    start_time: datetime
    end_time: datetime
    reason: Optional[str] = "Consulta General"
    appointment_type: Optional[str] = Field(default="general", pattern="^(general|ortodoncia)$")


class AppointmentUpdate(BaseModel):
    status: str = Field(..., pattern="^(pendiente|confirmada|completada|cancelada)$")


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: Optional[int] = None
    start_time: datetime
    end_time: datetime
    reason: Optional[str] = None
    status: str
    appointment_type: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Ortho Block ─────────────────────────────────────────────────
class OrthoBlockCreate(BaseModel):
    date: date
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$", examples=["12:00"])
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$", examples=["17:00"])
    label: Optional[str] = None


class OrthoBlockResponse(BaseModel):
    id: int
    date: date
    start_time: str
    end_time: str
    label: Optional[str] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Public Booking ──────────────────────────────────────────────
class PublicBookingRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5)
    phone: Optional[str] = None
    date: date
    time: str = Field(..., pattern=r"^\d{2}:\d{2}$")


class AvailabilityResponse(BaseModel):
    date: str
    available: List[str]
