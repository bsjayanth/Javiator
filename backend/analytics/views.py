from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from accounts.permissions import IsAdminOrManager

from rest_framework.response import (
    Response,
)


@api_view(["GET"])

@permission_classes([IsAdminOrManager])

def dashboard_metrics(request):

    return Response({

        "total_orders": 24,

        "active_vehicles": 8,

        "deliveries_today": 15,

        "fuel_efficiency": 92,

        "eta_accuracy": 96,

    })