import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer


logger = logging.getLogger(__name__)


class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.joined_group = False
        self.group_name = "order_tracking"

        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close(code=4401)
            return

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )
        self.joined_group = True
        await self.accept()
        logger.debug("Order WebSocket connected for user %s", user.username)

    async def disconnect(self, close_code):
        if getattr(self, "joined_group", False):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name,
            )

    async def receive(self, text_data):
        pass

    async def send_order_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))
