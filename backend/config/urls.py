from django.contrib import admin
from django.urls import path, include

urlpatterns = [

    # Admin Panel
    path(
        "admin/",
        admin.site.urls
    ),

    # Fleet APIs
    path(
        "api/fleet/",
        include("fleet.urls")
    ),

    # Orders APIs
    path(
        "api/orders/",
        include("orders.urls")
    ),

    #Analytics APIs
    path(
    "api/analytics/",
    include("analytics.urls")
),

]