from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_db
from app.domain.schemas import SendEmailRequest, AppointmentCreatedEvent, NotificationLogResponse, MessageResponse
from app.infrastructure.persistence.models import NotificationLog
from app.application import services as service

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])


@router.post("/send-email", response_model=MessageResponse)
async def send_email(body: SendEmailRequest, db: AsyncSession = Depends(get_db)):
    """Send an email to a recipient. Used by other services or directly."""
    # Convert SendEmailRequest to arguments
    # body.to, body.subject, body.body, body.html are available if schema matches
    # Assuming schema has these fields based on usage
    log = await service.send_email(
        db, to=body.to, subject=body.subject, body=body.body, html=body.html
    )
    return {"status": "success" if log.status == "SENT" else "error", "message": f"Email {log.status.lower()}", "log_id": log.id}


@router.post("/appointment-created", response_model=MessageResponse)
async def on_appointment_created(body: AppointmentCreatedEvent, db: AsyncSession = Depends(get_db)):
    """Event handler: when a new appointment is created, send confirmation email.
    In a real system this would look up the patient email from patients-service."""
    html = service.build_appointment_email_html(
        patient_name=f"Paciente #{body.patient_id}",
        date_str=body.start_time,
        reason=body.reason or "Consulta",
    )
    # For demo, log to console. In production, fetch patient email from patients-service.
    # We use a dummy email because we don't have the patient's email here easily without calling back to patients-service.
    log = await service.send_email(
        db,
        to="paciente@demo.com",  # Would be fetched from patients-service
        subject="Confirmación de Cita – Clínica Dental AN-SAR",
        body=f"Tu cita ha sido reservada para {body.start_time}. Motivo: {body.reason}",
        html=html,
        appointment_id=body.appointment_id,
        patient_id=body.patient_id,
    )
    return {"status": "success", "message": "Notification processed", "log_id": log.id}


@router.get("/logs", response_model=List[NotificationLogResponse])
async def get_logs(db: AsyncSession = Depends(get_db)):
    """Get all notification logs (for admin dashboard)."""
    result = await db.execute(select(NotificationLog).order_by(NotificationLog.created_at.desc()).limit(100))
    return result.scalars().all()
