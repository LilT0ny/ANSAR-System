@echo off
echo ==========================================
echo   ANSAR System - Stopping All Services
echo ==========================================

:: Kill processes on ports 8000-8004
for /L %%p in (8000,1,8004) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo Stopping PID %%a on port %%p...
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo.
echo All services stopped.
pause
