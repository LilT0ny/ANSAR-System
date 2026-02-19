from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.database import init_db
from app.api.v1.endpoints import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("✅ Patients Service DB initialized (Clean Architecture)")
    yield


app = FastAPI(
    title="ANSAR Patients Service",
    version="1.0.0",
    description="Microservicio de pacientes – Clínica Dental ANSAR",
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


@app.get("/health")
async def health():
    return {"service": "patients-service", "status": "ok"}
