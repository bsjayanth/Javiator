from django.contrib import admin
from .models import Vehicle

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "vehicle_type",
        "speed",
        "fuel_level",
        "is_available",
        "driver_name",
    )

    search_fields = (
        "name",
        "driver_name",
        "vehicle_type",
    )

    list_filter = (
        "vehicle_type",
        "is_available",
    )