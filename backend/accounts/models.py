from django.db import models

from django.contrib.auth.models import (
    AbstractUser
)


class User(AbstractUser):

    ROLE_CHOICES = [

        ("admin", "Admin"),

        ("manager", "Manager"),

        ("driver", "Driver"),

        ("client", "Client"),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="client"
    )

    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    profile_image = models.URLField(
        blank=True,
        null=True
    )

    is_online = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return (

            f"{self.username} "
            f"({self.role})"
        )