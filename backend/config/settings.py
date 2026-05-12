from pathlib import Path

from celery.schedules import crontab


BASE_DIR = Path(__file__).resolve().parent.parent


# =========================================
# SECURITY
# =========================================

SECRET_KEY = "django-insecure-rr7y=y-#^!x1%zak(u(g*a++s_9b%720xi-3$em^9&42q#$s(p"

DEBUG = True

ALLOWED_HOSTS = [
    "*"
]


# =========================================
# INSTALLED APPS
# =========================================

INSTALLED_APPS = [

    # THIRD PARTY

    "corsheaders",

    "rest_framework",

    "channels",

    # DJANGO

    "django.contrib.admin",

    "django.contrib.auth",

    "django.contrib.contenttypes",

    "django.contrib.sessions",

    "django.contrib.messages",

    "django.contrib.staticfiles",

    # LOCAL APPS

    "users",

    "fleet",

    "orders",

    "dispatch",

    "tracking",

    "analytics",
]


# =========================================
# MIDDLEWARE
# =========================================

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


# =========================================
# URLS
# =========================================

ROOT_URLCONF = "config.urls"


# =========================================
# TEMPLATES
# =========================================

TEMPLATES = [
    {
        "BACKEND":
        "django.template.backends.django.DjangoTemplates",

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


# =========================================
# WSGI / ASGI
# =========================================

WSGI_APPLICATION = "config.wsgi.application"

ASGI_APPLICATION = "config.asgi.application"


# =========================================
# DATABASE
# =========================================

DATABASES = {

    "default": {

        "ENGINE":
        "django.db.backends.sqlite3",

        "NAME":
        BASE_DIR / "db.sqlite3",
    }
}


# =========================================
# AUTH USER
# =========================================

AUTH_USER_MODEL = "users.User"


# =========================================
# CHANNELS + REDIS
# =========================================

CHANNEL_LAYERS = {

    "default": {

        "BACKEND":
        "channels_redis.core.RedisChannelLayer",

        "CONFIG": {

            "hosts": [
                ("redis", 6379)
            ],
        },
    },
}


# =========================================
# CELERY
# =========================================

CELERY_BROKER_URL = "redis://redis:6379/0"

CELERY_ACCEPT_CONTENT = ["json"]

CELERY_TASK_SERIALIZER = "json"


# =========================================
# CELERY BEAT
# =========================================

CELERY_BEAT_SCHEDULE = {

    "update-vehicles-every-5-seconds": {

        "task":
        "tracking.tasks.update_vehicle_locations",

        "schedule": 5.0,
    },

    "auto-dispatch-every-5-seconds": {

        "task":
        "dispatch.tasks.auto_dispatch",

        "schedule": 5.0,
    },
}


# =========================================
# STATIC FILES
# =========================================

STATIC_URL = "static/"


# =========================================
# INTERNATIONALIZATION
# =========================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# =========================================
# CORS
# =========================================

CORS_ALLOWED_ORIGINS = [

    "http://localhost:3000",

    "http://localhost:5174",
]

CORS_ALLOW_CREDENTIALS = True


# =========================================
# DEFAULT PRIMARY KEY
# =========================================

DEFAULT_AUTO_FIELD = (
    "django.db.models.BigAutoField"
)