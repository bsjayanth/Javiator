import os

from celery import Celery


os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    'config.settings'
)

app = Celery('javiator')

app.config_from_object(
    'django.conf:settings',
    namespace='CELERY'
)

app.autodiscover_tasks([
    'tracking',
    'dispatch',
])


# CELERY BEAT SCHEDULE

app.conf.beat_schedule = {

    # Vehicle movement simulation

    'update-vehicles-every-5-seconds': {

        'task':
        'tracking.tasks.update_vehicle_locations',

        'schedule': 5.0,
    },

    # Auto dispatch engine

    'auto-dispatch-every-1-seconds': {

        'task':
        'dispatch.tasks.auto_dispatch',

        'schedule': 1.0,
    },

    # Delivery lifecycle simulation

    'delivery-simulation-every-10-seconds': {

        'task':
        'dispatch.tasks.run_delivery_simulation',

        'schedule': 10.0,
    },
}