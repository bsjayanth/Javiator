import json

from channels.generic.websocket import (
    AsyncWebsocketConsumer
)


class OrderConsumer(
    AsyncWebsocketConsumer
):

    async def connect(self):

        print(
            "📦 Order websocket connecting..."
        )

        self.group_name = (
            "orders"
        )

        await self.channel_layer.group_add(

            self.group_name,

            self.channel_name
        )

        await self.accept()

        print(
            "✅ Order websocket connected"
        )

    async def disconnect(
        self,
        close_code
    ):

        print(
            "❌ Order websocket disconnected"
        )

        await self.channel_layer.group_discard(

            self.group_name,

            self.channel_name
        )

    async def receive(
        self,
        text_data
    ):

        pass

    async def send_order_update(
        self,
        event
    ):

        await self.send(

            text_data=json.dumps(
                event["data"]
            )
        )