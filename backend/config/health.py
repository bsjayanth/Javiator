import logging
import os

import redis
from django.conf import settings
from django.db import DatabaseError, connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([AllowAny])
def healthz(request):
    """Lightweight liveness probe (no external dependency checks)."""
    return Response(
        {
            "status": "ok",
            "service": "javiator-api",
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def readyz(request):
    """Readiness probe verifying database and configured Redis connectivity."""
    checks = {}
    is_ready = True

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        checks["database"] = "ok"
    except DatabaseError:
        logger.warning("Readiness check failed for database.", exc_info=True)
        checks["database"] = "error"
        is_ready = False

    if getattr(settings, "CHANNEL_LAYER_BACKEND", "redis") == "memory":
        checks["redis"] = "skipped (in-memory channels)"
    else:
        redis_url = (
            getattr(settings, "REDIS_URL", "")
            or getattr(settings, "CELERY_BROKER_URL", "")
            or f"redis://{os.getenv('REDIS_HOST', 'redis')}:{os.getenv('REDIS_PORT', '6379')}/0"
        )
        try:
            client = redis.from_url(
                redis_url,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
            client.ping()
            checks["redis"] = "ok"
        except Exception:
            logger.warning("Readiness check failed for Redis.", exc_info=True)
            checks["redis"] = "error"
            is_ready = False

    return Response(
        {
            "status": "ready" if is_ready else "degraded",
            "checks": checks,
        },
        status=status.HTTP_200_OK if is_ready else status.HTTP_503_SERVICE_UNAVAILABLE,
    )
