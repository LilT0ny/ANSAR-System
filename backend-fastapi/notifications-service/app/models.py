from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    appointment_id = Column(Integer, nullable=True, index=True)
    patient_id = Column(Integer, nullable=True, index=True)
    recipient_email = Column(String(255), nullable=True)
    notification_type = Column(String(30), default="EMAIL")  # EMAIL | SMS | WHATSAPP
    status = Column(String(20), default="PENDING")  # PENDING | SENT | FAILED
    subject = Column(String(255), nullable=True)
    message_content = Column(Text, nullable=True)
    error_detail = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
