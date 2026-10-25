
import logging

from django.db import transaction

from fleet.models import Vehicle
from orders.models import Order

from .utils import calculate_distance
from .routing import get_route, RoutingError
from .ai_dispatch import calculate_ai_score


logger = logging.getLogger(__name__)


# =====================================================
# BASIC VEHICLE VALIDATION
# =====================================================

def calculate_score(vehicle, order):
    distance = calculate_distance(
        vehicle.current_lat,
        vehicle.current_lng,
        order.pickup_lat,
        order.pickup_lng,
    )

    # Capacity check
    if vehicle.capacity < order.weight:
        return float("inf")

    # Low fuel check
    if vehicle.fuel_level < 15:
        return float("inf")

    # Vehicle availability check
    if not vehicle.is_available:
        return float("inf")

    return distance


# =====================================================
# FIND NEARBY ORDERS
# =====================================================

def find_nearby_orders(order, radius=5):
    pending_orders = Order.objects.filter(
        status="created",
        assigned_vehicle__isnull=True,
    ).exclude(
        id=order.id,
    )

    cluster = []

    for nearby_order in pending_orders:
        distance = calculate_distance(
            order.pickup_lat,
            order.pickup_lng,
            nearby_order.pickup_lat,
            nearby_order.pickup_lng,
        )

        if distance <= radius:
            cluster.append((nearby_order, distance))

    # Sort by distance
    cluster.sort(key=lambda item: item[1])

    return [item[0] for item in cluster]


# =====================================================
# AI AUTO DISPATCH ENGINE
# =====================================================

def assign_vehicle(order_id):
    """
    Select a suitable vehicle, generate its route, and assign
    the requested order plus nearby compatible orders.

    Returns:
        Vehicle: the selected vehicle after successful assignment.
        None: if the order, vehicle, or route is unavailable.
    """

    # -------------------------------------------------
    # STEP 1: FETCH ORDER
    # -------------------------------------------------

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        logger.warning("Order %s not found", order_id)
        return None

    # Skip orders that are already assigned
    if order.assigned_vehicle_id:
        logger.info(
            "Order %s is already assigned to vehicle %s",
            order.id,
            order.assigned_vehicle_id,
        )
        return order.assigned_vehicle

    # -------------------------------------------------
    # STEP 2: FIND AVAILABLE VEHICLES
    # -------------------------------------------------

    vehicles = Vehicle.objects.filter(
        is_available=True,
        fuel_level__gt=10,
    )

    if not vehicles.exists():
        logger.warning("No available vehicles for order %s", order.id)
        return None

    best_vehicle = None
    best_score = float("inf")

    nearby_orders = find_nearby_orders(order)

    logger.info(
        "Found %s nearby orders for order %s",
        len(nearby_orders),
        order.id,
    )

    # -------------------------------------------------
    # STEP 3: SELECT THE BEST VEHICLE
    # -------------------------------------------------

    for vehicle in vehicles:
        basic_score = calculate_score(vehicle, order)

        if basic_score == float("inf"):
            continue

        ai_score = calculate_ai_score(vehicle, order)

        logger.debug(
            "Vehicle %s received AI score %s",
            vehicle.id,
            ai_score,
        )

        if ai_score < best_score:
            best_score = ai_score
            best_vehicle = vehicle

    if best_vehicle is None:
        logger.warning("No suitable vehicle found for order %s", order.id)
        return None

    logger.info(
        "Selected vehicle %s for order %s",
        best_vehicle.id,
        order.id,
    )

    # -------------------------------------------------
    # STEP 4: GENERATE ROUTES
    # -------------------------------------------------

    try:
        pickup_route = get_route(
            best_vehicle.current_lat,
            best_vehicle.current_lng,
            order.pickup_lat,
            order.pickup_lng,
        )

        delivery_route = get_route(
            order.pickup_lat,
            order.pickup_lng,
            order.drop_lat,
            order.drop_lng,
        )

    except RoutingError:
        logger.exception(
            "Route generation failed for order %s",
            order.id,
        )
        return None

    if not pickup_route or not delivery_route:
        logger.warning(
            "Empty route returned for order %s",
            order.id,
        )
        return None

    # Avoid duplicating the shared point at the route junction.
    if pickup_route[-1] == delivery_route[0]:
        route = pickup_route + delivery_route[1:]
    else:
        route = pickup_route + delivery_route

    if len(route) < 2:
        logger.warning("Invalid route generated for order %s", order.id)
        return None

    # -------------------------------------------------
    # STEP 5: ASSIGN ORDERS ATOMICALLY
    # -------------------------------------------------

    with transaction.atomic():
        # Lock and re-fetch the order to reduce the risk of
        # assigning an order that another worker has already taken.
        order = Order.objects.select_for_update().get(id=order_id)

        if order.assigned_vehicle_id:
            return order.assigned_vehicle

        # Lock and re-fetch the chosen vehicle.
        best_vehicle = Vehicle.objects.select_for_update().get(
            id=best_vehicle.id
        )

        if not best_vehicle.is_available or best_vehicle.fuel_level <= 10:
            logger.warning(
                "Vehicle %s is no longer available",
                best_vehicle.id,
            )
            return None

        if best_vehicle.capacity < order.weight:
            logger.warning(
                "Vehicle %s cannot carry order %s",
                best_vehicle.id,
                order.id,
            )
            return None

        # Ensure the primary order is assigned first.
        cluster_orders = [order]

        for nearby_order in nearby_orders:
            if nearby_order.id != order.id:
                cluster_orders.append(nearby_order)

        # Update the vehicle route and availability.
        best_vehicle.route_data = route
        best_vehicle.route_index = 0
        best_vehicle.current_order = order
        best_vehicle.is_moving = True
        best_vehicle.is_available = False

        best_vehicle.remaining_distance = round(
            calculate_distance(
                order.pickup_lat,
                order.pickup_lng,
                order.drop_lat,
                order.drop_lng,
            ),
            2,
        )

        best_vehicle.eta_minutes = round(
            best_vehicle.remaining_distance * 3,
            2,
        )

        best_vehicle.save()

        # -------------------------------------------------
        # STEP 6: ASSIGN COMPATIBLE CLUSTER ORDERS
        # -------------------------------------------------

        total_weight = 0
        assigned_count = 0

        for cluster_order in cluster_orders:
            # Re-fetch and lock each order so concurrent workers
            # are less likely to assign the same order.
            locked_order = Order.objects.select_for_update().get(
                id=cluster_order.id
            )

            if locked_order.assigned_vehicle_id:
                continue

            if locked_order.status != "created":
                continue

            if total_weight + locked_order.weight > best_vehicle.capacity:
                logger.info(
                    "Vehicle %s lacks capacity for order %s",
                    best_vehicle.id,
                    locked_order.id,
                )
                continue

            locked_order.assigned_vehicle = best_vehicle
            locked_order.status = "assigned"

            distance = calculate_distance(
                locked_order.pickup_lat,
                locked_order.pickup_lng,
                locked_order.drop_lat,
                locked_order.drop_lng,
            )

            locked_order.delivery_distance_km = round(distance, 2)
            locked_order.estimated_delivery_time = round(distance * 3)

            locked_order.save()

            total_weight += locked_order.weight
            assigned_count += 1

            logger.info(
                "Assigned order %s to vehicle %s",
                locked_order.id,
                best_vehicle.id,
            )

        logger.info(
            "Assigned %s orders to vehicle %s",
            assigned_count,
            best_vehicle.id,
        )

    return best_vehicle
