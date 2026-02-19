FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias (Ruta relativa al contexto 'backend')
COPY gateway/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar configuración común (si se necesita)
COPY common/ ./common/

# Copiar código del gateway
COPY gateway/main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
