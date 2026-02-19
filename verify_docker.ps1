$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando Docker..."
# Ensure Docker Compose runs
docker compose up -d

Write-Host "⏳ Esperando Gateway..."
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -ErrorAction SilentlyContinue
        if ($res -and $res.status -eq "ok") { $ready = $true; break }
    }
    catch { }
    Write-Host -NoNewline "."
    Start-Sleep 5
}

if (-not $ready) { Write-Error "`n❌ Timeout esperando Gateway."; exit 1 }

Write-Host "`n✅ Servicios OK"

Write-Host "📧 Enviando correo..."
try {
    $body = @{to = "test@docker.com"; subject = "Docker Test"; body = "Hola mundo" } | ConvertTo-Json -Compress
    $res = Invoke-RestMethod "http://localhost:8000/api/v1/notifications/send-email" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Resultado: $($res.messsage)"
    
    Write-Host "📜 Logs:"
    docker compose logs --tail=5 notifications-service
}
catch {
    Write-Error "Fallo envio: $_"
}

Write-Host "`n🌍 Frontend (3000):"
try {
    $f = Invoke-WebRequest "http://localhost:3000" -Method Head -ErrorAction SilentlyContinue
    Write-Host "Status: $($f.StatusCode)"
}
catch {
    Write-Host "Frontend no disponible."
}
