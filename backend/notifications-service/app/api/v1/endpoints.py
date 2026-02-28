from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_db
from app.domain.schemas import SendEmailRequest, SendOTPRequest, AppointmentCreatedEvent, NotificationLogResponse, MessageResponse
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


@router.post("/send-otp", response_model=MessageResponse)
async def send_otp(body: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    """Send an OTP code to a user."""
    html = service.build_otp_email_html(body.otp_code)
    log = await service.send_email(
        db,
        to=body.email,
        subject="Código de Verificación – AN-SAR",
        body=f"Tu código de acceso es: {body.otp_code}",
        html=html
    )
    return {"status": "success", "message": "OTP sent", "log_id": log.id}


@router.post("/appointment-created", response_model=MessageResponse)
async def on_appointment_created(body: AppointmentCreatedEvent, db: AsyncSession = Depends(get_db)):
    """Event handler: when a new appointment is created, send confirmation email."""
    html = service.build_patient_email_html(
        patient_name=body.patient_name,
        date_str=body.start_time,
        reason=body.reason or "Consulta General",
    )
    
    log = await service.send_email(
        db,
        to=body.patient_email,
        subject="Confirmación de Cita – Clínica Dental AN-SAR",
        body=f"Tu cita ha sido reservada para {body.start_time}. Motivo: {body.reason}",
        html=html,
        appointment_id=body.appointment_id,
        patient_id=body.patient_id,
    )
    return {"status": "success", "message": "Notification processed", "log_id": log.id}


@router.post("/appointment-event", response_model=MessageResponse)
async def on_appointment_event(body: AppointmentCreatedEvent, db: AsyncSession = Depends(get_db)):
    """Event handler: when a new appointment is created, notify the doctor."""
    from app.core.config import get_settings
    settings = get_settings()

    # Use the clinic email (SMTP_FROM_EMAIL) as the doctor's email
    doctor_email = settings.SMTP_FROM_EMAIL 

    try:
        html = service.build_doctor_email_html(
            patient_name=body.patient_name,
            patient_email=body.patient_email,
            date_str=body.start_time,
            reason=body.reason or "Consulta General",
        )
    except Exception as e:
        print(f"\u274c Error building doctor email HTML: {e}")
        html = f"<p>Nueva cita: {body.patient_name} - {body.start_time}</p>"
    
    log = await service.send_email(
        db,
        to=doctor_email,
        subject=f"Nueva Cita Programada - {body.patient_name}",
        body=f"Nueva cita reservada para {body.start_time} por {body.patient_name}.",
        html=html,
        appointment_id=body.appointment_id,
        patient_id=body.patient_id,
    )
    return {"status": "success", "message": "Doctor notified", "log_id": log.id}


@router.get("/doctor-notifications", response_model=List[NotificationLogResponse])
async def get_doctor_notifications(db: AsyncSession = Depends(get_db)):
    """Get recent notifications sent to the doctor/clinic."""
    from app.core.config import get_settings
    settings = get_settings()
    
    result = await db.execute(
        select(NotificationLog)
        .where(
            NotificationLog.recipient_email == settings.SMTP_FROM_EMAIL,
            NotificationLog.subject.like("Nueva Cita%"),
            NotificationLog.is_deleted == False,
            NotificationLog.is_read == False
        )
        .order_by(NotificationLog.created_at.desc())
        .limit(20)
    )
    return result.scalars().all()

@router.put("/doctor-notifications/{log_id}/read", response_model=MessageResponse)
async def mark_notification_read(log_id: int, db: AsyncSession = Depends(get_db)):
    """Mark a specific doctor notification as read."""
    result = await db.execute(select(NotificationLog).where(NotificationLog.id == log_id))
    log = result.scalars().first()
    if not log:
        return {"status": "error", "message": "Notification not found", "log_id": log_id}
    
    log.is_read = True
    await db.commit()
    return {"status": "success", "message": "Marked as read", "log_id": log_id}

@router.delete("/doctor-notifications/clear", response_model=MessageResponse)
async def clear_doctor_notifications(db: AsyncSession = Depends(get_db)):
    """Soft delete all doctor notifications."""
    from app.core.config import get_settings
    settings = get_settings()
    
    result = await db.execute(
        select(NotificationLog)
        .where(NotificationLog.recipient_email == settings.SMTP_FROM_EMAIL)
    )
    logs = result.scalars().all()
    for log in logs:
        log.is_deleted = True
    
    await db.commit()
    return {"status": "success", "message": "All notifications cleared", "log_id": None}


@router.get("/logs", response_model=List[NotificationLogResponse])
async def get_logs(db: AsyncSession = Depends(get_db)):
    """Get all notification logs (for admin dashboard)."""
    result = await db.execute(select(NotificationLog).order_by(NotificationLog.created_at.desc()).limit(100))
    return result.scalars().all()
