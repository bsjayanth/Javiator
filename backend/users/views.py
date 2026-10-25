from django.contrib.auth import authenticate

from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import (
    AllowAny,
)

from rest_framework.response import Response

from rest_framework import status

from rest_framework_simplejwt.tokens import (
    RefreshToken,
)


@api_view(["POST"])

@permission_classes([AllowAny])

def login_view(request):

    username = request.data.get(
        "username"
    )

    password = request.data.get(
        "password"
    )

    user = authenticate(

        username=username,

        password=password
    )

    if user is None:

        return Response(
            {
                "error":
                "Invalid credentials"
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(
        user
    )

    return Response({

        "access":
        str(refresh.access_token),

        "refresh":
        str(refresh),

        "username":
        user.username,
    })