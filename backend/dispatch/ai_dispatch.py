from math import radians
from math import sin
from math import cos
from math import sqrt
from math import atan2


# 🌍 HAVERSINE DISTANCE

def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):

    R = 6371  # km

    dlat = radians(
        lat2 - lat1
    )

    dlon = radians(
        lon2 - lon1
    )

    a = (

        sin(dlat / 2) ** 2

        +

        cos(radians(lat1))

        * cos(radians(lat2))

        *

        sin(dlon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return R * c


# 🚦 TRAFFIC SIMULATION

def get_traffic_multiplier():

    # Simulated traffic

    return 1.2


# 🤖 AI VEHICLE SCORE

def calculate_ai_score(
    vehicle,
    order
):

    # 📍 DISTANCE

    distance = calculate_distance(

        vehicle.current_lat,
        vehicle.current_lng,

        order.pickup_lat,
        order.pickup_lng
    )

    # ⛽ FUEL FACTOR

    fuel_factor = (
        vehicle.fuel_level / 100
    )

    # 🚚 CAPACITY UTILIZATION

    capacity_factor = (
        vehicle.capacity / 1000
    )

    # ⚡ SPEED FACTOR

    speed_factor = (
        vehicle.speed / 100
    )

    # 🚦 TRAFFIC

    traffic = (
        get_traffic_multiplier()
    )

    # 🧠 FINAL AI SCORE

    score = (

        distance * 0.35

        +

        (1 - fuel_factor) * 0.20

        +

        (1 - capacity_factor) * 0.15

        +

        (1 - speed_factor) * 0.15

        +

        traffic * 0.15
    )

    return round(score, 3)