import os

from channels.auth import (
    AuthMiddlewareStack
)

from channels.routing import (
    ProtocolTypeRouter,
    URLRouter,
)

from django.core.asgi import (
    get_asgi_application
)

import fleet.routing
import orders.routing


os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings"
)

django_asgi_app = (
    get_asgi_application()
)

application = ProtocolTypeRouter({

    "http": django_asgi_app,

    "websocket": AuthMiddlewareStack(

        URLRouter(

            fleet.routing.websocket_urlpatterns

            +

            orders.routing.websocket_urlpatterns
        )
    ),
})