import os
from datetime import timedelta
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


# =====================================================
# BASE DIRECTORY
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent


def _csv_env(name: str, default: str) -> list[str]:
    return [
        item.strip().rstrip("/")
        for item in os.getenv(name, default).split(",")
        if item.strip()
    ]


def _build_database_config() -> dict:
    conn_max_age = int(os.getenv("DB_CONN_MAX_AGE", "60"))
    database_url = os.getenv("DATABASE_URL", "").strip()

    if database_url:
        parsed = urlparse(database_url)
        scheme = parsed.scheme.lower()

        if scheme in ("postgres", "postgresql", "pgsql"):
            query = parse_qs(parsed.query)
            options = {
                key: values[0]
                for key, values in query.items()
                if values and key in ("sslmode", "connect_timeout", "channel_binding")
            }
            config = {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": unquote(parsed.path.lstrip("/")),
                "USER": unquote(parsed.username or ""),
                "PASSWORD": unquote(parsed.password or ""),
                "HOST": parsed.hostname or "",
                "PORT": str(parsed.port or 5432),
                "CONN_MAX_AGE": conn_max_age,
            }
            if options:
                config["OPTIONS"] = options
            return config

        if scheme == "sqlite":
            raw_path = unquote(parsed.path)
            if raw_path in ("/:memory:", ":memory:"):
                db_name = ":memory:"
            else:
                db_name = raw_path
                if db_name.startswith("/") and len(db_name) > 2 and db_name[2] == ":":
                    db_name = db_name[1:]
                db_name = db_name or str(BASE_DIR / "db.sqlite3")
            return {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": db_name,
            }

        raise ValueError(f"Unsupported DATABASE_URL scheme: {parsed.scheme}")

    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "javiator"),
        "USER": os.getenv("POSTGRES_USER", "admin"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "admin"),
        "HOST": os.getenv("POSTGRES_HOST", "db"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
        "CONN_MAX_AGE": conn_max_age,
    }


def _build_channel_layers() -> dict:
    backend = os.getenv("CHANNEL_LAYER_BACKEND", "redis").strip().lower()
    if backend == "memory":
        return {
            "default": {
                "BACKEND": "channels.layers.InMemoryChannelLayer",
            }
        }

    redis_url = os.getenv("REDIS_URL", "").strip()
    hosts = (
        [redis_url]
        if redis_url
        else [(os.getenv("REDIS_HOST", "redis"), int(os.getenv("REDIS_PORT", "6379")))]
    )
    return {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": hosts,
            },
        }
    }


# =====================================================
# SECURITY
# =====================================================

DEBUG = os.getenv("DEBUG", "True").strip().lower() == "true"

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")

if not SECRET_KEY:
    if DEBUG:
        # Local development fallback ONLY.
        # Configure DJANGO_SECRET_KEY in production.
        SECRET_KEY = "local-development-only-insecure-key"
    else:
        raise ValueError(
            "DJANGO_SECRET_KEY must be configured when DEBUG=False."
        )

ALLOWED_HOSTS = _csv_env(
    "DJANGO_ALLOWED_HOSTS",
    "localhost,127.0.0.1,web",
)

# Trust reverse-proxy HTTPS headers (e.g., Render, Caddy, Nginx)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True
SECURE_CONTENT_TYPE_NOSNIFF = True

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True


# =====================================================
# INSTALLED APPS
# =====================================================

INSTALLED_APPS = [
    # Django default
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "channels",

    # Local apps
    "accounts.apps.AccountsConfig",
    "fleet",
    "orders",
    "dispatch",
    "tracking",
    "analytics",
    "notifications",
]


# =====================================================
# MIDDLEWARE
# =====================================================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# =====================================================
# ROOT URL
# =====================================================

ROOT_URLCONF = "config.urls"


# =====================================================
# TEMPLATES
# =====================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# =====================================================
# WSGI / ASGI
# =====================================================

WSGI_APPLICATION = "config.wsgi.application"

ASGI_APPLICATION = "config.asgi.application"


# =====================================================
# DATABASE
# =====================================================

DATABASES = {
    "default": _build_database_config(),
}


# =====================================================
# CUSTOM USER
# =====================================================

AUTH_USER_MODEL = "accounts.User"


# =====================================================
# PASSWORD VALIDATION
# =====================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# =====================================================
# DJANGO REST FRAMEWORK
# =====================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}


# =====================================================
# SIMPLE JWT
# =====================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# =====================================================
# CHANNELS + REDIS
# =====================================================

CHANNEL_LAYER_BACKEND = os.getenv("CHANNEL_LAYER_BACKEND", "redis").strip().lower()
REDIS_URL = os.getenv("REDIS_URL", "").strip()
CHANNEL_LAYERS = _build_channel_layers()


# =====================================================
# CELERY
# =====================================================

CELERY_BROKER_URL = (
    os.getenv("CELERY_BROKER_URL", "").strip()
    or REDIS_URL
    or "redis://redis:6379/0"
)

CELERY_ACCEPT_CONTENT = ["json"]

CELERY_TASK_SERIALIZER = "json"

CELERY_RESULT_SERIALIZER = "json"

CELERY_TIMEZONE = "UTC"


# =====================================================
# CELERY BEAT SCHEDULE
# =====================================================

CELERY_BEAT_SCHEDULE = {
    # Vehicle live tracking
    "update-vehicles-every-5-seconds": {
        "task": "tracking.tasks.update_vehicle_locations",
        "schedule": 5.0,
    },

    # Auto dispatch
    "auto-dispatch-every-5-seconds": {
        "task": "dispatch.tasks.auto_dispatch",
        "schedule": 5.0,
    },
}


# =====================================================
# STATIC FILES
# =====================================================

STATIC_URL = "/static/"

STATICFILES_DIRS = (
    [BASE_DIR / "static"]
    if (BASE_DIR / "static").exists()
    else []
)

STATIC_ROOT = BASE_DIR / "staticfiles"


# =====================================================
# MEDIA FILES
# =====================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# =====================================================
# INTERNATIONALIZATION
# =====================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# =====================================================
# CORS
# =====================================================

DEFAULT_LOCAL_ORIGINS = (
    "http://localhost:3000,"
    "http://127.0.0.1:3000,"
    "http://localhost:5173,"
    "http://localhost:5174"
)

CORS_ALLOWED_ORIGINS = _csv_env(
    "CORS_ALLOWED_ORIGINS",
    DEFAULT_LOCAL_ORIGINS,
)

CORS_ALLOW_CREDENTIALS = True


# =====================================================
# CSRF
# =====================================================

CSRF_TRUSTED_ORIGINS = _csv_env(
    "CSRF_TRUSTED_ORIGINS",
    DEFAULT_LOCAL_ORIGINS,
)


# =====================================================
# LOGGING
# =====================================================

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "[%(asctime)s] %(levelname)s %(name)s: %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
    },
}


# =====================================================
# DEFAULT PRIMARY KEY
# =====================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
