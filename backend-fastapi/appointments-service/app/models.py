from sqlalchemy import Column, Integer, String, DateTime, Date
from sqlalchemy.sql import func
from app.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, nullable=False, index=True)
    doctor_id = Column(Integer, nullable=True, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    reason = Column(String(255), default="Consulta General")
    status = Column(String(20), default="pendiente")  # pendiente | confirmada | completada | cancelada
    appointment_type = Column(String(30), default="general")  # general | ortodoncia
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class OrthoBlock(Base):
    __tablename__ = "ortho_blocks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(String(5), nullable=False)   # "12:00"
    end_time = Column(String(5), nullable=False)      # "17:00"
    label = Column(String(100), nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
