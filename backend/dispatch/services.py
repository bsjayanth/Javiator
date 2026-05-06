from fleet.models import Vehicle
from orders.models import Order
from .utils import calculate_distance


# 🔹 SCORING FUNCTION
def calculate_score(vehicle, order):
    distance = calculate_distance(
        vehicle.current_lat, vehicle.current_lng,
        order.pickup_lat, order.pickup_lng
    )

    if vehicle.capacity < order.weight:
        return float('inf')

    capacity_util = order.weight / vehicle.capacity

    score = (
        distance * 0.6 +
        (1 - capacity_util) * 0.4
    )

    return score


# 🔹 FIND NEARBY ORDERS (CLUSTER)
def find_nearby_orders(order, radius=5):
    pending_orders = Order.objects.filter(
        status="created",
        assigned_vehicle__isnull=True
    )

    cluster = []

    for o in pending_orders:
        distance = calculate_distance(
            order.pickup_lat, order.pickup_lng,
            o.pickup_lat, o.pickup_lng
        )

        if distance <= radius:
            cluster.append((o, distance))

    # 🔥 SORT by distance (important)
    cluster.sort(key=lambda x: x[1])

    return [o[0] for o in cluster]


# 🔹 MAIN DISPATCH FUNCTION
def assign_vehicle(order_id):
    order = Order.objects.get(id=order_id)

    vehicles = Vehicle.objects.filter(is_available=True)

    best_vehicle = None
    best_score = float('inf')

    # 🔥 Step 1: Check if nearby orders already assigned to a vehicle
    nearby_orders = find_nearby_orders(order)

    for o in nearby_orders:
        if o.assigned_vehicle:
            print(f"♻️ Reusing vehicle {o.assigned_vehicle.id}")
            best_vehicle = o.assigned_vehicle
            break

    # 🔥 Step 2: If no existing vehicle → pick best one
    if not best_vehicle:
        for v in vehicles:
            score = calculate_score(v, order)
            print(f"Vehicle {v.id} score: {score}")

            if score < best_score:
                best_score = score
                best_vehicle = v

    if not best_vehicle:
        print("❌ No vehicle found")
        return None

    print(f"✅ Selected vehicle: {best_vehicle.id}")

    # 🔥 Step 3: Ensure current order is included
    if order not in nearby_orders:
        nearby_orders.insert(0, order)

    print(f"📦 Cluster size: {len(nearby_orders)}")

    total_weight = 0

    # 🔥 Step 4: Assign cluster orders
    for o in nearby_orders:

        if o.assigned_vehicle:
            continue

        if total_weight + o.weight <= best_vehicle.capacity:
            o.assigned_vehicle = best_vehicle
            o.status = "assigned"
            o.save()

            total_weight += o.weight

            print(f"🚚 Assigned order {o.id} → vehicle {best_vehicle.id}")
        else:
            print(f"⚠️ Skipping order {o.id} (capacity full)")

    return best_vehicle