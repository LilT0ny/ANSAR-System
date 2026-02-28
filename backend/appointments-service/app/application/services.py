from datetime import datetime, date, timedelta
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
import httpx
import asyncio

from app.infrastructure.persistence.models import Appointment, OrthoBlock
from app.core.config import get_settings
from app.infrastructure.google_calendar import create_google_calendar_event

settings = get_settings()


# ── Appointments ────────────────────────────────────────────────
async def list_appointments(db: AsyncSession, doctor_id: int = None, start_date: str = None, end_date: str = None):
    query = select(Appointment).order_by(Appointment.start_time.asc())

    conditions = []
    if doctor_id:
        conditions.append(Appointment.doctor_id == doctor_id)
    if start_date and end_date:
        conditions.append(Appointment.start_time >= start_date)
        conditions.append(Appointment.end_time <= end_date)

    if conditions:
        query = query.where(and_(*conditions))

    result = await db.execute(query)
    return result.scalars().all()


async def create_appointment(db: AsyncSession, data: dict):
    # Check overlap
    overlap = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.doctor_id == data.get("doctor_id"),
                Appointment.status != "cancelada",
                Appointment.start_time < data["end_time"],
                Appointment.end_time > data["start_time"],
            )
        )
    )
    if overlap.scalars().first():
        raise HTTPException(status_code=409, detail="El doctor ya tiene una cita en este horario.")

    appointment = Appointment(**data)
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)

    # Fetch patient details from patients-service
    patient_name = "Paciente"
    patient_email = "paciente@demo.com"
    try:
        async with httpx.AsyncClient() as client:
            # We assume PATIENTS_SERVICE_URL is available in settings
            patient_resp = await client.get(
                f"{settings.PATIENTS_SERVICE_URL}/api/v1/patients/{appointment.patient_id}",
                timeout=3.0
            )
            if patient_resp.status_code == 200:
                patient_data = patient_resp.json()
                patient_name = f"{patient_data.get('first_name', '')} {patient_data.get('last_name', '')}".strip() or "Paciente"
                patient_email = patient_data.get('email', patient_email)
    except Exception as e:
        print(f"Failed to fetch patient details for appointment {appointment.id}: {e}")

    # Fire background notification & Google Calendar
    try:
        async with httpx.AsyncClient() as client:
            # Notificar al paciente (Email de reserva creada)
            await client.post(
                f"{settings.NOTIFICATIONS_SERVICE_URL}/api/v1/notifications/appointment-created",
                json={
                    "appointment_id": appointment.id,
                    "patient_id": appointment.patient_id,
                    "patient_name": patient_name,
                    "patient_email": patient_email,
                    "start_time": appointment.start_time.isoformat(),
                    "reason": appointment.reason
                },
                timeout=5.0,
            )
            # Notificar al doctor (UI de la campana)
            await client.post(
                f"{settings.NOTIFICATIONS_SERVICE_URL}/api/v1/notifications/appointment-event",
                json={
                    "appointment_id": appointment.id,
                    "patient_id": appointment.patient_id,
                    "patient_name": patient_name,
                    "patient_email": patient_email,
                    "start_time": appointment.start_time.isoformat(),
                    "reason": appointment.reason
                },
                timeout=5.0,
            )

    except Exception as e:
        print(f"Failed to send notifications: {e}")

    return appointment


async def update_appointment(db: AsyncSession, appointment_id: int, data: dict):
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")

    for key, value in data.items():
        if value is not None:
            setattr(appt, key, value)
    await db.commit()
    await db.refresh(appt)
    return appt


async def delete_appointment(db: AsyncSession, appointment_id: int):
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")
    await db.delete(appt)
    await db.commit()


# ── Ortho Blocks ────────────────────────────────────────────────
async def list_ortho_blocks(db: AsyncSession):
    result = await db.execute(select(OrthoBlock).order_by(OrthoBlock.date.asc()))
    return result.scalars().all()


