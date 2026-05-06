from django.urls import path
from .consumers import VehicleConsumer

websocket_urlpatterns = [
    path('ws/vehicles/', VehicleConsumer.as_asgi()),
]