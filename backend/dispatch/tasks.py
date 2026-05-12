from celery import shared_task

from orders.models import Order

from dispatch.services import assign_vehicle

from fleet.models import Vehicle

from notifications.models import Notification


@shared_task
def auto_dispatch():

    print(
        "🚀 AUTO DISPATCH RUNNING"
    )

    # =====================================================
    # 📦 FIND PENDING ORDERS
    # =====================================================

    pending_orders = Order.objects.filter(

        status="created",

        assigned_vehicle__isnull=True
    )

    print(

        f"📦 Pending orders: "

        f"{pending_orders.count()}"
    )

    # =====================================================
    # 🚚 AUTO DISPATCH ORDERS
    # =====================================================

    for order in pending_orders:

        print(

            f"📦 Dispatching order "

            f"{order.id}"
        )

        vehicle = assign_vehicle(
            order.id
        )

        # =================================================
        # 🚀 DISPATCH SUCCESS ALERT
        # =================================================

        if vehicle:

            Notification.objects.create(

                title=(
                    "Vehicle Assigned"
                ),

                message=(

                    f"🚚 Vehicle "

                    f"{vehicle.name} "

                    f"assigned to "

                    f"Order "

                    f"{order.id}"
                ),

                alert_type="dispatch",

                severity="info",

                vehicle=vehicle,

                order=order,
            )

            print(

                f"✅ Notification created "

                f"for dispatch"
            )

        # =================================================
        # ❌ DISPATCH FAILURE ALERT
        # =================================================

        else:

            Notification.objects.create(

                title=(
                    "Dispatch Failed"
                ),

                message=(

                    f"❌ No available "

                    f"vehicle for "

                    f"Order "

                    f"{order.id}"
                ),

                alert_type="dispatch",

                severity="critical",

                order=order,
            )

            print(

                f"❌ Dispatch failed "

                f"notification created"
            )

    # =====================================================
    # ⛽ LOW FUEL MONITORING
    # =====================================================

    low_fuel_vehicles = Vehicle.objects.filter(
        fuel_level__lt=20
    )

    for vehicle in low_fuel_vehicles:

        # Avoid duplicate active alerts

        existing_alert = (
            Notification.objects.filter(

                vehicle=vehicle,

                alert_type="fuel",

                is_active=True
            ).exists()
        )

        if not existing_alert:

            Notification.objects.create(

                title="Low Fuel Warning",

                message=(

                    f"⚠️ Vehicle "

                    f"{vehicle.name} "

                    f"fuel below 20%"
                ),

                alert_type="fuel",

                severity="warning",

                vehicle=vehicle,
            )

            print(

                f"⛽ Low fuel alert created "

                f"for Vehicle "

                f"{vehicle.id}"
            )

    # =====================================================
    # 🚀 FLEET UTILIZATION ALERT
    # =====================================================

    total_vehicles = (
        Vehicle.objects.count()
    )

    active_vehicles = (
        Vehicle.objects.filter(
            is_available=False
        ).count()
    )

    if total_vehicles > 0:

        utilization = (

            active_vehicles
            / total_vehicles
        ) * 100

        if utilization >= 90:

            Notification.objects.create(

                title=(
                    "High Fleet Utilization"
                ),

                message=(

                    f"🔥 Fleet utilization "

                    f"reached "

                    f"{round(utilization, 2)}%"
                ),

                alert_type="analytics",

                severity="warning",
            )

            print(
                "🔥 Fleet utilization alert"
            )