from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_scheme = HTTPBearer()

def create_access_token(user_id: int, secret_key: str, algorithm: str, expire_minutes: int) -> str:
    """Creates a JWT token."""
    to_encode = {"sub": str(user_id)}
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt

def verify_token(token: str, secret_key: str, algorithm: str) -> int:
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        user_id = payload.get("sub")
        if user_id is None:
            raise JWTError()
        return int(user_id)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Dependency factory for easier usage in services
def get_current_user_id(secret_key: str, algorithm: str):
    async def dependency(creds: HTTPAuthorizationCredentials = Depends(security_scheme)):
        return verify_token(creds.credentials, secret_key, algorithm)
    return dependency
