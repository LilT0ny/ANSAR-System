from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import get_settings
from common.auth.security import verify_token

settings = get_settings()
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = verify_token(credentials.credentials, settings.JWT_SECRET, settings.JWT_ALGORITHM)
    return {"id": user_id}

async def optional_auth(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))):
    if not credentials:
        return None
    try:
        user_id = verify_token(credentials.credentials, settings.JWT_SECRET, settings.JWT_ALGORITHM)
        return {"id": user_id}
    except Exception:
        return None
