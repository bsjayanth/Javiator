from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Vehicle
from .serializers import VehicleSerializer

import random


class VehicleListAPIView(generics.ListAPIView):

    queryset = Vehicle.objects.all()

    serializer_class = VehicleSerializer


@api_view(["GET"])
def fleet_kpis(request):

    vehicles = Vehicle.objects.all()

    total_vehicles = vehicles.count()

    active_vehicles = vehicles.filter(
        is_available=True
    ).count()

    moving_vehicles = vehicles.filter(
        speed__gt=0
    ).count()

    low_fuel_vehicles = vehicles.filter(
        fuel_level__lt=20
    ).count()

    return Response({

        "total_vehicles": total_vehicles,

        "active_vehicles": active_vehicles,

        "moving_vehicles": moving_vehicles,

        "low_fuel_vehicles": low_fuel_vehicles,

    })


@api_view(["POST"])
def simulate_vehicle_movement(request):

    vehicles = Vehicle.objects.all()

    for vehicle in vehicles:

        # random GPS movement

        vehicle.current_lat += random.uniform(
            -0.002,
            0.002
        )

        vehicle.current_lng += random.uniform(
            -0.002,
            0.002
        )

        # random speed

        vehicle.speed = random.randint(20, 80)

        # fuel reduction

        vehicle.fuel_level = max(
            0,
            vehicle.fuel_level - random.randint(0, 2)
        )

        vehicle.save()

    return Response({
        "status": "Vehicle positions updated"
    })