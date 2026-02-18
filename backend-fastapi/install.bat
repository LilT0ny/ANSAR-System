@echo off
echo ==========================================
echo   ANSAR System - Backend Microservices
echo   Instalando dependencias...
echo ==========================================

cd /d "%~dp0"

echo.
echo [1/5] Auth Service...
cd auth-service
python -m pip install -r requirements.txt -q
cd ..

echo [2/5] Patients Service...
cd patients-service
python -m pip install -r requirements.txt -q
cd ..

echo [3/5] Appointments Service...
cd appointments-service
python -m pip install -r requirements.txt -q
cd ..

echo [4/5] Notifications Service...
cd notifications-service
python -m pip install -r requirements.txt -q
cd ..

echo [5/5] API Gateway...
cd gateway
python -m pip install -r requirements.txt -q
cd ..

echo.
echo ==========================================
echo   Todas las dependencias instaladas!
echo ==========================================
echo.
pause
