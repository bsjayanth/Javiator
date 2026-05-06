from rest_framework.viewsets import ModelViewSet
from .models import Order
from .serializers import OrderSerializer

# dispatch logic
from dispatch.services import assign_vehicle


class OrderViewSet(ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def perform_create(self, serializer):
        order = serializer.save()

        # trigger dispatch
        assign_vehicle(order.id)