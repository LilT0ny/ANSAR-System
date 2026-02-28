import random
import httpx
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.infrastructure.persistence.models import User, LoginOTP
from app.core.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def register_user(db: AsyncSession, full_name: str, email: str, password: str, role: str) -> dict:
    # Check if email exists
    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado.")

    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return {"status": "success", "token": token, "data": {"user": {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "active": user.active,
    }}}


async def login_user(db: AsyncSession, email: str, password: str) -> dict:
    """Standard login (email/password). Now only allowed for admins."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos.")

    if not user.active:
        raise HTTPException(status_code=403, detail="Cuenta desactivada. Contacta al administrador.")
    
    if user.role != "admin":
        raise HTTPException(
            status_code=403, 
            detail="Los doctores deben autenticarse mediante el código OTP enviado a su correo."
        )

    token = create_access_token(user.id)
    return {"status": "success", "token": token, "data": {"user": {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "active": user.active,
    }}}


async def request_otp(db: AsyncSession, email: str) -> dict:
    """Generates an OTP and sends it via notifications-service."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    if not user.active:
        raise HTTPException(status_code=403, detail="Cuenta desactivada. Contacta al administrador.")

    # Generate 6-digit OTP
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # Invalidate previous OTPs
    await db.execute(delete(LoginOTP).where(LoginOTP.email == email))

    new_otp = LoginOTP(
        email=email,
        otp_code=otp_code,
        expires_at=expires_at
    )
    db.add(new_otp)
    await db.commit()

    # Call Notifications Service
    try:
        url = f"{settings.NOTIFICATIONS_SERVICE_URL}/api/v1/notifications/send-otp"
        print(f"DEBUG: Calling notifications-service at {url}")
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                url,
                json={"email": email, "otp_code": otp_code},
                timeout=10.0
            )
            print(f"DEBUG: Notifications response: {resp.status_code} - {resp.text}")
            resp.raise_for_status()
    except Exception as e:
        print(f"ERROR calling notifications-service: {e}")
        # Log to stderr or similar if possible

    return {"status": "success", "message": "Código de verificación enviado al correo."}


async def verify_otp(db: AsyncSession, email: str, code: str) -> dict:
    """Verifies OTP and returns JWT token."""
    result = await db.execute(
        select(LoginOTP).where(
            LoginOTP.email == email,
            LoginOTP.otp_code == code,
            LoginOTP.used == False,
            LoginOTP.expires_at > datetime.now(timezone.utc)
        )
    )
    otp_record = result.scalar_one_or_none()
    if not otp_record:
        raise HTTPException(status_code=401, detail="Código inválido o expirado.")

    otp_record.used = True
    await db.commit()

    # Get user to create token
    user_res = await db.execute(select(User).where(User.email == email))
    user = user_res.scalar_one()

    token = create_access_token(user.id)
    return {"status": "success", "token": token, "data": {"user": {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "active": user.active,
    }}}


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
