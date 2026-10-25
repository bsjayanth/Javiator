from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    list_display = (
        "id",
        "username",
        "email",
        "role",
        "is_staff",
        "is_active",
    )

    search_fields = (
        "username",
        "email",
        "role",
    )

    list_filter = (
        "role",
        "is_staff",
        "is_active",
    )

    fieldsets = UserAdmin.fieldsets + (

        (
            "Javiator RBAC",

            {
                "fields": (
                    "role",
                )
            },
        ),
    )