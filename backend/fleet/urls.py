from django.urls import path

from .views import (
    VehicleListAPIView,
    fleet_kpis,
    simulate_vehicle_movement
)

urlpatterns = [

    path(
        "vehicles/",
        VehicleListAPIView.as_view(),
        name="fleet-vehicles"
    ),

    path(
        "kpis/",
        fleet_kpis,
        name="fleet-kpis"
    ),

    path(
        "simulate/",
        simulate_vehicle_movement,
        name="simulate-vehicles"
    ),

]