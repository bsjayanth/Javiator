from django.urls import path

from .views import (

    register_user,

    current_user,
)


urlpatterns = [

    # =================================================
    # 🚀 REGISTER
    # =================================================

    path(
        "register/",
        register_user
    ),

    # =================================================
    # 🚀 CURRENT USER
    # =================================================

    path(
        "me/",
        current_user
    ),
]