from celery import shared_task

from django.utils import timezone

from fleet.models import Vehicle

from fleet.serializers import (
    VehicleSerializer
)

from orders.serializers import (
    OrderSerializer
)

from channels.layers import (
    get_channel_layer
)

from asgiref.sync import (
    async_to_sync
)


# =========================================================
# 🚀 MAIN REALTIME TRACKING ENGINE
# =========================================================

@shared_task
def update_vehicle_locations():

    vehicles = Vehicle.objects.filter(
        is_moving=True
    )

    channel_layer = (
        get_channel_layer()
    )

    updated_count = 0

    # =====================================================
    # LOOP VEHICLES
    # =====================================================

    for vehicle in vehicles:

        route = vehicle.route_data

        if not route:

            continue

        total_points = len(route)

        # =================================================
        # ✅ ROUTE COMPLETED
        # =================================================

        if vehicle.route_index >= total_points:

            print(

                f"✅ Vehicle "
                f"{vehicle.id} "
                f"completed route"
            )

            # =============================================
            # VEHICLE RESET
            # =============================================

            vehicle.is_moving = False

            vehicle.route_index = 0

            vehicle.route_data = []

            vehicle.speed = 0

            vehicle.is_available = True

            vehicle.remaining_distance = 0

            vehicle.eta_minutes = 0

            # =============================================
            # DRIVER ANALYTICS
            # =============================================

            vehicle.total_deliveries += 1

            vehicle.last_delivery_at = (
                timezone.now()
            )

            if vehicle.active_hours > 0:

                vehicle.avg_speed = round(

                    vehicle.total_distance

                    / vehicle.active_hours,

                    2
                )

            fuel_penalty = (
                vehicle.fuel_consumed
                * 0.2
            )

            vehicle.efficiency_score = round(

                max(

                    50,

                    min(

                        100,

                        100
                        - fuel_penalty
                        + (
                            vehicle.avg_speed
                            * 0.1
                        )
                    )
                ),

                2
            )

            vehicle.success_rate = 100

            # =============================================
            # COMPLETE ORDER
            # =============================================

            if vehicle.current_order:

                order = (
                    vehicle.current_order
                )

                order.status = (
                    "delivered"
                )

                order.delivery_completed = True

                order.delivery_progress = 100

                order.actual_delivery_time = int(
                    order.estimated_delivery_time
                )

                order.delivered_at = (
                    timezone.now()
                )

                order.save()

                print(

                    f"📦 Order "
                    f"{order.id} delivered"
                )

                # =========================================
                # ORDER WEBSOCKET
                # =========================================

                order_data = (
                    OrderSerializer(
                        order
                    ).data
                )

                async_to_sync(
                    channel_layer.group_send
                )(
                    "order_tracking",

                    {
                        "type":
                        "send_order_update",

                        "data":
                        order_data,
                    }
                )

            vehicle.current_order = None

            vehicle.save()

            # =============================================
            # VEHICLE WEBSOCKET
            # =============================================

            vehicle_data = (
                VehicleSerializer(
                    vehicle
                ).data
            )

            async_to_sync(
                channel_layer.group_send
            )(
                "fleet_tracking",

                {
                    "type":
                    "send_vehicle_update",

                    "data":
                    vehicle_data,
                }
            )

            updated_count += 1

            continue

        # =================================================
        # 🚚 MOVE VEHICLE
        # =================================================

        point = route[
            vehicle.route_index
        ]

        vehicle.current_lat = point[0]

        vehicle.current_lng = point[1]

        # =================================================
        # 🚀 MOVE ROUTE INDEX
        # =================================================

        vehicle.route_index += 8

        vehicle.speed = 60 + (
            vehicle.route_index % 40
        )

        # =================================================
        # ⛽ FUEL CONSUMPTION
        # =================================================

        fuel_used = 0.3

        vehicle.fuel_level = max(

            vehicle.fuel_level
            - fuel_used,

            0
        )

        # =================================================
        # 📊 DRIVER ANALYTICS
        # =================================================

        distance_increment = 0.4

        vehicle.total_distance += (
            distance_increment
        )

        vehicle.fuel_consumed += (
            fuel_used
        )

        vehicle.active_hours += (
            0.01
        )

        # =================================================
        # 📍 ETA + DISTANCE
        # =================================================

        remaining_points = (

            total_points
            - vehicle.route_index
        )

        vehicle.remaining_distance = round(

            remaining_points
            * 0.05,

            2
        )

        if vehicle.speed > 0:

            vehicle.eta_minutes = round(

                (
                    vehicle.remaining_distance

                    / vehicle.speed
                ) * 60,

                2
            )

        else:

            vehicle.eta_minutes = 0

        # =================================================
        # 📦 DELIVERY PROGRESS
        # =================================================

        progress = round(

            min(

                (
                    vehicle.route_index
                    / total_points
                ) * 100,

                100
            ),

            2
        )

        # =================================================
        # 📦 UPDATE ACTIVE ORDER
        # =================================================

        if vehicle.current_order:

            order = (
                vehicle.current_order
            )

            # =============================================
            # UPDATE DELIVERY DATA
            # =============================================

            order.delivery_progress = (
                progress
            )

            order.delivery_distance_km = (
                vehicle.remaining_distance
            )

            order.estimated_delivery_time = int(
                vehicle.eta_minutes
            )

            # =============================================
            # AI METRICS
            # =============================================

            order.traffic_delay_minutes = round(

                vehicle.eta_minutes
                * 0.1,

                2
            )

            order.fuel_cost_estimate = round(

                vehicle.fuel_consumed
                * 1.25,

                2
            )

            order.carbon_emission_score = round(

                vehicle.total_distance
                * 0.15,

                2
            )

            # =============================================
            # PICKUP STARTED
            # =============================================

            if (

                progress >= 30

                and order.status
                == "assigned"
            ):

                order.status = (
                    "pickup_started"
                )

                order.pickup_started_at = (
                    timezone.now()
                )

                print(

                    f"📦 Pickup started "
                    f"for Order "
                    f"{order.id}"
                )

            # =============================================
            # IN TRANSIT
            # =============================================

            if (

                progress >= 60

                and order.status
                == "pickup_started"
            ):

                order.status = (
                    "in_transit"
                )

                order.pickup_completed = True

                print(

                    f"🚚 Order "
                    f"{order.id} "
                    f"in transit"
                )

            order.save()

            # =============================================
            # 🔥 ORDER WEBSOCKET UPDATE
            # =============================================

            order_data = (
                OrderSerializer(
                    order
                ).data
            )

            async_to_sync(
                channel_layer.group_send
            )(
                "order_tracking",

                {
                    "type":
                    "send_order_update",

                    "data":
                    order_data,
                }
            )

        # =================================================
        # LOW FUEL LOGIC
        # =================================================

        if vehicle.fuel_level < 10:

            vehicle.is_available = False

        # =================================================
        # SAVE VEHICLE
        # =================================================

        vehicle.save()

        # =================================================
        # 🚀 VEHICLE WEBSOCKET UPDATE
        # =================================================

        vehicle_data = (
            VehicleSerializer(
                vehicle
            ).data
        )

        async_to_sync(
            channel_layer.group_send
        )(
            "fleet_tracking",

            {
                "type":
                "send_vehicle_update",

                "data":
                vehicle_data,
            }
        )

        updated_count += 1

        print(

            f"🚚 Vehicle "
            f"{vehicle.id}"

            f" | Progress: "
            f"{progress}%"

            f" | Fuel: "
            f"{vehicle.fuel_level:.1f}%"

            f" | ETA: "
            f"{vehicle.eta_minutes} min"
        )

    return (
        f"{updated_count} vehicles updated"
    )