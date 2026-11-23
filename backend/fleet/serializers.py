from rest_framework import serializers

from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = "__all__"
        read_only_fields = [
            "id",
            "route_data",
            "route_index",
            "current_order",
            "remaining_distance",
            "eta_minutes",
            "total_deliveries",
            "total_distance",
            "avg_speed",
            "efficiency_score",
            "fuel_consumed",
            "active_hours",
            "success_rate",
            "last_delivery_at",
            "created_at",
            "updated_at",
        ]
