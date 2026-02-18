from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
from functools import lru_cache
import httpx


class Settings(BaseSettings):
    AUTH_SERVICE_URL: str = "http://localhost:8001"
    PATIENTS_SERVICE_URL: str = "http://localhost:8002"
    APPOINTMENTS_SERVICE_URL: str = "http://localhost:8003"
    NOTIFICATIONS_SERVICE_URL: str = "http://localhost:8004"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


# ── Route mapping ───────────────────────────────────────────────
ROUTE_MAP = {
    "/api/v1/auth": "AUTH_SERVICE_URL",
    "/api/v1/patients": "PATIENTS_SERVICE_URL",
    "/api/v1/appointments": "APPOINTMENTS_SERVICE_URL",
    "/api/v1/ortho-blocks": "APPOINTMENTS_SERVICE_URL",
    "/api/v1/public": "APPOINTMENTS_SERVICE_URL",
    "/api/v1/notifications": "NOTIFICATIONS_SERVICE_URL",
}


def resolve_service(path: str) -> str | None:
    """Find which service should handle this path."""
    settings = get_settings()
    for prefix, setting_key in ROUTE_MAP.items():
        if path.startswith(prefix):
            return getattr(settings, setting_key)
    return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.client = httpx.AsyncClient(timeout=30.0)
    print("✅ API Gateway started")
    print("   Auth:          http://localhost:8001")
    print("   Patients:      http://localhost:8002")
    print("   Appointments:  http://localhost:8003")
    print("   Notifications: http://localhost:8004")
    yield
    await app.state.client.aclose()


app = FastAPI(
    title="ANSAR API Gateway",
    version="1.0.0",
    description="API Gateway – Clínica Dental ANSAR (Microservices)",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Gateway health check – also pings all services."""
    settings = get_settings()
    client: httpx.AsyncClient = app.state.client
    services = {
        "auth": settings.AUTH_SERVICE_URL,
        "patients": settings.PATIENTS_SERVICE_URL,
        "appointments": settings.APPOINTMENTS_SERVICE_URL,
        "notifications": settings.NOTIFICATIONS_SERVICE_URL,
    }
    statuses = {}
    for name, url in services.items():
        try:
            r = await client.get(f"{url}/health", timeout=3.0)
            statuses[name] = r.json() if r.status_code == 200 else "unhealthy"
        except Exception:
            statuses[name] = "unreachable"

    all_ok = all(isinstance(v, dict) and v.get("status") == "ok" for v in statuses.values())
    return {"service": "gateway", "status": "ok" if all_ok else "degraded", "services": statuses}


@app.api_route("/api/v1/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy(request: Request, path: str):
    """Reverse proxy: forward requests to the appropriate microservice."""
    full_path = f"/api/v1/{path}"
    service_url = resolve_service(full_path)

    if not service_url:
        return Response(content='{"detail":"Route not found"}', status_code=404, media_type="application/json")

    client: httpx.AsyncClient = request.app.state.client

    # Build target URL
    target_url = f"{service_url}{full_path}"
    if request.url.query:
        target_url += f"?{request.url.query}"

    # Forward headers (including Authorization)
    headers = dict(request.headers)
    headers.pop("host", None)

    try:
        body = await request.body()
        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
        )

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type", "application/json"),
        )
    except httpx.ConnectError:
        return Response(
            content='{"detail":"Service unavailable. Please try again later."}',
            status_code=503,
            media_type="application/json",
        )
    except httpx.TimeoutException:
        return Response(
            content='{"detail":"Service timeout. Please try again later."}',
            status_code=504,
            media_type="application/json",
        )
