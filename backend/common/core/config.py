from pydantic_settings import BaseSettings

class BaseAppSettings(BaseSettings):
    """
    Shared configuration for all microservices.
    Override specific fields in each service's config.py if needed.
    """
    JWT_SECRET: str = "ansar_super_secret_key_2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    
    # Default is blank, must be set in service
    DATABASE_URL: str
    
    # Environment control
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"
        extra = "ignore" # Important for avoiding errors with unused env vars
