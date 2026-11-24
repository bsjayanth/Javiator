from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.permissions import IsAdminOrManager
from dispatch.ml.eta_model import get_model_metrics
from dispatch.routing import get_route_cache_stats


@api_view(["GET"])
@permission_classes([IsAdminOrManager])
def dashboard_metrics(request):
    return Response(
        {
            "total_orders": 24,
            "active_vehicles": 8,
            "deliveries_today": 15,
            "fuel_efficiency": 92,
            "eta_accuracy": 96,
        }
    )


@api_view(["GET"])
@permission_classes([IsAdminOrManager])
def model_metrics(request):
    """Return held-out ML ETA evaluation metrics and ORS route cache stats."""
    return Response(
        {
            "eta_model": get_model_metrics(),
            "routing_cache": get_route_cache_stats(),
        }
    )
