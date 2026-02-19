from common.core.config import BaseAppSettings
from functools import lru_cache

class Settings(BaseAppSettings):
    # Auth Service Specific Config
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
