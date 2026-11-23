from rest_framework import viewsets

from accounts.permissions import IsAdminOrManagerOrReadOnly

from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrManagerOrReadOnly]
