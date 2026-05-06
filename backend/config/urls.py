from django.contrib import admin
from django.urls import path, include

from rest_framework.routers import DefaultRouter

from orders.views import OrderViewSet

router = DefaultRouter()

router.register(
    r'orders',
    OrderViewSet,
    basename='orders'
)

urlpatterns = [

    # Admin
    path(
        'admin/',
        admin.site.urls
    ),

    # DRF Router APIs
    path(
        'api/',
        include(router.urls)
    ),

    # Fleet APIs
    path(
        'api/fleet/',
        include('fleet.urls')
    ),

]