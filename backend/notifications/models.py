from django.db import models


class Notification(models.Model):

    # =====================================================
    # 🚀 ALERT TYPES
    # =====================================================

    ALERT_TYPES = [

        ("dispatch", "Dispatch"),

        ("delivery", "Delivery"),

        ("fuel", "Fuel"),

        ("traffic", "Traffic"),

        ("system", "System"),

        ("vehicle", "Vehicle"),

        ("analytics", "Analytics"),
    ]

    # =====================================================
    # 🚀 SEVERITY LEVELS
    # =====================================================

    SEVERITY_LEVELS = [

        ("info", "Info"),

        ("warning", "Warning"),

        ("critical", "Critical"),
    ]

    # =====================================================
    # 🚀 MAIN DATA
    # =====================================================

    title = models.CharField(
        max_length=255
    )

    message = models.TextField()

    alert_type = models.CharField(
        max_length=30,
        choices=ALERT_TYPES,
        default="system"
    )

    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_LEVELS,
        default="info"
    )

    # =====================================================
    # 🚀 OPTIONAL LINKS
    # =====================================================

    vehicle = models.ForeignKey(

        "fleet.Vehicle",

        on_delete=models.CASCADE,

        null=True,

        blank=True,

        related_name="notifications"
    )

    order = models.ForeignKey(

        "orders.Order",

        on_delete=models.CASCADE,

        null=True,

        blank=True,

        related_name="notifications"
    )

    # =====================================================
    # 🚀 STATUS
    # =====================================================

    is_read = models.BooleanField(
        default=False
    )

    is_active = models.BooleanField(
        default=True
    )

    # =====================================================
    # 🚀 TIMESTAMPS
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

    def __str__(self):

        return (

            f"[{self.severity.upper()}] "

            f"{self.title}"
        )