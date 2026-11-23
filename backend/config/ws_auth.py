import logging
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


logger = logging.getLogger(__name__)


@database_sync_to_async
def _authenticate_jwt_token(raw_token: str):
    if not raw_token:
        return AnonymousUser()

    authenticator = JWTAuthentication()
    try:
        validated_token = authenticator.get_validated_token(raw_token)
        user = authenticator.get_user(validated_token)
        if user and user.is_active:
            return user
    except (InvalidToken, TokenError) as exc:
        logger.debug("Rejected invalid WebSocket JWT token: %s", exc)
    except Exception:
        logger.warning("Unexpected error validating WebSocket JWT token.", exc_info=True)

    return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """Authenticate Channels WebSocket connections via `?token=<jwt>` query param."""

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8", errors="ignore")
        params = parse_qs(query_string)
        raw_token = (params.get("token") or [""])[0].strip()

        scope["user"] = await _authenticate_jwt_token(raw_token)
        return await super().__call__(scope, receive, send)
