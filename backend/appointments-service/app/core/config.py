from common.core.config import BaseAppSettings
from functools import lru_cache

class Settings(BaseAppSettings):
    NOTIFICATIONS_SERVICE_URL: str = "http://notifications-service:8004"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
