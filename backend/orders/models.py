from django.db import models


class Order(models.Model):

    ORDER_STATUS = [

        ("created", "Created"),

        ("assigned", "Assigned"),

        ("pickup_started", "Pickup Started"),

        ("in_transit", "In Transit"),

        ("delivered", "Delivered"),
    ]

    customer_name = models.CharField(
        max_length=100,
        default="Customer"
    )

    pickup_lat = models.FloatField()

    pickup_lng = models.FloatField()

    drop_lat = models.FloatField()

    drop_lng = models.FloatField()

    weight = models.FloatField()

    status = models.CharField(
        max_length=30,
        choices=ORDER_STATUS,
        default="created"
    )

    assigned_vehicle = models.ForeignKey(
        "fleet.Vehicle",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    pickup_completed = models.BooleanField(
        default=False
    )

    delivery_completed = models.BooleanField(
        default=False
    )

    estimated_delivery_time = models.IntegerField(
        default=30
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return (
            f"Order {self.id} - "
            f"{self.customer_name}"
        )