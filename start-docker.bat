@echo off
docker compose up -d
echo.
echo Espere unos minutos a que el frontend termine de compilar...
echo Frontend: http://localhost:3000
echo Gateway:  http://localhost:8000
echo.
echo Para ver logs: docker compose logs -f
pause
