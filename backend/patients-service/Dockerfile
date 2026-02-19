FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY patients-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy common library
COPY common/ ./common/

# Copy service code
COPY patients-service/app/ ./app/

EXPOSE 8002

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
