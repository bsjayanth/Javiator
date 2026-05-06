import random
from celery import shared_task
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from fleet.models import Vehicle


@shared_task
def update_vehicle_locations():
    channel_layer = get_channel_layer()

    vehicles = Vehicle.objects.all()

    for v in vehicles:
        # simulate small movement
        v.current_lat += random.uniform(-0.001, 0.001)
        v.current_lng += random.uniform(-0.001, 0.001)
        v.save()

        data = {
            "id": v.id,
            "lat": v.current_lat,
            "lng": v.current_lng,
        }

        # send to websocket group
        async_to_sync(channel_layer.group_send)(
            "vehicles",
            {
                "type": "send_vehicle_update",
                "data": data,
            }
        )