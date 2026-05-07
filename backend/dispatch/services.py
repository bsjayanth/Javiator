from fleet.models import Vehicle

from orders.models import Order

from .utils import calculate_distance

from .routing import get_route


# 🔹 VEHICLE SCORING ENGINE

def calculate_score(vehicle, order):

    distance = calculate_distance(
        vehicle.current_lat,
        vehicle.current_lng,
        order.pickup_lat,
        order.pickup_lng
    )

    # Vehicle cannot carry load

    if vehicle.capacity < order.weight:

        return float('inf')

    # Low fuel penalty

    if vehicle.fuel_level < 15:

        return float('inf')

    # Capacity utilization

    capacity_util = (
        order.weight / vehicle.capacity
    )

    # Lower score = better vehicle

    score = (

        distance * 0.6 +

        (1 - capacity_util) * 0.4

    )

    return score


# 🔹 CLUSTER NEARBY ORDERS

def find_nearby_orders(
    order,
    radius=5
):

    pending_orders = Order.objects.filter(

        status="created",

        assigned_vehicle__isnull=True
    )

    cluster = []

    for o in pending_orders:

        distance = calculate_distance(

            order.pickup_lat,
            order.pickup_lng,

            o.pickup_lat,
            o.pickup_lng
        )

        if distance <= radius:

            cluster.append(
                (o, distance)
            )

    # Sort nearest first

    cluster.sort(
        key=lambda x: x[1]
    )

    return [o[0] for o in cluster]


# 🔹 MAIN AUTO DISPATCH ENGINE

def assign_vehicle(order_id):

    try:

        order = Order.objects.get(
            id=order_id
        )

    except Order.DoesNotExist:

        print(
            f"❌ Order {order_id} not found"
        )

        return None

    # Skip already assigned orders

    if order.assigned_vehicle:

        print(
            f"⚠️ Order {order.id} "
            f"already assigned"
        )

        return order.assigned_vehicle

    # Available vehicles only

    vehicles = Vehicle.objects.filter(
        is_available=True,
        fuel_level__gt=10
    )

    if not vehicles.exists():

        print("❌ No available vehicles")

        return None

    best_vehicle = None

    best_score = float('inf')

    # 🔥 STEP 1:
    # Find nearby clustered orders

    nearby_orders = find_nearby_orders(
        order
    )

    print(
        f"📦 Nearby orders found: "
        f"{len(nearby_orders)}"
    )

    # 🔥 STEP 2:
    # Reuse assigned nearby vehicle

    for o in nearby_orders:

        if o.assigned_vehicle:

            best_vehicle = o.assigned_vehicle

            print(

                f"♻️ Reusing vehicle "

                f"{best_vehicle.id}"
            )

            break

    # 🔥 STEP 3:
    # Find best vehicle

    if not best_vehicle:

        for vehicle in vehicles:

            score = calculate_score(
                vehicle,
                order
            )

            print(

                f"🚚 Vehicle "

                f"{vehicle.id} "

                f"score: {score}"
            )

            if score < best_score:

                best_score = score

                best_vehicle = vehicle

    if not best_vehicle:

        print("❌ No vehicle selected")

        return None

    print(

        f"✅ Selected vehicle: "

        f"{best_vehicle.id}"
    )

    # 🔥 STEP 4:
    # Generate FULL DELIVERY ROUTE

    # ROUTE 1:
    # Vehicle → Pickup

    pickup_route = get_route(

        best_vehicle.current_lat,
        best_vehicle.current_lng,

        order.pickup_lat,
        order.pickup_lng
    )

    # ROUTE 2:
    # Pickup → Drop

    delivery_route = get_route(

        order.pickup_lat,
        order.pickup_lng,

        order.drop_lat,
        order.drop_lng
    )

    # 🔥 MERGE ROUTES

    route = pickup_route + delivery_route

    print(

        f"🛣️ Full route generated "

        f"with {len(route)} points"
    )

    # 🔥 SAVE ROUTE INTO VEHICLE

    best_vehicle.route_data = route

    best_vehicle.route_index = 0

    best_vehicle.current_order = order

    best_vehicle.is_moving = True

    # Mark vehicle busy

    best_vehicle.is_available = False

    best_vehicle.save()

    # Ensure current order included

    if order not in nearby_orders:

        nearby_orders.insert(0, order)

    total_weight = 0

    assigned_count = 0

    # 🔥 STEP 5:
    # Assign clustered orders

    for o in nearby_orders:

        # Skip already assigned

        if o.assigned_vehicle:
            continue

        # Capacity check

        if (

            total_weight + o.weight

            <= best_vehicle.capacity
        ):

            o.assigned_vehicle = best_vehicle

            o.status = "assigned"

            o.save()

            total_weight += o.weight

            assigned_count += 1

            print(

                f"📦 Order {o.id} "

                f"assigned to "

                f"Vehicle {best_vehicle.id}"
            )

        else:

            print(

                f"⚠️ Capacity full → "

                f"Skipping Order {o.id}"
            )

    print(

        f"✅ Total assigned orders: "

        f"{assigned_count}"
    )

    return best_vehicle