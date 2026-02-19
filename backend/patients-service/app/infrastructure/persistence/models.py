from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Boolean, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from common.infrastructure.db import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(80), nullable=False)
    last_name = Column(String(80), nullable=False)
    document_id = Column(String(30), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(30), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)    # masculino | femenino | otro
    debt = Column(Numeric(12, 2), nullable=False, default=0.00, server_default="0.00")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ClinicalHistory(Base):
    __tablename__ = "clinical_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, nullable=False, index=True)

    # 1. Motivo de consulta
    motivo_consulta = Column(Text, nullable=True)

    # 2. Antecedentes Patológicos – cuestionario
    hipertension = Column(Boolean, default=False)
    enfermedad_cardiaca = Column(Boolean, default=False)
    enfermedad_cardiaca_cual = Column(String(255), nullable=True)
    diabetes = Column(Boolean, default=False)
    hemorragias = Column(Boolean, default=False)
    alergico = Column(Boolean, default=False)
    alergico_cual = Column(String(255), nullable=True)
    vih = Column(Boolean, default=False)
    embarazada = Column(Boolean, default=False)
    embarazada_semanas = Column(Integer, nullable=True)
    medicamentos_en_uso = Column(Boolean, default=False)
    medicamentos_cual = Column(String(255), nullable=True)
    otras_enfermedades = Column(Boolean, default=False)
    otras_enfermedades_cual = Column(String(255), nullable=True)
    antecedentes_familiares = Column(Text, nullable=True)

    # 3. Antecedentes Estomatológicos
    golpes_cara_dientes = Column(Boolean, default=False)
    ulceras_bucales = Column(Boolean, default=False)
    sangrado_encias = Column(Boolean, default=False)
    cepillado_veces_dia = Column(Integer, nullable=True)
    ultima_visita_odontologo = Column(Text, nullable=True)

    # Doctor asignado
    doctor_asignado_id = Column(Integer, nullable=True)

    # Metadata
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Odontogram(Base):
    __tablename__ = "odontograms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, unique=True, nullable=False, index=True)
    data = Column(JSONB, default={}, server_default="{}")
    updated_by = Column(Integer, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
