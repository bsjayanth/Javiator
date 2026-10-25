from rest_framework.decorators import api_view

from rest_framework.response import Response

from rest_framework import status

from .models import Notification


# =====================================================
# 🚀 GET ALL NOTIFICATIONS
# =====================================================

@api_view(["GET"])
def get_notifications(request):

    notifications = Notification.objects.all()[:30]

    data = []

    for notification in notifications:

        data.append({

            "id":
            notification.id,

            "title":
            notification.title,

            "message":
            notification.message,

            "alert_type":
            notification.alert_type,

            "severity":
            notification.severity,

            "is_read":
            notification.is_read,

            "created_at":
            notification.created_at,

            "vehicle":
            (
                notification.vehicle.name
                if notification.vehicle
                else None
            ),

            "order":
            (
                notification.order.id
                if notification.order
                else None
            ),
        })

    return Response(data)


# =====================================================
# 🚀 UNREAD NOTIFICATION COUNT
# =====================================================

@api_view(["GET"])
def unread_notification_count(request):

    unread_count = (
        Notification.objects.filter(
            is_read=False
        ).count()
    )

    return Response({

        "unread_count":
        unread_count
    })


# =====================================================
# 🚀 MARK SINGLE NOTIFICATION AS READ
# =====================================================

@api_view(["POST"])
def mark_notification_read(
    request,
    notification_id
):

    try:

        notification = (
            Notification.objects.get(
                id=notification_id
            )
        )

    except Notification.DoesNotExist:

        return Response(

            {
                "error":
                "Notification not found"
            },

            status=status.HTTP_404_NOT_FOUND
        )

    notification.is_read = True

    notification.save()

    return Response({

        "message":
        "Notification marked as read"
    })


# =====================================================
# 🚀 MARK ALL AS READ
# =====================================================

@api_view(["POST"])
def mark_all_notifications_read(
    request
):

    Notification.objects.filter(
        is_read=False
    ).update(is_read=True)

    return Response({

        "message":
        "All notifications marked as read"
    })