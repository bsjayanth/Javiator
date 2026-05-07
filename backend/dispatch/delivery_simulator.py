from orders.models import Order


def simulate_delivery_progress():

    # 🔥 ASSIGNED → PICKUP STARTED

    assigned_orders = Order.objects.filter(
        status="assigned"
    )

    for order in assigned_orders:

        order.status = "pickup_started"

        order.save()

        print(
            f"📦 Pickup started "
            f"for Order {order.id}"
        )

    # 🔥 PICKUP STARTED → IN TRANSIT

    pickup_orders = Order.objects.filter(
        status="pickup_started"
    )

    for order in pickup_orders:

        order.status = "in_transit"

        order.pickup_completed = True

        order.save()

        print(
            f"🚚 Order {order.id} "
            f"is now in transit"
        )

    # 🔥 IN TRANSIT → DELIVERED

    transit_orders = Order.objects.filter(
        status="in_transit"
    )

    for order in transit_orders:

        # Vehicle must complete route first

        vehicle = order.assigned_vehicle

        if (
            vehicle
            and
            not vehicle.is_moving
        ):

            order.status = "delivered"

            order.delivery_completed = True

            order.save()

            # FREE VEHICLE

            vehicle.is_available = True

            vehicle.current_order = None

            vehicle.save()

            print(
                f"✅ Order {order.id} "
                f"delivered"
            )