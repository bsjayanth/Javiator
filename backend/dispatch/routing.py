from collections import OrderedDict
import logging
import os
from threading import Lock

import polyline
import requests


logger = logging.getLogger(__name__)

ORS_DIRECTIONS_URL = (
    "https://api.openrouteservice.org/"
    "v2/directions/driving-car"
)

REQUEST_TIMEOUT = (5, 20)
MAX_ROUTE_CACHE_ENTRIES = 512

_route_cache: OrderedDict[tuple[float, float, float, float], list[tuple[float, float]]] = OrderedDict()
_cache_lock = Lock()
_cache_stats = {"hits": 0, "misses": 0, "fallbacks": 0}


class RoutingError(Exception):
    """Raised when a valid route cannot be obtained."""


def _cache_key(start_lat, start_lng, end_lat, end_lng):
    return (
        round(float(start_lat), 4),
        round(float(start_lng), 4),
        round(float(end_lat), 4),
        round(float(end_lng), 4),
    )


def get_route_cache_stats() -> dict:
    with _cache_lock:
        return {
            "hits": _cache_stats["hits"],
            "misses": _cache_stats["misses"],
            "fallbacks": _cache_stats["fallbacks"],
            "entries": len(_route_cache),
        }


def clear_route_cache() -> None:
    with _cache_lock:
        _route_cache.clear()
        _cache_stats["hits"] = 0
        _cache_stats["misses"] = 0
        _cache_stats["fallbacks"] = 0


def _build_synthetic_route(start_lat, start_lng, end_lat, end_lng, steps: int = 24):
    """Interpolate straight-line waypoints when explicit fallback mode is enabled."""
    return [
        (
            round(start_lat + (end_lat - start_lat) * (i / steps), 6),
            round(start_lng + (end_lng - start_lng) * (i / steps), 6),
        )
        for i in range(steps + 1)
    ]


def _synthetic_fallback_enabled() -> bool:
    return os.getenv("ALLOW_SYNTHETIC_ROUTE_FALLBACK", "False").strip().lower() == "true"


def get_route(
    start_lat,
    start_lng,
    end_lat,
    end_lng,
):
    """
    Return route coordinates as (latitude, longitude) tuples.

    Uses an in-process LRU cache keyed by rounded coordinates to avoid
    redundant OpenRouteService calls. Raises RoutingError if configuration,
    the HTTP request, or the routing provider's response is invalid (unless
    ALLOW_SYNTHETIC_ROUTE_FALLBACK=True).
    """
    coordinates = (
        (start_lat, start_lng),
        (end_lat, end_lng),
    )

    for lat, lng in coordinates:
        if not (-90 <= lat <= 90):
            raise RoutingError(f"Invalid latitude: {lat}")

        if not (-180 <= lng <= 180):
            raise RoutingError(f"Invalid longitude: {lng}")

    key = _cache_key(start_lat, start_lng, end_lat, end_lng)

    with _cache_lock:
        cached = _route_cache.get(key)
        if cached is not None:
            _route_cache.move_to_end(key)
            _cache_stats["hits"] += 1
            return list(cached)
        _cache_stats["misses"] += 1

    ors_api_key = os.getenv("ORS_API_KEY", "").strip()

    if not ors_api_key:
        if _synthetic_fallback_enabled():
            logger.warning(
                "ORS_API_KEY not configured; returning interpolated fallback route."
            )
            with _cache_lock:
                _cache_stats["fallbacks"] += 1
            return _build_synthetic_route(start_lat, start_lng, end_lat, end_lng)
        raise RoutingError("ORS_API_KEY is not configured.")

    headers = {
        "Authorization": ors_api_key,
        "Content-Type": "application/json",
    }

    body = {
        "coordinates": [
            [start_lng, start_lat],
            [end_lng, end_lat],
        ],
        "instructions": False,
        "geometry": True,
        "geometry_simplify": False,
    }

    try:
        response = requests.post(
            ORS_DIRECTIONS_URL,
            json=body,
            headers=headers,
            timeout=REQUEST_TIMEOUT,
        )

        response.raise_for_status()
        data = response.json()

        routes = data.get("routes")

        if not isinstance(routes, list) or not routes:
            raise RoutingError("Routing provider returned no routes.")

        encoded_geometry = routes[0].get("geometry")

        if not isinstance(encoded_geometry, str):
            raise RoutingError("Routing provider returned invalid geometry.")

        decoded = polyline.decode(encoded_geometry)

        if len(decoded) < 2:
            raise RoutingError("Route contains fewer than two points.")

        with _cache_lock:
            _route_cache[key] = list(decoded)
            _route_cache.move_to_end(key)
            while len(_route_cache) > MAX_ROUTE_CACHE_ENTRIES:
                _route_cache.popitem(last=False)

        return decoded

    except RoutingError:
        if _synthetic_fallback_enabled():
            logger.warning("ORS returned invalid route; using interpolated fallback.")
            with _cache_lock:
                _cache_stats["fallbacks"] += 1
            return _build_synthetic_route(start_lat, start_lng, end_lat, end_lng)
        raise

    except requests.RequestException as exc:
        logger.warning("OpenRouteService request failed: %s", exc)
        if _synthetic_fallback_enabled():
            with _cache_lock:
                _cache_stats["fallbacks"] += 1
            return _build_synthetic_route(start_lat, start_lng, end_lat, end_lng)
        raise RoutingError("Unable to retrieve route from provider.") from exc

    except (ValueError, KeyError, TypeError) as exc:
        logger.warning("Invalid routing provider response: %s", exc)
        if _synthetic_fallback_enabled():
            with _cache_lock:
                _cache_stats["fallbacks"] += 1
            return _build_synthetic_route(start_lat, start_lng, end_lat, end_lng)
        raise RoutingError("Routing provider returned an invalid response.") from exc
