from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Vehicle
from .serializers import VehicleSerializer


@api_view(['GET'])
def vehicle_list(request):

    vehicles = Vehicle.objects.all()

    serializer = VehicleSerializer(vehicles, many=True)

    return Response(serializer.data)