from django.contrib import admin

from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (

        "id",

        "customer_name",

        "status",

        "assigned_vehicle",

        "created_at",

    )