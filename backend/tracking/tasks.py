from celery import shared_task

from fleet.models import Vehicle

from channels.layers import get_channel_layer

from asgiref.sync import async_to_sync

from fleet.serializers import VehicleSerializer


@shared_task
def update_vehicle_locations():

    vehicles = Vehicle.objects.filter(
        is_moving=True
    )

    for vehicle in vehicles:

        route = vehicle.route_data

        if not route:

            continue

        total_points = len(route)

        # ✅ ROUTE COMPLETED

        if vehicle.route_index >= total_points:

            print(
                f"✅ Vehicle {vehicle.id} completed route"
            )

            vehicle.is_moving = False

            vehicle.route_index = 0

            vehicle.route_data = []

            vehicle.speed = 0

            vehicle.is_available = True

            vehicle.remaining_distance = 0

            vehicle.eta_minutes = 0

            # COMPLETE ORDER

            if vehicle.current_order:

                order = vehicle.current_order

                order.status = "delivered"

                order.delivery_completed = True

                order.save()

                print(
                    f"📦 Order {order.id} delivered"
                )

            vehicle.current_order = None

            vehicle.save()

            # 🔥 SEND FINAL UPDATE

            channel_layer = (
                get_channel_layer()
            )

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

            continue

        # ✅ MOVE VEHICLE

        point = route[
            vehicle.route_index
        ]

        vehicle.current_lat = point[0]

        vehicle.current_lng = point[1]

        # ✅ ROUTE MOVEMENT SPEED

        vehicle.route_index += 8

        # ✅ DYNAMIC SPEED SIMULATION

        vehicle.speed = 60 + (
            vehicle.route_index % 40
        )

        # ✅ FUEL CONSUMPTION

        vehicle.fuel_level = max(

            vehicle.fuel_level - 0.3,

            0
        )

        # ✅ ETA + REMAINING DISTANCE

        remaining_points = (

            total_points
            - vehicle.route_index
        )

        # ASSUME:
        # 1 route point ≈ 50 meters

        vehicle.remaining_distance = round(

            remaining_points * 0.05,

            2
        )

        # ✅ ETA FORMULA

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

        # ✅ ROUTE PROGRESS %

        progress = (

            vehicle.route_index
            / total_points

        ) * 100

        # ✅ PICKUP STARTED

        if (

            vehicle.current_order

            and progress >= 30

            and vehicle.current_order.status
            == "assigned"
        ):

            vehicle.current_order.status = (
                "pickup_started"
            )

            vehicle.current_order.save()

            print(

                f"📦 Pickup started "
                f"for Order "
                f"{vehicle.current_order.id}"
            )

        # ✅ IN TRANSIT

        if (

            vehicle.current_order

            and progress >= 60

            and vehicle.current_order.status
            == "pickup_started"
        ):

            vehicle.current_order.status = (
                "in_transit"
            )

            vehicle.current_order.pickup_completed = True

            vehicle.current_order.save()

            print(

                f"🚚 Order "
                f"{vehicle.current_order.id} "
                f"is in transit"
            )

        vehicle.save()

        # 🔥 SEND LIVE WEBSOCKET UPDATE

        channel_layer = (
            get_channel_layer()
        )

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

        print(

            f"🚚 Vehicle {vehicle.id} moved "
            f"{vehicle.route_index}/{total_points}"
        )