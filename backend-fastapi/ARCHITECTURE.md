# ANSAR System – Backend Microservices Architecture

## 🏗️ Arquitectura

```
                    ┌──────────────────────┐
                    │   Frontend (React)    │
                    │   http://localhost:5173│
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │    API Gateway        │
                    │  http://localhost:8000 │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                     │
┌─────────▼────────┐ ┌────────▼────────┐ ┌─────────▼────────┐
│  Auth Service    │ │ Patients Service│ │Appointments Svc  │
│  :8001           │ │ :8002           │ │ :8003             │
│  SQLite auth.db  │ │ SQLite patients │ │ SQLite appts.db  │
└──────────────────┘ └─────────────────┘ └────────┬─────────┘
                                                   │
                                          ┌────────▼────────┐
                                          │Notifications Svc │
                                          │  :8004            │
                                          │  SQLite notifs.db │
                                          └─────────────────┘
```

## 📦 Microservicios

| # | Servicio               | Puerto | BD               | Responsabilidades                              |
|---|------------------------|--------|------------------|-------------------------------------------------|
| 1 | **auth-service**       | 8001   | auth.db          | Registro, login, JWT, gestión de usuarios       |
| 2 | **patients-service**   | 8002   | patients.db      | CRUD pacientes, historia clínica, odontograma   |
| 3 | **appointments-service** | 8003 | appointments.db  | Citas, bloques ortodoncia, disponibilidad       |
| 4 | **notifications-service** | 8004 | notifications.db | Emails, recordatorios, logs de notificaciones  |
| 5 | **gateway**            | 8000   | —                | API Gateway, proxy reverso, CORS                |

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
cd backend-fastapi
install.bat    # Windows
```

### 2. Arrancar todos los servicios
```bash
start-all.bat  # Abre 5 terminales, una por servicio
```

### 3. Verificar salud
```
GET http://localhost:8000/health
```

### 4. Documentación automática (Swagger)
- Gateway:        http://localhost:8000/docs
- Auth:           http://localhost:8001/docs
- Patients:       http://localhost:8002/docs
- Appointments:   http://localhost:8003/docs
- Notifications:  http://localhost:8004/docs

## 🔑 Flujo de Autenticación

1. **Register** → `POST /api/v1/auth/register` → devuelve JWT
2. **Login** → `POST /api/v1/auth/login` → devuelve JWT
3. **Usar token** → `Authorization: Bearer <token>` en los headers
4. **Validación** → Cada servicio valida JWT localmente (shared secret)

## 📧 Sistema de Emails

- **Modo Console** (por defecto): los emails se imprimen en la terminal del notifications-service
- **Modo SMTP real**: configurar en `.env` del notifications-service:
  ```
  USE_CONSOLE_EMAIL=false
  SMTP_HOST=smtp.gmail.com
  SMTP_USER=tu_email@gmail.com
  SMTP_PASSWORD=tu_app_password
  ```

## 📡 API Endpoints

### Auth Service (/api/v1/auth)
- `POST /register` – Registrar usuario
- `POST /login` – Iniciar sesión
- `GET /me` – Perfil del usuario autenticado

### Patients Service (/api/v1/patients)
- `GET /` – Listar pacientes
- `GET /search?q=` – Buscar pacientes
- `GET /{id}` – Obtener paciente
- `POST /` – Crear paciente
- `PATCH /{id}` – Actualizar paciente
- `DELETE /{id}` – Eliminar paciente
- `GET /{id}/history` – Historia clínica
- `POST /{id}/history` – Agregar registro clínico
- `GET /{id}/odontogram` – Obtener odontograma
- `POST /{id}/odontogram` – Actualizar odontograma

### Appointments Service (/api/v1/appointments)
- `GET /` – Listar citas
- `POST /` – Crear cita
- `PATCH /{id}` – Actualizar estado
- `GET /api/v1/ortho-blocks` – Listar bloques ortodoncia
- `POST /api/v1/ortho-blocks` – Crear bloque
- `DELETE /api/v1/ortho-blocks/{id}` – Eliminar bloque

### Public Routes (/api/v1/public) – Sin autenticación
- `GET /availability?date=YYYY-MM-DD` – Slots disponibles
- `GET /ortho-dates` – Fechas con bloques de ortodoncia
- `POST /book-ortho` – Reservar cita de ortodoncia

### Notifications Service (/api/v1/notifications)
- `POST /send-email` – Enviar email
- `POST /appointment-created` – Evento: cita creada
- `GET /logs` – Ver logs de notificaciones

## 🛠 Stack Tecnológico

- **Framework:** FastAPI (Python 3.12)
- **BD:** SQLite con SQLAlchemy 2.0 (async)
- **Auth:** JWT (python-jose) + bcrypt (passlib)
- **Email:** aiosmtplib + templates HTML
- **Validación:** Pydantic v2
- **Gateway:** httpx reverse proxy
