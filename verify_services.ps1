$ErrorActionPreference = "SilentlyContinue"

function Check-Service($Url, $Name) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] $Name is UP" -ForegroundColor Green
        } else {
            Write-Host "[FAIL] $Name returned $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "[FAIL] $Name is DOWN or unreachable" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Verifying AN-SAR System Services..." -ForegroundColor Cyan
Write-Host ""

Check-Service "http://localhost:8000/health" "API Gateway"
Check-Service "http://localhost:8001/health" "Auth Service"
Check-Service "http://localhost:8002/health" "Patients Service"
Check-Service "http://localhost:8003/health" "Appointments Service"
Check-Service "http://localhost:8004/health" "Notifications Service"
Check-Service "http://localhost:3000" "Frontend"

Write-Host ""
