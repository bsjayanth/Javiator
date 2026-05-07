from celery import shared_task

from orders.models import Order

from dispatch.services import assign_vehicle

from .delivery_simulator import (
    simulate_delivery_progress
)


@shared_task
def auto_dispatch():

    print("🚀 AUTO DISPATCH RUNNING")

    pending_orders = Order.objects.filter(
        status="created",
        assigned_vehicle__isnull=True
    )

    print(
        f"📦 Pending orders: "
        f"{pending_orders.count()}"
    )

    for order in pending_orders:

        print(
            f"📦 Dispatching order "
            f"{order.id}"
        )

        assign_vehicle(order.id)


@shared_task
def run_delivery_simulation():

    print(
        "🚚 DELIVERY SIMULATION RUNNING"
    )

    simulate_delivery_progress()