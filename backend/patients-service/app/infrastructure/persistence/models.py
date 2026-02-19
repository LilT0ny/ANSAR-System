from sqlalchemy import Column, Integer, String, Date, DateTime, Text, JSON
from sqlalchemy.sql import func
from common.infrastructure.db import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(80), nullable=False)
    last_name = Column(String(80), nullable=False)
    document_id = Column(String(30), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    phone = Column(String(30), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ClinicalHistory(Base):
    __tablename__ = "clinical_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, nullable=False, index=True)
    record_type = Column(String(50), nullable=False)  # general | treatment | note
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)  # user_id from auth service
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Odontogram(Base):
    __tablename__ = "odontograms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, unique=True, nullable=False, index=True)
    data = Column(JSON, default={})
    updated_by = Column(Integer, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
