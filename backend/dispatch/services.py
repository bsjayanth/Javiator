import logging

from django.db import transaction
from django.utils import timezone

from fleet.models import Vehicle
from orders.models import Order

from .ml.eta_model import predict_eta_and_risk
from .optimizer import (
    compute_assignment_cost,
    record_optimization_run,
    sequence_multi_stop_route,
    solve_global_assignment,
)
from .routing import RoutingError, get_route
from .utils import calculate_distance


logger = logging.getLogger(__name__)

MAX_CLUSTER_ORDERS = 3


def calculate_score(vehicle, order):
    distance = calculate_distance(
        vehicle.current_lat,
        vehicle.current_lng,
        order.pickup_lat,
        order.pickup_lng,
    )

    if vehicle.capacity < order.weight:
        return float("inf")

    if vehicle.fuel_level < 15:
        return float("inf")

    if not vehicle.is_available:
        return float("inf")

    return distance


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

    cluster.sort(key=lambda item: item[1])
    return [item[0] for item in cluster]


def _build_multi_stop_polyline(start_lat: float, start_lng: float, orders: list):
    """Sequence pickup/drop stops via 2-opt and fetch stitched road polylines."""
    seq = sequence_multi_stop_route(start_lat, start_lng, orders)
    stops = seq["stops"]
    if not stops:
        return [], seq

    combined_route: list[tuple[float, float]] = []
    cur_lat, cur_lng = start_lat, start_lng

    for stop in stops:
        # Skip zero-distance legs (e.g. vehicle already at pickup coordinates)
        if calculate_distance(cur_lat, cur_lng, stop.lat, stop.lng) < 0.02:
            if not combined_route:
                combined_route.append((cur_lat, cur_lng))
            combined_route.append((stop.lat, stop.lng))
            cur_lat, cur_lng = stop.lat, stop.lng
            continue

        leg = get_route(cur_lat, cur_lng, stop.lat, stop.lng)
        if not leg:
            raise RoutingError(
                f"Empty leg returned for stop {stop.kind} (Order {stop.order_id})."
            )

        if combined_route and combined_route[-1] == leg[0]:
            combined_route.extend(leg[1:])
        else:
            combined_route.extend(leg)

        cur_lat, cur_lng = stop.lat, stop.lng

    return combined_route, seq


def _commit_vehicle_assignment(
    vehicle_id: int,
    orders_to_assign: list,
    route: list,
    dispatch_score: float,
    total_route_km: float,
):
    """Persist vehicle and order assignment atomically with row locks."""
    if not orders_to_assign or len(route) < 2:
        return None, []

    primary_order_id = orders_to_assign[0].id

    with transaction.atomic():
        primary_order = Order.objects.select_for_update().get(id=primary_order_id)
        if primary_order.assigned_vehicle_id or primary_order.status != "created":
            return primary_order.assigned_vehicle, []

        vehicle = Vehicle.objects.select_for_update().get(id=vehicle_id)
        if not vehicle.is_available or vehicle.fuel_level < 15:
            logger.warning("Vehicle %s is no longer available", vehicle.id)
            return None, []

        if vehicle.capacity < primary_order.weight:
            logger.warning(
                "Vehicle %s cannot carry order %s",
                vehicle.id,
                primary_order.id,
            )
            return None, []

        primary_eta = predict_eta_and_risk(
            distance_km=max(total_route_km, 0.2),
            pickup_lat=primary_order.pickup_lat,
            pickup_lng=primary_order.pickup_lng,
            drop_lat=primary_order.drop_lat,
            drop_lng=primary_order.drop_lng,
            vehicle_type=vehicle.vehicle_type,
            weight=primary_order.weight,
            capacity=vehicle.capacity,
            fuel_level=vehicle.fuel_level,
            priority=primary_order.priority,
        )

        vehicle.route_data = route
        vehicle.route_index = 0
        vehicle.current_order = primary_order
        vehicle.is_moving = True
        vehicle.is_available = False
        vehicle.remaining_distance = round(max(total_route_km, 0.1), 2)
        vehicle.eta_minutes = primary_eta["predicted_eta_minutes"]
        vehicle.save()

        total_weight = 0.0
        assigned_orders = []
        now = timezone.now()

        for candidate in orders_to_assign:
            locked_order = Order.objects.select_for_update().get(id=candidate.id)
            if locked_order.assigned_vehicle_id or locked_order.status != "created":
                continue

            if total_weight + locked_order.weight > vehicle.capacity:
                logger.info(
                    "Vehicle %s lacks capacity for clustered order %s",
                    vehicle.id,
                    locked_order.id,
                )
                continue

            distance = calculate_distance(
                locked_order.pickup_lat,
                locked_order.pickup_lng,
                locked_order.drop_lat,
                locked_order.drop_lng,
            )
            order_eta = predict_eta_and_risk(
                distance_km=max(distance, 0.2),
                pickup_lat=locked_order.pickup_lat,
                pickup_lng=locked_order.pickup_lng,
                drop_lat=locked_order.drop_lat,
                drop_lng=locked_order.drop_lng,
                vehicle_type=vehicle.vehicle_type,
                weight=locked_order.weight,
                capacity=vehicle.capacity,
                fuel_level=vehicle.fuel_level,
                priority=locked_order.priority,
            )

            locked_order.assigned_vehicle = vehicle
            locked_order.status = "assigned"
            locked_order.assigned_at = now
            locked_order.ai_dispatch_score = round(dispatch_score, 3)
            locked_order.delivery_distance_km = round(distance, 2)
            locked_order.estimated_delivery_time = max(
                1,
                round(order_eta["predicted_eta_minutes"]),
            )
            locked_order.traffic_delay_minutes = order_eta["estimated_delay_minutes"]
            locked_order.save()

            total_weight += locked_order.weight
            assigned_orders.append(locked_order)

            logger.info(
                "Assigned order %s to vehicle %s (score=%.3f, ML ETA=%s min, risk=%s)",
                locked_order.id,
                vehicle.id,
                dispatch_score,
                order_eta["predicted_eta_minutes"],
                order_eta["delay_risk"],
            )

    return vehicle, assigned_orders


