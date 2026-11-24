from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(
        username=username,
        password=password,
    )

    if user is None:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "role": user.role,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Blacklist the supplied refresh token so it can no longer be rotated."""
    raw_refresh = request.data.get("refresh")
    if not raw_refresh:
        return Response(
            {"error": "Refresh token is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        token = RefreshToken(raw_refresh)
        token.blacklist()
    except TokenError:
        return Response(
            {"error": "Invalid or already blacklisted refresh token."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {"message": "Logged out successfully."},
        status=status.HTTP_200_OK,
    )
