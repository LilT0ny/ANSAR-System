from datetime import datetime, date, timedelta
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
import httpx

from app.models import Appointment, OrthoBlock
from app.config import get_settings

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

    # Notify via notifications service (fire-and-forget)
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{settings.NOTIFICATIONS_SERVICE_URL}/api/v1/notifications/appointment-created",
                json={
                    "appointment_id": appointment.id,
                    "patient_id": appointment.patient_id,
                    "start_time": str(appointment.start_time),
                    "reason": appointment.reason or "Consulta",
                },
                timeout=3.0,
            )
    except Exception:
        pass  # Don't fail the appointment if notification fails

    return appointment


async def update_appointment_status(db: AsyncSession, appointment_id: int, status: str):
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appt = result.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")

    appt.status = status
    await db.commit()
    await db.refresh(appt)
    return appt


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

    # Fire notification
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{settings.NOTIFICATIONS_SERVICE_URL}/api/v1/notifications/send-email",
                json={
                    "to": data.get("email", ""),
                    "subject": "Confirmación de Cita – Ortodoncia",
                    "body": f"Hola {data['full_name']},\n\nTu cita de ortodoncia ha sido reservada para el {target_date} a las {time_str}.\n\nClínica Dental AN-SAR",
                },
                timeout=5.0,
            )
    except Exception:
        pass

    return {
        "message": "Cita de ortodoncia reservada con éxito.",
        "appointment_id": appointment.id,
        "date": str(target_date),
        "time": time_str,
    }
