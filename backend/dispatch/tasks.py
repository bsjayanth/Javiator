import logging

from celery import shared_task

from dispatch.services import assign_vehicle
from fleet.models import Vehicle
from notifications.models import Notification
from orders.models import Order


logger = logging.getLogger(__name__)


def dispatch_order_with_alerts(order):
    """Attempt vehicle assignment for an order and emit deduplicated alerts."""
    vehicle = assign_vehicle(order.id)

    if vehicle:
        # Resolve any previous active failure alerts for this order.
        Notification.objects.filter(
            order=order,
            alert_type="dispatch",
            severity="critical",
            is_active=True,
        ).update(is_active=False)

        Notification.objects.create(
            title="Vehicle Assigned",
            message=f"Vehicle {vehicle.name} assigned to Order #{order.id}",
            alert_type="dispatch",
            severity="info",
            vehicle=vehicle,
            order=order,
        )
        logger.info("Dispatched Order %s to Vehicle %s", order.id, vehicle.id)
        return vehicle

    existing_failure = Notification.objects.filter(
        order=order,
        alert_type="dispatch",
        severity="critical",
        is_active=True,
        is_read=False,
    ).exists()

    if not existing_failure:
        Notification.objects.create(
            title="Dispatch Failed",
            message=f"No available vehicle or valid route for Order #{order.id}",
            alert_type="dispatch",
            severity="critical",
            order=order,
        )
        logger.warning("Dispatch failed notification created for Order %s", order.id)

    return None


def evaluate_fleet_alerts():
    """Emit deduplicated low-fuel and high-utilization operational alerts."""
    low_fuel_vehicles = Vehicle.objects.filter(fuel_level__lt=20)

    for vehicle in low_fuel_vehicles:
        existing_alert = Notification.objects.filter(
            vehicle=vehicle,
            alert_type="fuel",
            is_active=True,
            is_read=False,
        ).exists()

        if not existing_alert:
            Notification.objects.create(
                title="Low Fuel Warning",
                message=f"Vehicle {vehicle.name} fuel below 20%",
                alert_type="fuel",
                severity="warning",
                vehicle=vehicle,
            )
            logger.info("Low fuel alert created for Vehicle %s", vehicle.id)

    total_vehicles = Vehicle.objects.count()
    busy_vehicles = Vehicle.objects.filter(is_available=False).count()

    if total_vehicles > 0:
        utilization = (busy_vehicles / total_vehicles) * 100
        if utilization >= 90:
            existing_util_alert = Notification.objects.filter(
                title="High Fleet Utilization",
                alert_type="analytics",
                is_active=True,
                is_read=False,
            ).exists()

            if not existing_util_alert:
                Notification.objects.create(
                    title="High Fleet Utilization",
                    message=f"Fleet utilization reached {round(utilization, 1)}%",
                    alert_type="analytics",
                    severity="warning",
                )
                logger.info("High fleet utilization alert created (%.1f%%)", utilization)
        else:
            Notification.objects.filter(
                title="High Fleet Utilization",
                alert_type="analytics",
                is_active=True,
            ).update(is_active=False)


@shared_task
def auto_dispatch():
    """Safety sweep for any unassigned orders plus operational alert checks."""
    pending_orders = Order.objects.filter(
        status="created",
        assigned_vehicle__isnull=True,
    )

    pending_count = pending_orders.count()
    dispatched_count = 0

    if pending_count:
        logger.info("Auto-dispatch sweep checking %s pending order(s)", pending_count)

    for order in pending_orders:
        vehicle = dispatch_order_with_alerts(order)
        if vehicle:
            dispatched_count += 1

    evaluate_fleet_alerts()
    return {
        "pending_checked": pending_count,
        "dispatched": dispatched_count,
    }
