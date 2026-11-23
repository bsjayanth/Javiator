from rest_framework.permissions import (
    BasePermission,
    SAFE_METHODS,
)


# =====================================================
# 🚀 ADMIN ONLY
# =====================================================

class IsAdmin(
    BasePermission
):

    def has_permission(

        self,

        request,

        view
    ):

        return (

            request.user.is_authenticated

            and

            request.user.role
            == "admin"
        )


# =====================================================
# 🚀 MANAGER ONLY
# =====================================================

class IsManager(
    BasePermission
):

    def has_permission(

        self,

        request,

        view
    ):

        return (

            request.user.is_authenticated

            and

            request.user.role
            == "manager"
        )


# =====================================================
# 🚀 DRIVER ONLY
# =====================================================

class IsDriver(
    BasePermission
):

    def has_permission(

        self,

        request,

        view
    ):

        return (

            request.user.is_authenticated

            and

            request.user.role
            == "driver"
        )


# =====================================================
# 🚀 CLIENT ONLY
# =====================================================

class IsClient(
    BasePermission
):

    def has_permission(

        self,

        request,

        view
    ):

        return (

            request.user.is_authenticated

            and

            request.user.role
            == "client"
        )


# =====================================================
# 🚀 ADMIN FULL ACCESS
# 🚀 MANAGER LIMITED ACCESS
# 🚀 DRIVER READONLY
# 🚀 CLIENT BLOCKED
# =====================================================

class FleetAccessPermission(
    BasePermission
):

    def has_permission(

        self,

        request,

        view
    ):

        user = request.user

        if not user.is_authenticated:

            return False

        # ============================================
        # ADMIN → FULL ACCESS
        # ============================================

        if user.role == "admin":

            return True

        # ============================================
        # MANAGER
        # ============================================

        if user.role == "manager":

            return True

        # ============================================
        # DRIVER
        # ============================================

        if user.role == "driver":

            return (

                request.method
                in SAFE_METHODS
            )

        # ============================================
        # CLIENT
        # ============================================

        if user.role == "client":

            return False

        return False


# =====================================================
# ADMIN / MANAGER WRITE ACCESS
# =====================================================

class IsAdminOrManager(BasePermission):
    """Allow access only to admin/manager roles or Django superusers."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_superuser or user.role in ("admin", "manager"))
        )


class IsAdminOrManagerOrReadOnly(BasePermission):
    """Allow authenticated read-only access; restrict mutations to admin/manager."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False

        if request.method in SAFE_METHODS:
            return True

        return bool(user.is_superuser or user.role in ("admin", "manager"))