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

    # CURRENT SPEED (km/h)

    speed = models.FloatField(
        default=40
    )

    # FUEL %

    fuel_level = models.FloatField(
        default=100
    )

    # VEHICLE LOAD CAPACITY (kg)

    capacity = models.FloatField(
        default=1000
    )

    # AVAILABLE FOR NEW ORDERS

    is_available = models.BooleanField(
        default=True
    )

    # CURRENTLY MOVING

    is_moving = models.BooleanField(
        default=False
    )

    driver_name = models.CharField(
        max_length=100,
        default="Unknown Driver"
    )

    # ACTIVE DELIVERY ROUTE

    route_data = models.JSONField(
        default=list,
        blank=True
    )

    # CURRENT POSITION IN ROUTE

    route_index = models.IntegerField(
        default=0
    )

    # CURRENT ACTIVE ORDER

    current_order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="active_vehicle"
    )

    # ETA SYSTEM

    # REMAINING DISTANCE (km)

    remaining_distance = models.FloatField(
        default=0
    )

    # ESTIMATED TIME OF ARRIVAL (minutes)

    eta_minutes = models.FloatField(
        default=0
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return (
            f"{self.name} - "
            f"{self.driver_name}"
        )