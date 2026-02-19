from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class SendEmailRequest(BaseModel):
    to: EmailStr
    subject: str = Field(..., min_length=1)
    body: str = Field(..., min_length=1)
    html: Optional[str] = None  # Optional HTML body


class AppointmentCreatedEvent(BaseModel):
    appointment_id: int
    patient_id: int
    start_time: str
    reason: Optional[str] = "Consulta"


class NotificationLogResponse(BaseModel):
    id: int
    appointment_id: Optional[int] = None
    recipient_email: Optional[str] = None
    notification_type: str
    status: str
    subject: Optional[str] = None
    message_content: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    status: str
    message: str
    log_id: Optional[int] = None
