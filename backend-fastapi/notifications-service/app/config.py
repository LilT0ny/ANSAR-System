from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    JWT_SECRET: str = "ansar_super_secret_key_2026"
    JWT_ALGORITHM: str = "HS256"
    DATABASE_URL: str = "sqlite+aiosqlite:///./notifications.db"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "Clínica Dental AN-SAR"
    SMTP_FROM_EMAIL: str = "no-reply@clinicadental.com"

    USE_CONSOLE_EMAIL: bool = True  # Log instead of sending real emails

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
