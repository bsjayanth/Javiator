from rest_framework.decorators import api_view

from rest_framework.response import Response

from fleet.models import Vehicle

from orders.models import Order


# =========================================================
# 🚀 MAIN DASHBOARD METRICS
# =========================================================

@api_view(["GET"])
def dashboard_metrics(request):

    total_vehicles = (
        Vehicle.objects.count()
    )

    active_vehicles = (
        Vehicle.objects.filter(
            is_available=False
        ).count()
    )

    idle_vehicles = (
        Vehicle.objects.filter(
            is_moving=False
        ).count()
    )

    total_orders = (
        Order.objects.count()
    )

    completed_orders = (
        Order.objects.filter(
            status="delivered"
        ).count()
    )

    in_transit_orders = (
        Order.objects.filter(
            status="in_transit"
        ).count()
    )

    # =====================================================
    # 🚀 FLEET ANALYTICS
    # =====================================================

    vehicles = Vehicle.objects.all()

    avg_fuel = (

        sum(
            v.fuel_level
            for v in vehicles
        )

        / total_vehicles

        if total_vehicles > 0

        else 0
    )

    fleet_utilization = (

        (
            active_vehicles
            / total_vehicles
        ) * 100

        if total_vehicles > 0

        else 0
    )

    avg_efficiency = (

        sum(
            v.efficiency_score
            for v in vehicles
        )

        / total_vehicles

        if total_vehicles > 0

        else 0
    )

    total_distance = sum(

        v.total_distance
        for v in vehicles
    )

    total_fuel_consumed = sum(

        v.fuel_consumed
        for v in vehicles
    )

    total_deliveries = sum(

        v.total_deliveries
        for v in vehicles
    )

    avg_speed = (

        sum(
            v.avg_speed
            for v in vehicles
        )

        / total_vehicles

        if total_vehicles > 0

        else 0
    )

    # =====================================================
    # 🚀 DRIVER LEADERBOARD
    # =====================================================

    leaderboard = []

    top_vehicles = Vehicle.objects.order_by(
        "-efficiency_score"
    )[:5]

    for vehicle in top_vehicles:

        leaderboard.append({

            "id":
            vehicle.id,

            "vehicle_name":
            vehicle.name,

            "driver_name":
            vehicle.driver_name,

            "efficiency_score":
            round(
                vehicle.efficiency_score,
                2
            ),

            "total_deliveries":
            vehicle.total_deliveries,

            "avg_speed":
            round(
                vehicle.avg_speed,
                2
            ),

            "fuel_consumed":
            round(
                vehicle.fuel_consumed,
                2
            ),

            "total_distance":
            round(
                vehicle.total_distance,
                2
            ),
        })

    # =====================================================
    # 🚀 AI INSIGHTS
    # =====================================================

    ai_insights = []

    if avg_fuel < 30:

        ai_insights.append(
            "⚠️ Fleet fuel levels are low"
        )

    if fleet_utilization > 80:

        ai_insights.append(
            "🚚 Fleet utilization is very high"
        )

    if avg_efficiency > 120:

        ai_insights.append(
            "✅ Fleet efficiency performing excellently"
        )

    if total_deliveries > 20:

        ai_insights.append(
            "📦 High delivery throughput detected"
        )

    if not ai_insights:

        ai_insights.append(
            "✅ Fleet operating normally"
        )

    # =====================================================
    # 🚀 FINAL RESPONSE
    # =====================================================

    data = {

        # BASIC METRICS

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

        # FLEET ANALYTICS

        "avg_fuel":
        round(avg_fuel, 2),

        "fleet_utilization":
        round(
            fleet_utilization,
            2
        ),

        "avg_efficiency":
        round(
            avg_efficiency,
            2
        ),

        "total_distance":
        round(
            total_distance,
            2
        ),

        "total_fuel_consumed":
        round(
            total_fuel_consumed,
            2
        ),

        "total_deliveries":
        total_deliveries,

        "avg_speed":
        round(
            avg_speed,
            2
        ),

        # DRIVER INTELLIGENCE

        "leaderboard":
        leaderboard,

        # AI INSIGHTS

        "ai_insights":
        ai_insights,
    }

    return Response(data)