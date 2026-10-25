
from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)


urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/fleet/", include("fleet.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/accounts/", include("accounts.urls")),
    path("api/users/", include("users.urls")),

    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    path("api/analytics/", include("analytics.urls")),
]

urlpatterns += static(
    settings.STATIC_URL,
    document_root=settings.STATIC_ROOT,
)
