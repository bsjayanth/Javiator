import os
from pathlib import Path
from datetime import timedelta


# =====================================================
# 🚀 BASE DIRECTORY
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# =====================================================
# 🚀 SECURITY
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

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "DJANGO_ALLOWED_HOSTS",
        "localhost,127.0.0.1,web",
    ).split(",")
    if host.strip()
]


# =====================================================
# 🚀 INSTALLED APPS
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
# 🚀 MIDDLEWARE
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
# 🚀 ROOT URL
# =====================================================

ROOT_URLCONF = "config.urls"


# =====================================================
# 🚀 TEMPLATES
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
# 🚀 WSGI / ASGI
# =====================================================

WSGI_APPLICATION = "config.wsgi.application"

ASGI_APPLICATION = "config.asgi.application"


# =====================================================
# 🚀 DATABASE
# =====================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# =====================================================
# 🚀 CUSTOM USER
# =====================================================

AUTH_USER_MODEL = "accounts.User"


# =====================================================
# 🚀 PASSWORD VALIDATION
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
# 🚀 DJANGO REST FRAMEWORK
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
# 🚀 SIMPLE JWT
# =====================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# =====================================================
# 🚀 CHANNELS + REDIS
# =====================================================

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [
                ("redis", 6379),
            ],
        },
    },
}


# =====================================================
# 🚀 CELERY
# =====================================================

CELERY_BROKER_URL = os.getenv(
    "CELERY_BROKER_URL",
    "redis://redis:6379/0",
)

CELERY_ACCEPT_CONTENT = ["json"]

CELERY_TASK_SERIALIZER = "json"

CELERY_RESULT_SERIALIZER = "json"

CELERY_TIMEZONE = "UTC"


# =====================================================
# 🚀 CELERY BEAT SCHEDULE
# =====================================================

CELERY_BEAT_SCHEDULE = {
    # Vehicle live tracking
    "update-vehicles-every-5-seconds": {
        "task": "tracking.tasks.update_vehicle_locations",
        "schedule": 5.0,
    },

    # AI auto dispatch
    "auto-dispatch-every-5-seconds": {
        "task": "dispatch.tasks.auto_dispatch",
        "schedule": 5.0,
    },
}


# =====================================================
# 🚀 STATIC FILES
# =====================================================

STATIC_URL = "/static/"

STATICFILES_DIRS = [
    BASE_DIR / "static",
]

STATIC_ROOT = BASE_DIR / "staticfiles"


# =====================================================
# 🚀 MEDIA FILES
# =====================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# =====================================================
# 🚀 INTERNATIONALIZATION
# =====================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# =====================================================
# 🚀 CORS
# =====================================================

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://localhost:5174",
]

CORS_ALLOW_CREDENTIALS = True


# =====================================================
# 🚀 CSRF
# =====================================================

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://localhost:5174",
]


# =====================================================
# 🚀 DEFAULT PRIMARY KEY
# =====================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
