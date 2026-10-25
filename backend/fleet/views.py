from rest_framework import viewsets

from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.response import (
    Response,
)

from .models import Vehicle

from .serializers import (
    VehicleSerializer,
)

from orders.models import Order

import random


# =====================================================
# 🚚 VEHICLE CRUD API
# =====================================================

class VehicleViewSet(
    viewsets.ModelViewSet
):

    queryset = (
        Vehicle.objects.all()
    )

    serializer_class = (
        VehicleSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]


# =====================================================
# 🚚 SIMPLE VEHICLE LIST API
# =====================================================

@api_view(["GET"])

@permission_classes([
    IsAuthenticated,
])

def vehicle_list(request):

    vehicles = (
        Vehicle.objects.all()
    )

    serializer = VehicleSerializer(
        vehicles,
        many=True
    )

    return Response(
        serializer.data
    )


# =====================================================
# 📊 FLEET KPI API
# =====================================================

@api_view(["GET"])

@permission_classes([
    IsAuthenticated,
])

def fleet_kpis(request):

    vehicles = (
        Vehicle.objects.all()
    )

    orders = (
        Order.objects.all()
    )

    # ============================================
    # VEHICLE METRICS
    # ============================================

    total_vehicles = (
        vehicles.count()
    )

    active_vehicles = (
        vehicles.filter(
            is_available=True
        ).count()
    )

    moving_now = (
        vehicles.filter(
            is_moving=True
        ).count()
    )

    low_fuel = (
        vehicles.filter(
            fuel_level__lt=20
        ).count()
    )

    # ============================================
    # ORDER METRICS
    # ============================================

    total_orders = (
        orders.count()
    )

    delivered_orders = (
        orders.filter(
            status="delivered"
        ).count()
    )

    # ============================================
    # ORDER FULFILLMENT %
    # ============================================

    order_fulfillment = 0

    if total_orders > 0:

        order_fulfillment = round(

            (
                delivered_orders
                / total_orders
            ) * 100,

            1
        )

    # ============================================
    # AVG FUEL
    # ============================================

    avg_fuel = 0

    if total_vehicles > 0:

        total_fuel = sum([

            vehicle.fuel_level

            for vehicle in vehicles
        ])

        avg_fuel = round(

            total_fuel
            / total_vehicles,

            1
        )

    # ============================================
    # FLEET UTILIZATION
    # ============================================

    fleet_utilization = 0

    if total_vehicles > 0:

        fleet_utilization = round(

            (
                active_vehicles
                / total_vehicles
            ) * 100,

            1
        )

    # ============================================
    # RESPONSE
    # ============================================

    return Response({

        "total_vehicles":
            total_vehicles,

        "active_vehicles":
            active_vehicles,

        "moving_now":
            moving_now,

        "low_fuel":
            low_fuel,

        "total_orders":
            total_orders,

        "fleet_utilization":
            fleet_utilization,

        "avg_fuel":
            avg_fuel,

        "order_fulfillment":
            order_fulfillment,
    })


# =====================================================
# 🚀 REALTIME VEHICLE SIMULATION
# =====================================================

@api_view(["POST"])

@permission_classes([
    IsAuthenticated,
])

def simulate_vehicle_movement(
    request
):

    vehicles = (
        Vehicle.objects.all()
    )

    for vehicle in vehicles:

        vehicle.is_moving = (
            random.choice([
                True,
                True,
                True,
                False,
            ])
        )

        if vehicle.is_moving:

            vehicle.current_lat += (
                random.uniform(
                    -0.002,
                    0.002
                )
            )

            vehicle.current_lng += (
                random.uniform(
                    -0.002,
                    0.002
                )
            )

            vehicle.speed = (
                random.randint(
                    25,
                    90
                )
            )

            fuel_drop = (
                random.uniform(
                    0.2,
                    1.5
                )
            )

            vehicle.fuel_level = max(
                0,
                vehicle.fuel_level
                - fuel_drop
            )

            distance = (
                random.uniform(
                    1,
                    5
                )
            )

            vehicle.total_distance += (
                distance
            )

            vehicle.active_hours += (
                0.05
            )

            vehicle.fuel_consumed += (
                fuel_drop
            )

            vehicle.eta_minutes = max(
                0,
                vehicle.eta_minutes
                - random.uniform(
                    1,
                    3
                )
            )

            vehicle.remaining_distance = max(
                0,
                vehicle.remaining_distance
                - distance
            )

        else:

            vehicle.speed = 0

        if vehicle.fuel_level < 10:

            vehicle.is_available = (
                False
            )

        else:

            vehicle.is_available = (
                True
            )

        vehicle.efficiency_score = round(

            max(
                50,

                min(
                    100,

                    100
                    - (
                        vehicle.fuel_consumed
                        * 0.1
                    )
                    + (
                        vehicle.success_rate
                        * 0.05
                    )
                )
            ),

            2
        )

        if vehicle.active_hours > 0:

            vehicle.avg_speed = round(

                vehicle.total_distance
                / vehicle.active_hours,

                2
            )

        vehicle.save()

    return Response({

        "status":
            "Fleet simulation completed",

        "vehicles_updated":
            vehicles.count(),
    })