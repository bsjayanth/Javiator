from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)

from rest_framework.response import (
    Response
)

from rest_framework import status

from .models import User

from .serializers import (

    RegisterSerializer,

    UserSerializer,
)


# =================================================
# 🚀 REGISTER USER
# =================================================

@api_view(["POST"])

@permission_classes([AllowAny])

def register_user(request):

    serializer = RegisterSerializer(
        data=request.data
    )

    if serializer.is_valid():

        user = serializer.save()

        return Response(

            {

                "message":
                "User registered successfully",

                "user":
                UserSerializer(user).data,
            },

            status=status.HTTP_201_CREATED
        )

    return Response(

        serializer.errors,

        status=status.HTTP_400_BAD_REQUEST
    )


# =================================================
# 🚀 CURRENT USER
# =================================================

@api_view(["GET"])

@permission_classes([IsAuthenticated])

def current_user(request):

    serializer = UserSerializer(
        request.user
    )

    return Response(serializer.data)