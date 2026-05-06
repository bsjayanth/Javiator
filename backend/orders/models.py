from django.db import models

# Create your models here.
from django.db import models


class Order(models.Model):
    pickup_lat = models.FloatField()
    pickup_lng = models.FloatField()
    drop_lat = models.FloatField()
    drop_lng = models.FloatField()

    weight = models.FloatField()

    status = models.CharField(
        max_length=20,
        default="created"
    )

    assigned_vehicle = models.ForeignKey(
        "fleet.Vehicle",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Order {self.id}"