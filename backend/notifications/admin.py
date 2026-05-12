from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = (

        "id",

        "title",

        "alert_type",

        "severity",

        "vehicle",

        "order",

        "is_read",

        "created_at",
    )

    list_filter = (

        "alert_type",

        "severity",

        "is_read",
    )

    search_fields = (

        "title",

        "message",
    )

    ordering = (
        "-created_at",
    )