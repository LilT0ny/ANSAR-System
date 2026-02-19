from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

def init_postgres(database_url: str, echo: bool = False):
    """Initializes the database connection and returns engine and session_maker."""
    engine = create_async_engine(database_url, echo=echo, future=True)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    return engine, async_session

# Simple alias for dependencies
async def get_db_session(session_maker):
    async with session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
