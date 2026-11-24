import logging

from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from django.utils import timezone

from dispatch.ml.eta_model import predict_eta_and_risk
from fleet.models import Vehicle
from fleet.serializers import VehicleSerializer
from orders.serializers import OrderSerializer


logger = logging.getLogger(__name__)


def _broadcast(channel_layer, group_name: str, message_type: str, data: dict) -> None:
    if not channel_layer:
        return
    try:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": message_type,
                "data": data,
            },
        )
    except Exception:
        logger.warning(
            "WebSocket broadcast failed for group %s",
            group_name,
            exc_info=True,
        )


def step_vehicle_locations() -> int:
    """Advance all moving vehicles by one simulated telemetry step along their routes."""
    vehicles = Vehicle.objects.select_related("current_order").filter(is_moving=True)
    channel_layer = get_channel_layer()
    updated_count = 0

    for vehicle in vehicles:
        route = vehicle.route_data
        if not route:
            continue

        total_points = len(route)

        # Route completed
        if vehicle.route_index >= total_points:
            logger.info("Vehicle %s completed route", vehicle.id)

            vehicle.is_moving = False
            vehicle.route_index = 0
            vehicle.route_data = []
            vehicle.speed = 0
            vehicle.is_available = True
            vehicle.remaining_distance = 0
            vehicle.eta_minutes = 0

            vehicle.total_deliveries += 1
            vehicle.last_delivery_at = timezone.now()

            if vehicle.active_hours > 0:
                vehicle.avg_speed = round(
                    vehicle.total_distance / vehicle.active_hours,
                    2,
                )

            fuel_penalty = vehicle.fuel_consumed * 0.2
            vehicle.efficiency_score = round(
                max(50, min(100, 100 - fuel_penalty + (vehicle.avg_speed * 0.1))),
                2,
            )
            vehicle.success_rate = 100

            # Complete current order plus any clustered orders assigned to this vehicle
            active_orders = list(
                vehicle.assigned_orders.filter(delivery_completed=False).exclude(
                    status="cancelled"
                )
            )
            if vehicle.current_order and all(
                o.id != vehicle.current_order_id for o in active_orders
            ):
                active_orders.append(vehicle.current_order)

            now = timezone.now()
            for order in active_orders:
                order.status = "delivered"
                order.delivery_completed = True
                order.delivery_progress = 100
                order.actual_delivery_time = int(order.estimated_delivery_time)
                order.delivered_at = now
                order.save()

                logger.info("Order %s marked delivered", order.id)
                _broadcast(
                    channel_layer,
                    "order_tracking",
                    "send_order_update",
                    OrderSerializer(order).data,
                )

            vehicle.current_order = None
            vehicle.save()

            _broadcast(
                channel_layer,
                "fleet_tracking",
                "send_vehicle_update",
                VehicleSerializer(vehicle).data,
            )
            updated_count += 1
            continue

        # Advance along polyline
        point = route[vehicle.route_index]
        vehicle.current_lat = point[0]
        vehicle.current_lng = point[1]

        vehicle.route_index += 8
        vehicle.speed = 60 + (vehicle.route_index % 40)

        fuel_used = 0.3
        vehicle.fuel_level = max(vehicle.fuel_level - fuel_used, 0)

        distance_increment = 0.4
        vehicle.total_distance += distance_increment
        vehicle.fuel_consumed += fuel_used
        vehicle.active_hours += 0.01

        remaining_points = max(total_points - vehicle.route_index, 0)
        vehicle.remaining_distance = round(remaining_points * 0.05, 2)

        active_orders = list(
            vehicle.assigned_orders.filter(delivery_completed=False).exclude(
                status="cancelled"
            )
        )
        if vehicle.current_order and all(
            o.id != vehicle.current_order_id for o in active_orders
        ):
            active_orders.append(vehicle.current_order)

        lead_order = vehicle.current_order or (active_orders[0] if active_orders else None)
        if lead_order and vehicle.remaining_distance > 0:
            eta_info = predict_eta_and_risk(
                distance_km=vehicle.remaining_distance,
                pickup_lat=vehicle.current_lat,
                pickup_lng=vehicle.current_lng,
                drop_lat=lead_order.drop_lat,
                drop_lng=lead_order.drop_lng,
                vehicle_type=vehicle.vehicle_type,
                weight=lead_order.weight,
                capacity=vehicle.capacity,
                fuel_level=vehicle.fuel_level,
                priority=lead_order.priority,
            )
            vehicle.eta_minutes = eta_info["predicted_eta_minutes"]
            predicted_delay = eta_info["estimated_delay_minutes"]
        elif vehicle.speed > 0:
            vehicle.eta_minutes = round(
                (vehicle.remaining_distance / vehicle.speed) * 60,
                2,
            )
            predicted_delay = 0.0
        else:
            vehicle.eta_minutes = 0
            predicted_delay = 0.0

        progress = round(min((vehicle.route_index / total_points) * 100, 100), 2)

        for order in active_orders:
            order.delivery_progress = progress
            order.delivery_distance_km = vehicle.remaining_distance
            order.estimated_delivery_time = max(1, round(vehicle.eta_minutes)) if vehicle.eta_minutes > 0 else 0
            order.traffic_delay_minutes = predicted_delay
            order.fuel_cost_estimate = round(vehicle.fuel_consumed * 1.25, 2)
            order.carbon_emission_score = round(vehicle.total_distance * 0.15, 2)

            if progress >= 30 and order.status == "assigned":
                order.status = "pickup_started"
                order.pickup_started_at = timezone.now()
                logger.info("Pickup started for Order %s", order.id)

            if progress >= 60 and order.status == "pickup_started":
                order.status = "in_transit"
                order.pickup_completed = True
                logger.info("Order %s in transit", order.id)

            order.save()

            _broadcast(
                channel_layer,
                "order_tracking",
                "send_order_update",
                OrderSerializer(order).data,
            )

        if vehicle.fuel_level < 10:
            vehicle.is_available = False

        vehicle.save()

        _broadcast(
            channel_layer,
            "fleet_tracking",
            "send_vehicle_update",
            VehicleSerializer(vehicle).data,
        )

        updated_count += 1
        logger.debug(
            "Vehicle %s | Progress %.1f%% | Fuel %.1f%% | ETA %.1f min",
            vehicle.id,
            progress,
            vehicle.fuel_level,
            vehicle.eta_minutes,
        )

    return updated_count


@shared_task
def update_vehicle_locations():
    updated_count = step_vehicle_locations()
    return f"{updated_count} vehicles updated"
