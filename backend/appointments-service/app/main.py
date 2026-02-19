from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.database import init_db
from app.api.v1.endpoints import router, public_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("✅ Appointments Service DB initialized (Clean Architecture)")
    yield


app = FastAPI(
    title="ANSAR Appointments Service",
    version="1.0.0",
    description="Microservicio de Citas y Ortodoncia – Clínica Dental ANSAR",
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
app.include_router(public_router)


@app.get("/health")
async def health():
    return {"service": "appointments-service", "status": "ok"}
