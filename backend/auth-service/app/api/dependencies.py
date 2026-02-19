from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import get_settings
from common.auth.security import verify_token

settings = get_settings()
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Decodes the JWT token and returns the user payload (e.g. user_id).
    Exceptions are handled inside verify_token.
    """
    user_id = verify_token(credentials.credentials, settings.JWT_SECRET, settings.JWT_ALGORITHM)
    return {"id": user_id}

async def require_role(role: str):
    # This dependency logic might be complex if it needs DB access
    # For now, it's a placeholder or simple check if token has role
    pass
