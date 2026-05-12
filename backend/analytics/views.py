from rest_framework.decorators import api_view
from rest_framework.response import Response

from fleet.models import Vehicle
from orders.models import Order


@api_view(["GET"])
def dashboard_metrics(request):

    total_vehicles = Vehicle.objects.count()

   
    active_vehicles = Vehicle.objects.filter(
    is_available=False
    ).count()

    idle_vehicles = Vehicle.objects.filter(
        is_moving=False
    ).count()

    total_orders = Order.objects.count()

    completed_orders = Order.objects.filter(
        status="delivered"
    ).count()

    in_transit_orders = Order.objects.filter(
        status="in_transit"
    ).count()

    avg_fuel = (
        sum(
            v.fuel_level
            for v in Vehicle.objects.all()
        )
        / total_vehicles
        if total_vehicles > 0
        else 0
    )

    fleet_utilization = (
        (active_vehicles / total_vehicles) * 100
        if total_vehicles > 0
        else 0
    )

    data = {

        "total_vehicles":
        total_vehicles,

        "active_vehicles":
        active_vehicles,

        "idle_vehicles":
        idle_vehicles,

        "total_orders":
        total_orders,

        "completed_orders":
        completed_orders,

        "in_transit_orders":
        in_transit_orders,

        "avg_fuel":
        round(avg_fuel, 2),

        "fleet_utilization":
        round(fleet_utilization, 2),
    }

    return Response(data)