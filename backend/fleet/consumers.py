import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer


logger = logging.getLogger(__name__)


class FleetConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.joined_group = False
        self.room_group_name = "fleet_tracking"

        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close(code=4401)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        self.joined_group = True
        await self.accept()
        logger.debug("Fleet WebSocket connected for user %s", user.username)

    async def disconnect(self, close_code):
        if getattr(self, "joined_group", False):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )

    async def send_vehicle_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))
