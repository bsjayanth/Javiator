from django.db import models

class Vehicle(models.Model):
    name = models.CharField(max_length=100)
    capacity = models.FloatField()
    current_lat = models.FloatField(null=True, blank=True)
    current_lng = models.FloatField(null=True, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name