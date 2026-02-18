from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas import (
    PatientCreate, PatientUpdate, PatientResponse,
    ClinicalHistoryCreate, ClinicalHistoryResponse,
    OdontogramUpdate, OdontogramResponse,
)
from app import service

router = APIRouter(prefix="/api/v1/patients", tags=["Patients"])


# ── Patient CRUD ────────────────────────────────────────────────
@router.get("/", response_model=List[PatientResponse])
async def list_patients(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await service.list_patients(db)


@router.get("/search", response_model=List[PatientResponse])
async def search_patients(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await service.search_patients(db, q)


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await service.get_patient(db, patient_id)


@router.post("/", response_model=PatientResponse, status_code=201)
async def create_patient(body: PatientCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await service.create_patient(db, body.model_dump())


@router.patch("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: int, body: PatientUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    return await service.update_patient(db, patient_id, body.model_dump(exclude_unset=True))


@router.delete("/{patient_id}", status_code=204)
async def delete_patient(patient_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    await service.delete_patient(db, patient_id)


# ── Clinical History ────────────────────────────────────────────
@router.get("/{patient_id}/history", response_model=List[ClinicalHistoryResponse])
async def get_clinical_history(
    patient_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    return await service.get_clinical_history(db, patient_id)


@router.post("/{patient_id}/history", response_model=ClinicalHistoryResponse, status_code=201)
async def create_history_record(
    patient_id: int,
    body: ClinicalHistoryCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    data = body.model_dump()
    data["patient_id"] = patient_id
    return await service.create_clinical_record(db, data, user["id"])


# ── Odontogram ──────────────────────────────────────────────────
@router.get("/{patient_id}/odontogram")
async def get_odontogram(patient_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await service.get_odontogram(db, patient_id)


@router.post("/{patient_id}/odontogram")
async def update_odontogram(
    patient_id: int,
    body: OdontogramUpdate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    return await service.upsert_odontogram(db, patient_id, body.data, user["id"])
