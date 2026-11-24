import logging

from django.conf import settings
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdminOrManager, IsAdminOrManagerOrReadOnly
from dispatch.tasks import (
    auto_dispatch,
    dispatch_order_with_alerts,
    evaluate_fleet_alerts,
)

from .models import Order
from .serializers import OrderSerializer


logger = logging.getLogger(__name__)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related("assigned_vehicle").all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrManagerOrReadOnly]

    def perform_create(self, serializer):
        order = serializer.save()

        if getattr(settings, "FREE_TIER_DEMO_MODE", False):
            try:
                dispatch_order_with_alerts(order)
                evaluate_fleet_alerts()
                order.refresh_from_db()
            except Exception:
                logger.exception(
                    "Inline free-tier dispatch failed for Order %s",
                    order.id,
                )
        else:
            def _enqueue_dispatch():
                try:
                    auto_dispatch.delay()
                except Exception:
                    logger.warning(
                        "Celery broker unavailable; Order %s remains queued as created.",
                        order.id,
                    )

            transaction.on_commit(_enqueue_dispatch)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAdminOrManager],
        url_path="dispatch",
    )
    def trigger_dispatch(self, request, pk=None):
        """Manually dispatch or retry vehicle assignment for a single order."""
        order = self.get_object()

        if order.assigned_vehicle_id:
            return Response(
                {
                    "status": "already_assigned",
                    "order": self.get_serializer(order).data,
                },
                status=status.HTTP_200_OK,
            )

        vehicle = dispatch_order_with_alerts(order)
        evaluate_fleet_alerts()
        order.refresh_from_db()

        if not vehicle:
            return Response(
                {
                    "status": "unassigned",
                    "detail": "No suitable available vehicle or valid route found.",
                    "order": self.get_serializer(order).data,
                },
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {
                "status": "assigned",
                "order": self.get_serializer(order).data,
            },
            status=status.HTTP_200_OK,
        )
