from django.db import models

class Vehicle(models.Model):

    VEHICLE_TYPES = [
        ("truck", "Truck"),
        ("mini_truck", "Mini Truck"),
        ("van", "Van"),
    ]

    name = models.CharField(max_length=100)

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

    speed = models.FloatField(default=0)

    fuel_level = models.IntegerField(default=100)

    is_available = models.BooleanField(default=True)

    driver_name = models.CharField(
        max_length=100,
        default="Unknown Driver"
    )

    def __str__(self):
        return self.name