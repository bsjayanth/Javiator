FROM python:3.11

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY backend/ /app/

# 🔥 CRITICAL FIX
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=config.settings

# Run server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]