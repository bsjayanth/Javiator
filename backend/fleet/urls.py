from django.urls import (
    path,
    include,
)

from rest_framework.routers import (
    DefaultRouter,
)

from .views import (

    VehicleViewSet,

    vehicle_list,

    fleet_kpis,

    simulate_vehicle_movement,
)


# =====================================================
# 🚚 ROUTER CONFIGURATION
# =====================================================

router = DefaultRouter()

router.register(
    r"vehicles",
    VehicleViewSet,
    basename="vehicles"
)


# =====================================================
# 🚀 URL PATTERNS
# =====================================================

urlpatterns = [

    # =================================================
    # 🚚 VEHICLE CRUD APIs
    # =================================================

    path(
        "",
        include(router.urls)
    ),

    # =================================================
    # 🚚 SIMPLE VEHICLE LIST API
    # =================================================

    path(
        "vehicles-list/",
        vehicle_list,
        name="vehicle-list"
    ),

    # =================================================
    # 📊 FLEET KPI API
    # =================================================

    path(
        "kpis/",
        fleet_kpis,
        name="fleet-kpis"
    ),

    # =================================================
    # 🚀 REALTIME FLEET SIMULATION
    # =================================================

    path(
        "simulate/",
        simulate_vehicle_movement,
        name="simulate-vehicles"
    ),
]