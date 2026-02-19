from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from common.infrastructure.db import Base
from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    from app.infrastructure.persistence import models
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
