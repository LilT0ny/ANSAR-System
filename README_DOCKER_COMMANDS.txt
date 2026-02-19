=========================================
ANSAR SYSTEM - COMANDOS DE EJECUCIÓN
=========================================

1. LIMPIEZA TOTAL (Borra datos antiguos y contenedores)
   ----------------------------------------------------
   docker compose down -v

2. CONSTRUIR Y EJECUTAR (NUEVO CLEAN ARCHITECTURE)
   ------------------------------------------------
   docker compose up --build -d

   (El flag -d lo corre en segundo plano)

3. VERIFICAR LOGS EN TIEMPO REAL
   -----------------------------
   docker compose logs -f

4. CREAR USUARIO ADMIN
   -------------------
   Powershell:
   .\create_admin.ps1

5. VERIFICAR QUE TODO FUNCIONA (HEALTH CHECK)
   ------------------------------------------
   Powershell:
   .\verify_services.ps1

6. ACCESOS
   -------
   Frontend:      http://localhost:3000
   Gateway API:   http://localhost:8000
   Auth Service:  http://localhost:8001
   ...etc...

NOTA: Todas las contraseñas y puertos están en el archivo '.env' en esta misma carpeta.
