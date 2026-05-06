from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-rr7y=y-#^!x1%zak(u(g*a++s_9b%720xi-3$em^9&42q#$s(p'

DEBUG = True
ALLOWED_HOSTS = []

# -------------------------------
# INSTALLED APPS
# -------------------------------
INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'channels',

    'users',
    'fleet',
    'orders',
    'dispatch',
    'tracking',
]

# -------------------------------
# MIDDLEWARE
# -------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# -------------------------------
# TEMPLATES
# -------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# -------------------------------
# ASGI / WSGI
# -------------------------------
WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# -------------------------------
# DATABASE (LOCAL for now)
# -------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'javiator',
        'USER': 'admin',
        'PASSWORD': 'admin',
        'HOST': 'db',  #  IMPORTANT CHANGE
        'PORT': '5432',
    }
}

# -------------------------------
# AUTH
# -------------------------------
AUTH_USER_MODEL = 'users.User'

# -------------------------------
# CHANNELS (Redis)
# -------------------------------
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],  # 🔥 FIXED
        },
    },
}

# -------------------------------
# CELERY
# -------------------------------
CELERY_BROKER_URL = 'redis://redis:6379/0'  # 🔥 FIXED
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'

# -------------------------------
# CELERY BEAT
# -------------------------------
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'update-vehicles-every-5-seconds': {
        'task': 'tracking.tasks.update_vehicle_locations',
        'schedule': 5.0,
    },
    'auto-dispatch-every-5-seconds': {
        'task': 'dispatch.tasks.auto_dispatch',
        'schedule': 5.0,
    },
}

# -------------------------------
# STATIC
# -------------------------------
STATIC_URL = 'static/'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'

USE_I18N = True
USE_TZ = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",
    "http://localhost:3000",
]

CORS_ALLOW_CREDENTIALS = True
