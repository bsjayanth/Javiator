import os

from celery import Celery


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("javiator")

# Load Celery configuration (including CELERY_BEAT_SCHEDULE) from Django settings.
app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks(["tracking", "dispatch"])
