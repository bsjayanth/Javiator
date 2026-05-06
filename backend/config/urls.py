from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from orders.views import OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Orders API
    path('api/', include(router.urls)),

    # Fleet API
    path('api/', include('fleet.urls')),
]