from rest_framework import serializers

from .models import Order


class OrderSerializer(
    serializers.ModelSerializer
):

    assigned_vehicle_name = (
        serializers.SerializerMethodField()
    )

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

            "estimated_delivery_time",

            "actual_delivery_time",

            "delivery_distance_km",

            "delivered_at",

            "created_at",

            "updated_at",
        ]

    # =====================================================
    # 🚚 VEHICLE NAME
    # =====================================================

    def get_assigned_vehicle_name(
        self,
        obj
    ):

        if obj.assigned_vehicle:

            return (
                obj.assigned_vehicle.name
            )

        return None
