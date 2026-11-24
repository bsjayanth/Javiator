from django.urls import path

from .views import dashboard_metrics, model_metrics


urlpatterns = [
    path("dashboard/", dashboard_metrics, name="analytics-dashboard"),
    path("model-metrics/", model_metrics, name="analytics-model-metrics"),
]
