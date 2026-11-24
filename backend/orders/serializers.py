from rest_framework import serializers

from dispatch.ml.eta_model import predict_eta_and_risk
from dispatch.utils import calculate_distance

from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    assigned_vehicle_name = serializers.SerializerMethodField()
    delay_risk = serializers.SerializerMethodField()
    eta_factors = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "customer_phone",
            "pickup_address",
            "pickup_lat",
            "pickup_lng",
            "drop_address",
            "drop_lat",
            "drop_lng",
            "weight",
            "priority",
            "status",
            "assigned_vehicle",
            "assigned_vehicle_name",
            "route_data",
            "pickup_completed",
            "delivery_completed",
            "delivery_progress",
            "estimated_delivery_time",
            "actual_delivery_time",
            "delivery_distance_km",
            "ai_dispatch_score",
            "traffic_delay_minutes",
            "delay_risk",
            "eta_factors",
            "fuel_cost_estimate",
            "carbon_emission_score",
            "assigned_at",
            "pickup_started_at",
            "delivered_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "assigned_vehicle_name",
            "route_data",
            "pickup_completed",
            "delivery_completed",
            "delivery_progress",
            "estimated_delivery_time",
            "actual_delivery_time",
            "delivery_distance_km",
            "ai_dispatch_score",
            "traffic_delay_minutes",
            "delay_risk",
            "eta_factors",
            "fuel_cost_estimate",
            "carbon_emission_score",
            "assigned_at",
            "pickup_started_at",
            "delivered_at",
            "created_at",
            "updated_at",
        ]

    def _get_eta_prediction(self, obj):
        cache_attr = "_cached_eta_prediction"
        if hasattr(obj, cache_attr):
            return getattr(obj, cache_attr)

        if obj.status in ("delivered", "cancelled"):
            result = {
                "delay_risk": "low",
                "top_factors": [f"Order {obj.status}"],
            }
            setattr(obj, cache_attr, result)
            return result

        distance = obj.delivery_distance_km or calculate_distance(
            obj.pickup_lat,
            obj.pickup_lng,
            obj.drop_lat,
            obj.drop_lng,
        )
        vehicle = obj.assigned_vehicle
        result = predict_eta_and_risk(
            distance_km=distance,
            pickup_lat=obj.pickup_lat,
            pickup_lng=obj.pickup_lng,
            drop_lat=obj.drop_lat,
            drop_lng=obj.drop_lng,
            vehicle_type=vehicle.vehicle_type if vehicle else "truck",
            weight=obj.weight,
            capacity=vehicle.capacity if vehicle else 1000.0,
            fuel_level=vehicle.fuel_level if vehicle else 100.0,
            priority=obj.priority,
        )
        setattr(obj, cache_attr, result)
        return result

    def get_assigned_vehicle_name(self, obj):
        if obj.assigned_vehicle:
            return obj.assigned_vehicle.name
        return None

    def get_delay_risk(self, obj):
        return self._get_eta_prediction(obj)["delay_risk"]

    def get_eta_factors(self, obj):
        return self._get_eta_prediction(obj)["top_factors"]
