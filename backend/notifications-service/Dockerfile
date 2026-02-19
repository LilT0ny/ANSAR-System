FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY notifications-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy common library
COPY common/ ./common/

# Copy service code
COPY notifications-service/app/ ./app/

EXPOSE 8004

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004"]
