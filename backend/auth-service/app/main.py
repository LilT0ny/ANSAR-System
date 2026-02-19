from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.database import init_db
from app.api.v1.endpoints import router


from app.application.services import register_user
from app.infrastructure.database import get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 STARTING AUTH SERVICE LIFESPAN...", flush=True)
    try:
        await init_db()
        print("✅ COMPLETED INIT DB", flush=True)
        
        # Auto-create Admin User
        print("👤 Seeding Admin User...", flush=True)
        async for db in get_db():
            try:
                # Try to create user. If duplicates exist, service/DB will complain.
                # using 'admin' as password (5 chars)
                await register_user(db, "Dra. Ansar", "dra@ansar.com", "admin", "admin")
                print("✅ ADMIN USER CREATED: dra@ansar.com / admin", flush=True)
            except Exception as e:
                print(f"⚠️  Admin User Status: {e}", flush=True)
            # Break after one session usage
            break
            
    except Exception as e:
        print(f"❌ CRITICAL ERROR IN LIFESPAN: {e}", flush=True)
    yield


app = FastAPI(
    title="ANSAR Auth Service",
    version="1.0.0",
    description="Microservicio de autenticación – Clínica Dental ANSAR",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"UNHANDLED EXCEPTION: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": str(exc)})

@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"service": "auth-service", "status": "ok", "db": "connected"}
    except Exception as e:
        logger.error(f"DB Check Failed: {e}")
        return {"service": "auth-service", "status": "error", "db_error": str(e)}
