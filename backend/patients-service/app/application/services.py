from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.infrastructure.persistence.models import Patient, ClinicalHistory, Odontogram


# ── Patient CRUD ────────────────────────────────────────────────
async def list_patients(db: AsyncSession):
    result = await db.execute(select(Patient).order_by(Patient.created_at.desc()))
    return result.scalars().all()


async def get_patient(db: AsyncSession, patient_id: int):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado.")
    return patient


async def search_patients(db: AsyncSession, query: str):
    result = await db.execute(
        select(Patient).where(
            (Patient.first_name.ilike(f"%{query}%"))
            | (Patient.last_name.ilike(f"%{query}%"))
            | (Patient.document_id.ilike(f"%{query}%"))
        )
    )
    return result.scalars().all()


async def create_patient(db: AsyncSession, data: dict):
    # Check duplicate document_id (UNIQUE constraint)
    existing = await db.execute(
        select(Patient).where(Patient.document_id == data["document_id"])
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Ya existe un paciente con este documento de identidad."
        )

    patient = Patient(**data)
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient


async def update_patient(db: AsyncSession, patient_id: int, data: dict):
    patient = await get_patient(db, patient_id)
    for key, value in data.items():
        if value is not None:
            setattr(patient, key, value)
    await db.commit()
    await db.refresh(patient)
    return patient


async def delete_patient(db: AsyncSession, patient_id: int):
    patient = await get_patient(db, patient_id)
    await db.delete(patient)
    await db.commit()


# ── Clinical History ────────────────────────────────────────────
async def get_clinical_history(db: AsyncSession, patient_id: int):
    """Get the clinical history record for a patient (one record per patient)."""
    result = await db.execute(
        select(ClinicalHistory)
        .where(ClinicalHistory.patient_id == patient_id)
        .order_by(ClinicalHistory.created_at.desc())
    )
    return result.scalars().all()


async def get_clinical_history_single(db: AsyncSession, patient_id: int):
    """Get or return None for the single clinical history of a patient."""
    result = await db.execute(
        select(ClinicalHistory).where(ClinicalHistory.patient_id == patient_id)
    )
    return result.scalar_one_or_none()


async def create_clinical_record(db: AsyncSession, data: dict, user_id: int):
    record = ClinicalHistory(**data, created_by=user_id)
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def upsert_clinical_history(db: AsyncSession, patient_id: int, data: dict, user_id: int):
    """Create or update the clinical history for a patient."""
    existing = await get_clinical_history_single(db, patient_id)

    if existing:
        for key, value in data.items():
            if key not in ("patient_id", "id") and value is not None:
                setattr(existing, key, value)
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        record = ClinicalHistory(patient_id=patient_id, created_by=user_id, **data)
        db.add(record)
        await db.commit()
        await db.refresh(record)
        return record


# ── Odontogram ──────────────────────────────────────────────────
async def get_odontogram(db: AsyncSession, patient_id: int):
    result = await db.execute(select(Odontogram).where(Odontogram.patient_id == patient_id))
    odon = result.scalar_one_or_none()
    if not odon:
        return {"data": {}}
    return odon


async def upsert_odontogram(db: AsyncSession, patient_id: int, data: dict, user_id: int):
    result = await db.execute(select(Odontogram).where(Odontogram.patient_id == patient_id))
    odon = result.scalar_one_or_none()

    if odon:
        odon.data = data
        odon.updated_by = user_id
    else:
        odon = Odontogram(patient_id=patient_id, data=data, updated_by=user_id)
        db.add(odon)

    await db.commit()
    await db.refresh(odon)
    return odon
