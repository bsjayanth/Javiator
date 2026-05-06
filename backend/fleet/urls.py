from django.urls import path

from .views import (
    VehicleListAPIView,
    fleet_kpis
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

]