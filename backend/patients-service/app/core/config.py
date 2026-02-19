from common.core.config import BaseAppSettings
from functools import lru_cache

class Settings(BaseAppSettings):
    AUTH_SERVICE_URL: str = "http://auth-service:8001"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
