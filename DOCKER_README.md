# Sistema ANSAR (Clínica Dental)

## 🐳 Despliegue con Docker

### Prerrequisitos
- Docker Desktop instalado y corriendo

### Instrucciones

1. **Iniciar todo:**
   Ejecuta `start-docker.bat` o:
   ```powershell
   docker compose up -d
   ```

2. **Detener todo:**
   Ejecuta `stop-docker.bat` o:
   ```powershell
    docker compose down
   ```

3. **Verificación:**
   Ejecuta el script de prueba:
   ```powershell
   powershell -File simple_verify.ps1
   ```

### 📧 Configuración de Email Real
Para enviar correos reales (Gmail, Outlook, etc.), edita `docker-compose.yml` en la sección `notifications-service`:

```yaml
    environment:
      USE_CONSOLE_EMAIL: "false"  <-- Cambiar a "false"
      SMTP_HOST: smtp.gmail.com
      SMTP_PORT: 587
      SMTP_USER: tu_email@gmail.com
      SMTP_PASSWORD: tu_app_password
```

### 🌐 Accesos
- **Frontend:** http://localhost:3000
- **Gateway API:** http://localhost:8000
- **Swagger Docs:**
  - http://localhost:8000/docs
  - http://localhost:8001/docs (Auth)
  - http://localhost:8002/docs (Pacientes)
  - http://localhost:8004/docs (Notificaciones)

### 🗄️ Base de Datos
El proyecto usa 4 bases de datos PostgreSQL independientes, inicializadas automáticamente con los scripts en `backend-fastapi/*/init.sql`.