def assign_vehicle(order_id):
    """
    Select the best vehicle via ML-informed cost scoring, build a multi-stop
    sequenced road route for the primary order plus compatible nearby orders,
    and persist the assignment atomically.
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        logger.warning("Order %s not found", order_id)
        return None

    if order.assigned_vehicle_id:
        logger.info(
            "Order %s is already assigned to vehicle %s",
            order.id,
            order.assigned_vehicle_id,
        )
        return order.assigned_vehicle

    vehicles = list(
        Vehicle.objects.filter(
            is_available=True,
            fuel_level__gte=15,
        )
    )
    if not vehicles:
        logger.warning("No available vehicles for order %s", order.id)
        return None

    best_vehicle = None
    best_cost = float("inf")

    for vehicle in vehicles:
        info = compute_assignment_cost(vehicle, order)
        if not info["feasible"]:
            continue
        if info["cost"] < best_cost:
            best_cost = info["cost"]
            best_vehicle = vehicle

    if best_vehicle is None:
        logger.warning("No suitable vehicle found for order %s", order.id)
        return None

    # Pack up to MAX_CLUSTER_ORDERS nearby compatible orders before routing
    cluster_orders = [order]
    running_weight = order.weight
    for nearby in find_nearby_orders(order):
        if len(cluster_orders) >= MAX_CLUSTER_ORDERS:
            break
        if running_weight + nearby.weight <= best_vehicle.capacity:
            cluster_orders.append(nearby)
            running_weight += nearby.weight

    try:
        route, seq = _build_multi_stop_polyline(
            best_vehicle.current_lat,
            best_vehicle.current_lng,
            cluster_orders,
        )
    except RoutingError:
        logger.exception("Route generation failed for order %s", order.id)
        return None

    if len(route) < 2:
        logger.warning("Invalid route generated for order %s", order.id)
        return None

    vehicle, assigned_orders = _commit_vehicle_assignment(
        vehicle_id=best_vehicle.id,
        orders_to_assign=cluster_orders,
        route=route,
        dispatch_score=best_cost,
        total_route_km=seq["optimized_km"],
    )

    if vehicle and assigned_orders:
        logger.info(
            "Assigned %s order(s) to vehicle %s (route %.2f km, saved %.2f km vs sequential)",
            len(assigned_orders),
            vehicle.id,
            seq["optimized_km"],
            seq["saved_km"],
        )

    return vehicle


def optimize_batch_dispatch():
    """
    Solve globally optimal fleet-to-order matching across all pending orders
    using the Hungarian algorithm (`scipy.optimize.linear_sum_assignment`),
    generate road polylines, and commit each match atomically.
    """
    pending_orders = list(
        Order.objects.filter(
            status="created",
            assigned_vehicle__isnull=True,
        ).order_by("id")
    )
    available_vehicles = list(
        Vehicle.objects.filter(
            is_available=True,
            fuel_level__gte=15,
        ).order_by("id")
    )

    solved = solve_global_assignment(available_vehicles, pending_orders)
    metrics = solved["metrics"]
    assignments_summary = []

    for match in solved["matches"]:
        vehicle = match["vehicle"]
        order = match["order"]
        breakdown = match["breakdown"]

        try:
            route, seq = _build_multi_stop_polyline(
                vehicle.current_lat,
                vehicle.current_lng,
                [order],
            )
        except RoutingError:
            logger.warning(
                "Batch optimizer skipped Order %s (route generation failed).",
                order.id,
            )
            continue

        if len(route) < 2:
            continue

        committed_vehicle, assigned = _commit_vehicle_assignment(
            vehicle_id=vehicle.id,
            orders_to_assign=[order],
            route=route,
            dispatch_score=breakdown["cost"],
            total_route_km=seq["optimized_km"],
        )

        if committed_vehicle and assigned:
            assignments_summary.append(
                {
                    "order_id": order.id,
                    "vehicle_id": committed_vehicle.id,
                    "vehicle_name": committed_vehicle.name,
                    "dispatch_score": breakdown["cost"],
                    "deadhead_km": breakdown["deadhead_km"],
                    "predicted_eta_minutes": breakdown["predicted_eta_minutes"],
                    "delay_risk": breakdown["delay_risk"],
                    "top_factors": breakdown["top_factors"],
                }
            )

    metrics["committed_assignments"] = len(assignments_summary)
    if metrics["vehicles_considered"] > 0 and metrics["orders_considered"] > 0:
        record_optimization_run(metrics)

    return {
        "assignments": assignments_summary,
        "metrics": metrics,
    }
