from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "role",
            "phone_number",
        ]
        read_only_fields = ["id", "role"]

    def create(self, validated_data):
        validated_data.pop("role", None)

        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            role="client",
            phone_number=validated_data.get("phone_number"),
        )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "phone_number",
            "is_online",
        ]
        read_only_fields = [
            "id",
            "username",
            "email",
            "role",
            "is_online",
        ]
