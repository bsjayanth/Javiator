from django.urls import path

from .views import (

    get_notifications,

    unread_notification_count,

    mark_notification_read,

    mark_all_notifications_read,
)

urlpatterns = [

    # 🚀 GET ALL NOTIFICATIONS

    path(

        "",

        get_notifications,

        name="get_notifications"
    ),

    # 🚀 UNREAD COUNT

    path(

        "unread-count/",

        unread_notification_count,

        name="unread_notification_count"
    ),

    # 🚀 MARK SINGLE READ

    path(

        "mark-read/<int:notification_id>/",

        mark_notification_read,

        name="mark_notification_read"
    ),

    # 🚀 MARK ALL READ

    path(

        "mark-all-read/",

        mark_all_notifications_read,

        name="mark_all_notifications_read"
    ),
]