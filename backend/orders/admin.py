from django.contrib import admin

from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (

        "id",

        "customer_name",

        "priority",

        "status",

        "assigned_vehicle",

        "estimated_delivery_time",

        "delivery_completed",

        "created_at",
    )

    list_filter = (

        "status",

        "priority",

        "delivery_completed",
    )

    search_fields = (

        "customer_name",

        "customer_phone",
    )

    ordering = (
        "-created_at",
    )