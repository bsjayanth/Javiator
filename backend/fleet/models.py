from django.db import models


class Vehicle(models.Model):

    VEHICLE_TYPES = [

        ("truck", "Truck"),

        ("mini_truck", "Mini Truck"),

        ("van", "Van"),
    ]

    name = models.CharField(
        max_length=100
    )

    vehicle_type = models.CharField(
        max_length=20,
        choices=VEHICLE_TYPES,
        default="truck"
    )

    current_lat = models.FloatField(
        default=12.9716
    )

    current_lng = models.FloatField(
        default=77.5946
    )

    speed = models.FloatField(
        default=40
    )

    fuel_level = models.FloatField(
        default=100
    )

    capacity = models.FloatField(
        default=1000
    )

    is_available = models.BooleanField(
        default=True
    )

    is_moving = models.BooleanField(
        default=False
    )

    driver_name = models.CharField(
        max_length=100,
        default="Unknown Driver"
    )

    # 🚚 ACTIVE DELIVERY ROUTE

    route_data = models.JSONField(
        default=list,
        blank=True
    )

    # Current position in route array

    route_index = models.IntegerField(
        default=0
    )

    # Current active order

    current_order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="active_vehicle"
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return (
            f"{self.name} - "
            f"{self.driver_name}"
        )