from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ── Request schemas ─────────────────────────────────────────────
class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120, examples=["Dr. Carlos López"])
    email: EmailStr = Field(..., examples=["carlos@clinica.com"])
    password: str = Field(..., min_length=6, max_length=128, examples=["miPassword123"])
    role: Optional[str] = Field(default="doctor", pattern="^(doctor|admin|assistant)$")


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["carlos@clinica.com"])
    password: str = Field(..., min_length=1, examples=["miPassword123"])


# ── Response schemas ────────────────────────────────────────────
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    status: str = "success"
    token: str
    data: dict


class MessageResponse(BaseModel):
    status: str
    message: str
