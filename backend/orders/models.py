from django.db import models

from django.utils import timezone


class Order(models.Model):

    # =====================================================
    # ORDER STATUS
    # =====================================================

    ORDER_STATUS = [

        ("created", "Created"),

        ("assigned", "Assigned"),

        ("pickup_started", "Pickup Started"),

        ("in_transit", "In Transit"),

        ("delivered", "Delivered"),

        ("cancelled", "Cancelled"),
    ]

    # =====================================================
    # PRIORITY LEVELS
    # =====================================================

    PRIORITY_LEVELS = [

        ("low", "Low"),

        ("medium", "Medium"),

        ("high", "High"),
    ]

    # =====================================================
    # CUSTOMER DETAILS
    # =====================================================

    customer_name = models.CharField(
        max_length=100,
        default="Customer"
    )

    customer_phone = models.CharField(
        max_length=20,
        blank=True,
        default=""
    )

    # =====================================================
    # PICKUP LOCATION
    # =====================================================

    pickup_address = models.TextField(
        blank=True,
        default=""
    )

    pickup_lat = models.FloatField()

    pickup_lng = models.FloatField()

    # =====================================================
    # DELIVERY LOCATION
    # =====================================================

    drop_address = models.TextField(
        blank=True,
        default=""
    )

    drop_lat = models.FloatField()

    drop_lng = models.FloatField()

    # =====================================================
    # PACKAGE INFO
    # =====================================================

    weight = models.FloatField()

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_LEVELS,
        default="medium"
    )

    # =====================================================
    # ORDER STATUS
    # =====================================================

    status = models.CharField(
        max_length=30,
        choices=ORDER_STATUS,
        default="created"
    )

    # =====================================================
    # VEHICLE ASSIGNMENT
    # =====================================================

    assigned_vehicle = models.ForeignKey(
        "fleet.Vehicle",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_orders"
    )

    # =====================================================
    # REALTIME ROUTE DATA
    # =====================================================

    route_data = models.JSONField(
        null=True,
        blank=True
    )

    # =====================================================
    # DELIVERY TRACKING
    # =====================================================

    pickup_completed = models.BooleanField(
        default=False
    )

    delivery_completed = models.BooleanField(
        default=False
    )

    # ETA IN MINUTES

    estimated_delivery_time = models.IntegerField(
        default=30
    )

    # ACTUAL DELIVERY TIME

    actual_delivery_time = models.IntegerField(
        default=0
    )

    # TOTAL DISTANCE

    delivery_distance_km = models.FloatField(
        default=0
    )

    # =====================================================
    # 🚀 LIVE DELIVERY PROGRESS %
    # =====================================================

    delivery_progress = models.FloatField(
        default=0
    )

    # =====================================================
    # AI DELIVERY METRICS
    # =====================================================

    ai_dispatch_score = models.FloatField(
        default=0
    )

    traffic_delay_minutes = models.FloatField(
        default=0
    )

    fuel_cost_estimate = models.FloatField(
        default=0
    )

    carbon_emission_score = models.FloatField(
        default=0
    )

    # =====================================================
    # DELIVERY TIMESTAMPS
    # =====================================================

    assigned_at = models.DateTimeField(
        null=True,
        blank=True
    )

    pickup_started_at = models.DateTimeField(
        null=True,
        blank=True
    )

    delivered_at = models.DateTimeField(
        null=True,
        blank=True
    )

    # =====================================================
    # SYSTEM TIMESTAMPS
    # =====================================================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # =====================================================

    class Meta:

        ordering = ["-created_at"]

    # =====================================================
    # AUTO STATUS HELPERS
    # =====================================================

    @property
    def is_active(self):

        return self.status not in [

            "delivered",

            "cancelled"
        ]

    @property
    def is_completed(self):

        return self.status == "delivered"

    # =====================================================
    # MARK AS DELIVERED
    # =====================================================

    def mark_delivered(self):

        self.status = "delivered"

        self.delivery_completed = True

        self.delivery_progress = 100

        self.delivered_at = timezone.now()

        self.save()

    # =====================================================

    def __str__(self):

        return (

            f"Order {self.id} - "

            f"{self.customer_name}"
        )