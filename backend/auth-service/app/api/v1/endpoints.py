from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_db
from app.domain.schemas import RegisterRequest, LoginRequest, AuthResponse, UserResponse, OTPRequest, OTPVerifyRequest, MessageResponse
from app.application.services import register_user, login_user, request_otp, verify_otp
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user (doctor/admin/assistant)."""
    result = await register_user(db, body.full_name, body.email, body.password, body.role)
    return result


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Standard login (email/password). Now mostly for initial admin access."""
    result = await login_user(db, body.email, body.password)
    return result


@router.post("/request-otp", response_model=MessageResponse)
async def request_otp_endpoint(body: OTPRequest, db: AsyncSession = Depends(get_db)):
    """Request a 6-digit code to be sent to the user's email."""
    result = await request_otp(db, body.email)
    return result


@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp_endpoint(body: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify the 6-digit code and return JWT token."""
    result = await verify_otp(db, body.email, body.code)
    return result


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    """Get current authenticated user profile."""
    return current_user
