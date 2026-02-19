$ErrorActionPreference = "SilentlyContinue"

function Check-Service($Url, $Name) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name is UP" -ForegroundColor Green
        } else {
            Write-Host "❌ $Name returned $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $Name is DOWN or unreachable" -ForegroundColor Red
    }
}

Write-Host "`n🔍 Verifying AN-SAR System Services...`n" -ForegroundColor Cyan

Check-Service "http://localhost:8000/health" "API Gateway"
Check-Service "http://localhost:8001/health" "Auth Service"
Check-Service "http://localhost:8002/health" "Patients Service"
Check-Service "http://localhost:8003/health" "Appointments Service"
Check-Service "http://localhost:8004/health" "Notifications Service"
Check-Service "http://localhost:80" "Frontend"

Write-Host "`nIf services are down, ensure you have run 'docker compose up -d' or 'rebuild_all.bat'.`n" -ForegroundColor Gray
