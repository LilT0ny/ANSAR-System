from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas import (
    AppointmentCreate, AppointmentUpdate, AppointmentResponse,
    OrthoBlockCreate, OrthoBlockResponse,
    PublicBookingRequest, AvailabilityResponse,
)
from app import service

router = APIRouter(tags=["Appointments"])
public_router = APIRouter(prefix="/api/v1/public", tags=["Public"])


# ── Protected: Appointments ─────────────────────────────────────
@router.get("/api/v1/appointments", response_model=List[AppointmentResponse])
async def list_appointments(
    doctor_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await service.list_appointments(db, doctor_id, start_date, end_date)


@router.post("/api/v1/appointments", response_model=AppointmentResponse, status_code=201)
async def create_appointment(
    body: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await service.create_appointment(db, body.model_dump())


@router.patch("/api/v1/appointments/{appointment_id}", response_model=AppointmentResponse)
async def update_status(
    appointment_id: int,
    body: AppointmentUpdate,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await service.update_appointment_status(db, appointment_id, body.status)


# ── Protected: Ortho Blocks ────────────────────────────────────
@router.get("/api/v1/ortho-blocks", response_model=List[OrthoBlockResponse])
async def list_ortho_blocks(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await service.list_ortho_blocks(db)


@router.post("/api/v1/ortho-blocks", response_model=OrthoBlockResponse, status_code=201)
async def create_ortho_block(
    body: OrthoBlockCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    return await service.create_ortho_block(db, body.model_dump(), user["id"])


@router.delete("/api/v1/ortho-blocks/{block_id}", status_code=204)
async def delete_ortho_block(block_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    await service.delete_ortho_block(db, block_id)


# ── Public: Availability & Booking ──────────────────────────────
@public_router.get("/availability", response_model=AvailabilityResponse)
async def get_availability(date: str = Query(...), db: AsyncSession = Depends(get_db)):
    return await service.get_availability(db, date)


@public_router.get("/ortho-dates")
async def get_ortho_dates(db: AsyncSession = Depends(get_db)):
    dates = await service.get_ortho_dates(db)
    return {"dates": dates}


@public_router.post("/book-ortho")
async def public_book_ortho(body: PublicBookingRequest, db: AsyncSession = Depends(get_db)):
    return await service.public_booking(db, body.model_dump())
