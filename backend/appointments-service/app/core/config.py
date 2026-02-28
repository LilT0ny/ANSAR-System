from common.core.config import BaseAppSettings
from functools import lru_cache

class Settings(BaseAppSettings):
    # Microservice URLs
    NOTIFICATIONS_SERVICE_URL: str = "http://notifications-service:8004"
    PATIENTS_SERVICE_URL: str = "http://patients-service:8002"

    # Google Calendar Integration
    GOOGLE_APPLICATION_CREDENTIALS: str | None = None
    GOOGLE_CALENDAR_ID: str = "primary"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