async def create_ortho_block(db: AsyncSession, data: dict, user_id: int):
    # Validate times
    if data["start_time"] >= data["end_time"]:
        raise HTTPException(status_code=400, detail="La hora de inicio debe ser antes de la hora de fin.")

    # Check for past dates
    if data["date"] < date.today():
        raise HTTPException(status_code=400, detail="No se puede crear un bloque en una fecha pasada.")

    # Check overlap on same date
    existing = await db.execute(
        select(OrthoBlock).where(
            and_(
                OrthoBlock.date == data["date"],
                OrthoBlock.start_time < data["end_time"],
                OrthoBlock.end_time > data["start_time"],
            )
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Ya existe un bloque en esa fecha y horario.")

    block = OrthoBlock(**data, created_by=user_id)
    db.add(block)
    await db.commit()
    await db.refresh(block)
    return block


async def delete_ortho_block(db: AsyncSession, block_id: int):
    result = await db.execute(select(OrthoBlock).where(OrthoBlock.id == block_id))
    block = result.scalar_one_or_none()
    if not block:
        raise HTTPException(status_code=404, detail="Bloque no encontrado.")
    await db.delete(block)
    await db.commit()


# ── Public Availability ─────────────────────────────────────────
async def get_availability(db: AsyncSession, date_str: str):
    """Get available time slots for a date based on ortho blocks minus booked appointments."""
    target_date = datetime.strptime(date_str, "%Y-%m-%d").date()

    # Get ortho blocks for this date
    blocks_result = await db.execute(
        select(OrthoBlock).where(OrthoBlock.date == target_date)
    )
    blocks = blocks_result.scalars().all()

    if not blocks:
        return {"date": date_str, "available": []}

    # Generate all 30-min slots from blocks
    all_slots = []
    for block in blocks:
        sh, sm = map(int, block.start_time.split(":"))
        eh, em = map(int, block.end_time.split(":"))
        current = sh * 60 + sm
        end = eh * 60 + em
        while current < end:
            h, m = divmod(current, 60)
            all_slots.append(f"{h:02d}:{m:02d}")
            current += 30

    # Get booked appointments for this date
    day_start = datetime(target_date.year, target_date.month, target_date.day, 0, 0)
    day_end = datetime(target_date.year, target_date.month, target_date.day, 23, 59)

    booked_result = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.start_time >= day_start,
                Appointment.start_time <= day_end,
                Appointment.status != "cancelada",
            )
        )
    )
    booked = booked_result.scalars().all()
    booked_times = set()
    for appt in booked:
        if isinstance(appt.start_time, str):
            dt = datetime.fromisoformat(appt.start_time)
        else:
            dt = appt.start_time
        booked_times.add(f"{dt.hour:02d}:{dt.minute:02d}")

    available = [s for s in all_slots if s not in booked_times]
    return {"date": date_str, "available": available}


async def get_general_availability(db: AsyncSession, date_str: str):
    """Get available time slots for general booking minus already booked appointments."""
    target_date = datetime.strptime(date_str, "%Y-%m-%d").date()

    # Clinic hours used in the frontend form
    all_slots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
    ]

    # Get booked appointments for this date
    day_start = datetime(target_date.year, target_date.month, target_date.day, 0, 0)
    day_end = datetime(target_date.year, target_date.month, target_date.day, 23, 59)

    booked_result = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.start_time >= day_start,
                Appointment.start_time <= day_end,
                Appointment.status != "cancelada",
            )
        )
    )
    booked = booked_result.scalars().all()
    booked_times = set()
    for appt in booked:
        if isinstance(appt.start_time, str):
            dt = datetime.fromisoformat(appt.start_time)
        else:
            dt = appt.start_time
        booked_times.add(f"{dt.hour:02d}:{dt.minute:02d}")

    available = [s for s in all_slots if s not in booked_times]
    return {"date": date_str, "available": available}


async def get_ortho_dates(db: AsyncSession):
    """Get all dates that have ortho blocks (for the patient calendar)."""
    result = await db.execute(
        select(OrthoBlock.date).where(OrthoBlock.date >= date.today()).distinct()
    )
    dates = [str(row[0]) for row in result.all()]
    return dates


