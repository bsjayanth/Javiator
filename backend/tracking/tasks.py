from celery import shared_task

from fleet.models import Vehicle


@shared_task
def update_vehicle_locations():

    vehicles = Vehicle.objects.filter(
        is_moving=True
    )

    for vehicle in vehicles:

        route = vehicle.route_data

        # No route found
        if not route:

            print(
                f"❌ Vehicle {vehicle.id} "
                f"has no route"
            )

            continue

        # Route completed
        if vehicle.route_index >= len(route):

            print(
                f"✅ Vehicle {vehicle.id} "
                f"completed route"
            )

            vehicle.is_moving = False

            vehicle.route_index = 0

            vehicle.route_data = []

            vehicle.is_available = True

            vehicle.save()

            continue

        # Current route point
        point = route[vehicle.route_index]

        # Update vehicle coordinates
        vehicle.current_lat = point[0]

        vehicle.current_lng = point[1]

        # Smooth movement speed
        vehicle.speed = 35

        # Fuel consumption
        vehicle.fuel_level = max(
            vehicle.fuel_level - 0.05,
            0
        )

        # Move to next point
        vehicle.route_index += 1

        vehicle.save()

        print(

            f"🚚 Vehicle {vehicle.id} "

            f"moved to point "

            f"{vehicle.route_index}/"

            f"{len(route)}"
        )