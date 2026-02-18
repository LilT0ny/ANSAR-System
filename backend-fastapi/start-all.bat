@echo off
echo ==========================================
echo   ANSAR System - Starting All Services
echo ==========================================

cd /d "%~dp0"

echo Starting Auth Service on port 8001...
start "Auth Service" cmd /k "cd /d %~dp0auth-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 2 /nobreak >nul

echo Starting Patients Service on port 8002...
start "Patients Service" cmd /k "cd /d %~dp0patients-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload"

timeout /t 2 /nobreak >nul

echo Starting Appointments Service on port 8003...
start "Appointments Service" cmd /k "cd /d %~dp0appointments-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload"

timeout /t 2 /nobreak >nul

echo Starting Notifications Service on port 8004...
start "Notifications Service" cmd /k "cd /d %~dp0notifications-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload"

timeout /t 2 /nobreak >nul

echo Starting API Gateway on port 8000...
start "API Gateway" cmd /k "cd /d %~dp0gateway && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo ==========================================
echo   All services started!
echo ==========================================
echo.
echo   Gateway:        http://localhost:8000
echo   Auth:           http://localhost:8001
echo   Patients:       http://localhost:8002
echo   Appointments:   http://localhost:8003
echo   Notifications:  http://localhost:8004
echo.
echo   Swagger Docs:
echo   - http://localhost:8000/docs (Gateway)
echo   - http://localhost:8001/docs (Auth)
echo   - http://localhost:8002/docs (Patients)
echo   - http://localhost:8003/docs (Appointments)
echo   - http://localhost:8004/docs (Notifications)
echo.
pause
