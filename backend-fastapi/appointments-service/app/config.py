from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    JWT_SECRET: str = "ansar_super_secret_key_2026"
    JWT_ALGORITHM: str = "HS256"
    DATABASE_URL: str = "sqlite+aiosqlite:///./appointments.db"
    NOTIFICATIONS_SERVICE_URL: str = "http://localhost:8004"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