async def public_booking(db: AsyncSession, data: dict):
    """Create appointment from public ortho booking page."""
    target_date = data["date"]
    time_str = data["time"]

    # Verify ortho block exists for this date/time
    blocks = await db.execute(
        select(OrthoBlock).where(
            and_(
                OrthoBlock.date == target_date,
                OrthoBlock.start_time <= time_str,
                OrthoBlock.end_time > time_str,
            )
        )
    )
    if not blocks.scalars().first():
        raise HTTPException(status_code=400, detail="Este horario no está disponible para ortodoncia.")

    # Create start/end datetime
    start_dt = datetime(target_date.year, target_date.month, target_date.day,
                        int(time_str.split(":")[0]), int(time_str.split(":")[1]))
    end_dt = start_dt + timedelta(minutes=30)

    # Check if slot is already taken
    existing = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.start_time == start_dt,
                Appointment.status != "cancelada",
            )
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Este horario acaba de ser tomado. Elige otro.")

    appointment = Appointment(
        patient_id=0,  # Will be resolved or created in a real system
        start_time=start_dt,
        end_time=end_dt,
        reason=f"Ortodoncia – {data['full_name']}",
        status="pendiente",
        appointment_type="ortodoncia",
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)

    # Fire notification and GCal
    try:
        async with httpx.AsyncClient() as client:
            # Send HTML email 
            await client.post(
                f"{settings.NOTIFICATIONS_SERVICE_URL}/api/v1/notifications/appointment-created",
                json={
                    "appointment_id": appointment.id,
                    "patient_id": appointment.patient_id,
                    "patient_name": data['full_name'],
                    "patient_email": data.get("email", ""),
                    "start_time": f"{target_date} {time_str}",
                    "reason": appointment.reason
                },
                timeout=5.0,
            )
            # Send in-app notification to the doctor/clinic
            await client.post(
                f"{settings.NOTIFICATIONS_SERVICE_URL}/api/v1/notifications/appointment-event",
                json={
                    "appointment_id": appointment.id,
                    "patient_id": appointment.patient_id,
                    "patient_name": data['full_name'],
                    "patient_email": data.get("email", ""),
                    "start_time": f"{target_date} {time_str}",
                    "reason": appointment.reason
                },
                timeout=5.0,
            )
            
    except Exception as e:
        print(f"Failed to send notifications for public ortho booking: {e}")

    return {
        "message": "Cita de ortodoncia reservada con éxito.",
        "appointment_id": appointment.id,
        "date": str(target_date),
        "time": time_str,
    }

async def public_booking_general(db: AsyncSession, data: dict):
    """Create appointment from public general booking page."""
    target_date = data["date"]
    time_str = data["time"]

    # In a fully implemented system, we'd check general availability here. 
    # For now (as requested by the current scope), we allow it but check for direct overlaps
    
    # Create start/end datetime
    start_dt = datetime(target_date.year, target_date.month, target_date.day,
                        int(time_str.split(":")[0]), int(time_str.split(":")[1]))
    end_dt = start_dt + timedelta(minutes=30)
    service_type = data.get("service", "General")

    # Check if slot is already taken for the clinic (ignoring doctor_id for public bookings)
    existing = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.start_time == start_dt,
                Appointment.status != "cancelada",
            )
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Este horario acaba de ser tomado. Elige otro.")

    appointment = Appointment(
        patient_id=0,  # Will be resolved or created in a real system
        start_time=start_dt,
        end_time=end_dt,
        reason=f"{service_type} – {data['full_name']}",
        status="pendiente",
        appointment_type="general",
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)

    # Fire patient email notification
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.NOTIFICATIONS_SERVICE_URL}/api/v1/notifications/appointment-created",
                json={
                    "appointment_id": appointment.id,
                    "patient_id": appointment.patient_id,
                    "patient_name": data['full_name'],
                    "patient_email": data.get("email", ""),
                    "start_time": f"{target_date} {time_str}",
                    "reason": appointment.reason
                },
                timeout=30.0,
            )
            print(f"✅ Patient email notification: {resp.status_code}")
    except Exception as e:
        import traceback
        print(f"❌ Failed to send patient notification: {e}\n{traceback.format_exc()}")

    # Fire doctor email notification (independent)
    try:
        async with httpx.AsyncClient() as client:
            resp2 = await client.post(
                f"{settings.NOTIFICATIONS_SERVICE_URL}/api/v1/notifications/appointment-event",
                json={
                    "appointment_id": appointment.id,
                    "patient_id": appointment.patient_id,
                    "patient_name": data['full_name'],
                    "patient_email": data.get("email", ""),
                    "start_time": f"{target_date} {time_str}",
                    "reason": appointment.reason
                },
                timeout=30.0,
            )
            print(f"✅ Doctor email notification: {resp2.status_code}")
    except Exception as e:
        import traceback
        print(f"❌ Failed to send doctor notification: {e}\n{traceback.format_exc()}")

    return {
        "message": "Cita general reservada con éxito.",
        "appointment_id": appointment.id,
        "date": str(target_date),
        "time": time_str,
    }
