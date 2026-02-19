from common.core.config import BaseAppSettings
from functools import lru_cache

class Settings(BaseAppSettings):
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "Clínica Dental AN-SAR"
    SMTP_FROM_EMAIL: str = "no-reply@clinicadental.com"
    USE_CONSOLE_EMAIL: bool = True
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
