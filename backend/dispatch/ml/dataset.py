"""
Deterministic synthetic delivery dataset generator for Bengaluru corridors.

NOTE: This project is a portfolio demonstration without proprietary fleet logs.
This module synthesizes realistic urban delivery travel times capturing
distance, rush-hour congestion waves, Bengaluru bottleneck zones, vehicle
type speed profiles, payload-to-capacity ratio, and low-fuel delays so the
ETA model can be trained, evaluated against a naive baseline, and reproduced
deterministically.
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass


# Representative Bengaluru urban corridor congestion hubs: (lat, lng, weight)
BENGALURU_CONGESTION_HUBS: tuple[tuple[float, float, float], ...] = (
    (12.9177, 77.6238, 1.00),  # Silk Board / Outer Ring Road
    (12.9698, 77.7499, 0.90),  # Whitefield / ITPL
    (12.8452, 77.6602, 0.85),  # Electronic City
    (12.9767, 77.5713, 0.92),  # Majestic / CBD
    (13.0358, 77.5970, 0.80),  # Hebbal Flyover
    (13.0285, 77.5197, 0.72),  # Peenya Industrial Area
)

VEHICLE_TYPE_CODE: dict[str, int] = {
    "van": 0,
    "mini_truck": 1,
    "truck": 2,
}

VEHICLE_FREE_FLOW_SPEED_KMPH: dict[str, float] = {
    "van": 38.0,
    "mini_truck": 32.0,
    "truck": 27.0,
}

PRIORITY_CODE: dict[str, int] = {
    "low": 0,
    "medium": 1,
    "high": 2,
}


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    earth_radius_km = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return earth_radius_km * 2 * math.atan2(math.sqrt(a), math.sqrt(max(1.0 - a, 0.0)))


def compute_corridor_congestion(
    pickup_lat: float,
    pickup_lng: float,
    drop_lat: float,
    drop_lng: float,
) -> float:
    """Return a [0.0, 1.0] congestion index based on proximity to Bengaluru hubs."""
    mid_lat = (pickup_lat + drop_lat) / 2.0
    mid_lng = (pickup_lng + drop_lng) / 2.0

    score = 0.0
    for hub_lat, hub_lng, hub_weight in BENGALURU_CONGESTION_HUBS:
        dist_p = haversine_km(pickup_lat, pickup_lng, hub_lat, hub_lng)
        dist_d = haversine_km(drop_lat, drop_lng, hub_lat, hub_lng)
        dist_m = haversine_km(mid_lat, mid_lng, hub_lat, hub_lng)
        nearest = min(dist_p, dist_d, dist_m)
        contribution = hub_weight * math.exp(-((nearest / 4.5) ** 2))
        score = max(score, contribution)

    return round(min(max(score, 0.05), 1.0), 4)


def rush_hour_intensity(hour: float, day_of_week: int) -> float:
    """Return a [0.0, 1.0] temporal traffic wave intensity (IST local hour)."""
    morning_peak = math.exp(-(((hour - 9.0) / 1.8) ** 2))
    evening_peak = 1.1 * math.exp(-(((hour - 18.5) / 2.1) ** 2))
    midday_base = 0.25 if 11.0 <= hour <= 16.0 else 0.08
    raw = min(1.0, max(morning_peak, evening_peak, midday_base))
    if day_of_week >= 5:
        raw *= 0.62
    return round(raw, 4)


@dataclass(frozen=True)
class DeliverySample:
    features: list[float]
    actual_minutes: float
    distance_km: float


def build_feature_vector(
    *,
    distance_km: float,
    hour: float,
    day_of_week: int,
    vehicle_type: str,
    payload_ratio: float,
    fuel_level: float,
    corridor_congestion: float,
    priority: str = "medium",
) -> list[float]:
    angle = 2.0 * math.pi * (hour / 24.0)
    is_weekend = 1.0 if day_of_week >= 5 else 0.0
    is_peak_hour = (
        1.0
        if (day_of_week < 5 and ((7.5 <= hour <= 11.0) or (16.5 <= hour <= 21.0)))
        else 0.0
    )
    v_code = float(VEHICLE_TYPE_CODE.get(vehicle_type, 2))
    p_code = float(PRIORITY_CODE.get(priority, 1))

    return [
        float(max(distance_km, 0.1)),
        math.sin(angle),
        math.cos(angle),
        is_weekend,
        is_peak_hour,
        v_code,
        float(min(max(payload_ratio, 0.0), 1.0)),
        float(min(max(fuel_level, 0.0), 100.0)),
        float(min(max(corridor_congestion, 0.0), 1.0)),
        p_code,
    ]


def generate_synthetic_deliveries(
    n_samples: int = 3000,
    seed: int = 42,
) -> list[DeliverySample]:
    """Generate deterministic synthetic Bengaluru delivery trips for ML training."""
    rng = random.Random(seed)
    vehicle_types = ("van", "mini_truck", "truck")
    priorities = ("low", "medium", "high")
    samples: list[DeliverySample] = []

    for _ in range(n_samples):
        pickup_lat = rng.uniform(12.83, 13.07)
        pickup_lng = rng.uniform(77.49, 77.77)
        drop_lat = rng.uniform(12.83, 13.07)
        drop_lng = rng.uniform(77.49, 77.77)

        straight_km = max(0.8, haversine_km(pickup_lat, pickup_lng, drop_lat, drop_lng))
        # Urban road tortuosity factor (~1.22x to 1.42x straight-line distance)
        road_km = round(straight_km * rng.uniform(1.22, 1.42), 2)

        hour = rng.uniform(0.0, 23.99)
        day_of_week = rng.randint(0, 6)
        vehicle_type = rng.choice(vehicle_types)
        priority = rng.choice(priorities)
        payload_ratio = rng.uniform(0.08, 0.98)
        fuel_level = rng.uniform(10.0, 100.0)

        congestion = compute_corridor_congestion(
            pickup_lat, pickup_lng, drop_lat, drop_lng
        )
        temporal_wave = rush_hour_intensity(hour, day_of_week)

        base_speed = VEHICLE_FREE_FLOW_SPEED_KMPH[vehicle_type]
        free_flow_minutes = (road_km / base_speed) * 60.0

        # Non-linear urban congestion + payload + handling + low-fuel effects
        traffic_multiplier = 1.0 + (0.65 * temporal_wave) + (0.45 * congestion) + (
            0.55 * temporal_wave * congestion
        )
        payload_multiplier = 1.0 + (0.14 * (payload_ratio ** 1.5))
        handling_minutes = 4.0 + (4.5 * payload_ratio) + (2.0 if vehicle_type == "truck" else 0.0)
        fuel_stop_minutes = 7.5 if fuel_level < 18.0 else 0.0
        priority_relief = -1.5 if priority == "high" else 0.0

        expected_minutes = (
            free_flow_minutes * traffic_multiplier * payload_multiplier
            + handling_minutes
            + fuel_stop_minutes
            + priority_relief
        )

        # Realistic operational variance (~6% std dev)
        noise = rng.gauss(0.0, max(1.2, expected_minutes * 0.055))
        actual_minutes = round(max(4.0, expected_minutes + noise), 2)

        features = build_feature_vector(
            distance_km=road_km,
            hour=hour,
            day_of_week=day_of_week,
            vehicle_type=vehicle_type,
            payload_ratio=payload_ratio,
            fuel_level=fuel_level,
            corridor_congestion=congestion,
            priority=priority,
        )
        samples.append(
            DeliverySample(
                features=features,
                actual_minutes=actual_minutes,
                distance_km=road_km,
            )
        )

    return samples
