import logging
import os

import polyline
import requests


logger = logging.getLogger(__name__)

ORS_API_KEY = os.getenv("ORS_API_KEY")

ORS_DIRECTIONS_URL = (
    "https://api.openrouteservice.org/"
    "v2/directions/driving-car"
)

REQUEST_TIMEOUT = (5, 20)


class RoutingError(Exception):
    """Raised when a valid route cannot be obtained."""


def get_route(
    start_lat,
    start_lng,
    end_lat,
    end_lng,
):
    """
    Return route coordinates as (latitude, longitude) tuples.

    Raises RoutingError if configuration, the HTTP request,
    or the routing provider's response is invalid.
    """
    if not ORS_API_KEY:
        raise RoutingError(
            "ORS_API_KEY is not configured."
        )

    coordinates = (
        (start_lat, start_lng),
        (end_lat, end_lng),
    )

    for lat, lng in coordinates:
        if not (-90 <= lat <= 90):
            raise RoutingError(
                f"Invalid latitude: {lat}"
            )

        if not (-180 <= lng <= 180):
            raise RoutingError(
                f"Invalid longitude: {lng}"
            )

    headers = {
        "Authorization": ORS_API_KEY,
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
            raise RoutingError(
                "Routing provider returned no routes."
            )

        encoded_geometry = routes[0].get("geometry")

        if not isinstance(encoded_geometry, str):
            raise RoutingError(
                "Routing provider returned invalid geometry."
            )

        decoded = polyline.decode(encoded_geometry)

        if len(decoded) < 2:
            raise RoutingError(
                "Route contains fewer than two points."
            )

        return decoded

    except RoutingError:
        raise

    except requests.RequestException as exc:
        logger.warning(
            "OpenRouteService request failed: %s",
            exc,
        )

        raise RoutingError(
            "Unable to retrieve route from provider."
        ) from exc

    except (ValueError, KeyError, TypeError) as exc:
        logger.warning(
            "Invalid routing provider response: %s",
            exc,
        )

        raise RoutingError(
            "Routing provider returned an invalid response."
        ) from exc
