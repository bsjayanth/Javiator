"""
Scikit-learn Gradient Boosting ETA & delay-risk prediction service.

Trains on deterministic synthetic Bengaluru corridor trips, evaluates held-out
accuracy against the legacy `distance * 3` baseline, and serves fast (<2 ms)
ETA predictions with delay-risk classification and human-readable attributions.
"""

from __future__ import annotations

import json
import logging
import platform
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import Lock
from typing import Any

import joblib
import numpy as np
import sklearn
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error
from sklearn.model_selection import train_test_split

from .dataset import (
    VEHICLE_FREE_FLOW_SPEED_KMPH,
    build_feature_vector,
    compute_corridor_congestion,
    generate_synthetic_deliveries,
    rush_hour_intensity,
)


logger = logging.getLogger(__name__)

ML_DIR = Path(__file__).resolve().parent
MODEL_ARTIFACT_PATH = ML_DIR / "eta_gbr.joblib"
METRICS_JSON_PATH = ML_DIR / "model_metrics.json"

FEATURE_NAMES: tuple[str, ...] = (
    "distance_km",
    "sin_hour",
    "cos_hour",
    "is_weekend",
    "is_peak_hour",
    "vehicle_type_code",
    "payload_ratio",
    "fuel_level",
    "corridor_congestion",
    "priority_code",
)

IST_OFFSET = timezone(timedelta(hours=5, minutes=30))

_model_lock = Lock()
_cached_bundle: dict[str, Any] | None = None


def train_and_evaluate(
    n_samples: int = 3000,
    seed: int = 42,
    save_artifacts: bool = True,
) -> dict[str, Any]:
    """Train the GradientBoostingRegressor ETA model and benchmark against baseline."""
    samples = generate_synthetic_deliveries(n_samples=n_samples, seed=seed)

    X = np.array([s.features for s in samples], dtype=np.float64)
    y = np.array([s.actual_minutes for s in samples], dtype=np.float64)
    distances = np.array([s.distance_km for s in samples], dtype=np.float64)

    X_train, X_test, y_train, y_test, _, d_test = train_test_split(
        X,
        y,
        distances,
        test_size=0.2,
        random_state=seed,
    )

    model = GradientBoostingRegressor(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        random_state=seed,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    baseline_pred = d_test * 3.0

    ml_mae = float(mean_absolute_error(y_test, y_pred))
    ml_rmse = float(root_mean_squared_error(y_test, y_pred))
    ml_r2 = float(r2_score(y_test, y_pred))

    baseline_mae = float(mean_absolute_error(y_test, baseline_pred))
    baseline_rmse = float(root_mean_squared_error(y_test, baseline_pred))

    mae_improvement_pct = (
        ((baseline_mae - ml_mae) / baseline_mae) * 100.0 if baseline_mae > 0 else 0.0
    )

    importances = {
        name: round(float(score), 4)
        for name, score in sorted(
            zip(FEATURE_NAMES, model.feature_importances_),
            key=lambda item: item[1],
            reverse=True,
        )
    }

    metrics = {
        "model_type": "GradientBoostingRegressor",
        "training_data": "synthetic_bengaluru_corridors",
        "disclaimer": (
            "Trained on deterministic synthetic Bengaluru corridor trips "
            "(portfolio demonstration; not proprietary fleet telemetry)."
        ),
        "n_samples": n_samples,
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "seed": seed,
        "features": list(FEATURE_NAMES),
        "ml_mae_minutes": round(ml_mae, 2),
        "ml_rmse_minutes": round(ml_rmse, 2),
        "ml_r2": round(ml_r2, 4),
        "baseline_formula": "distance_km * 3.0",
        "baseline_mae_minutes": round(baseline_mae, 2),
        "baseline_rmse_minutes": round(baseline_rmse, 2),
        "mae_improvement_pct": round(mae_improvement_pct, 1),
        "feature_importances": importances,
        "sklearn_version": sklearn.__version__,
        "python_version": platform.python_version(),
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }

    bundle = {
        "model": model,
        "metadata": metrics,
    }

    if save_artifacts:
        ML_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(bundle, MODEL_ARTIFACT_PATH, compress=3)
        METRICS_JSON_PATH.write_text(
            json.dumps(metrics, indent=2) + "\n",
            encoding="utf-8",
        )
        logger.info(
            "Trained ETA model (MAE=%.2f min vs baseline %.2f min, R2=%.4f)",
            ml_mae,
            baseline_mae,
            ml_r2,
        )

    global _cached_bundle
    with _model_lock:
        _cached_bundle = bundle

    return metrics


def load_or_train_model() -> dict[str, Any]:
    """Load cached/disk model bundle or transparently retrain on version mismatch."""
    global _cached_bundle

    with _model_lock:
        if _cached_bundle is not None:
            return _cached_bundle

        if MODEL_ARTIFACT_PATH.exists():
            try:
                bundle = joblib.load(MODEL_ARTIFACT_PATH)
                meta = bundle.get("metadata", {})
                if (
                    bundle.get("model") is not None
                    and meta.get("sklearn_version") == sklearn.__version__
                ):
                    _cached_bundle = bundle
                    return _cached_bundle
                logger.info(
                    "ETA model artifact version mismatch (%s != %s); retraining.",
                    meta.get("sklearn_version"),
                    sklearn.__version__,
                )
            except Exception:
                logger.warning(
                    "Unable to load ETA model artifact; retraining cleanly.",
                    exc_info=True,
                )

    train_and_evaluate(save_artifacts=True)
    with _model_lock:
        assert _cached_bundle is not None
        return _cached_bundle


def get_model_metrics() -> dict[str, Any]:
    """Return latest held-out evaluation metrics for the ETA model."""
    if METRICS_JSON_PATH.exists():
        try:
            return json.loads(METRICS_JSON_PATH.read_text(encoding="utf-8"))
        except Exception:
            logger.warning("Failed to parse model_metrics.json; regenerating.", exc_info=True)

    bundle = load_or_train_model()
    return dict(bundle["metadata"])


def predict_eta_and_risk(
    *,
    distance_km: float,
    pickup_lat: float,
    pickup_lng: float,
    drop_lat: float,
    drop_lng: float,
    vehicle_type: str = "truck",
    weight: float = 100.0,
    capacity: float = 1000.0,
    fuel_level: float = 100.0,
    priority: str = "medium",
    timestamp: datetime | None = None,
) -> dict[str, Any]:
    """Predict delivery ETA (minutes), congestion delay, risk level, and top factors."""
    bundle = load_or_train_model()
    model = bundle["model"]

    now_ist = (timestamp or datetime.now(timezone.utc)).astimezone(IST_OFFSET)
    hour = now_ist.hour + (now_ist.minute / 60.0)
    day_of_week = now_ist.weekday()

    safe_distance = max(float(distance_km), 0.1)
    safe_capacity = max(float(capacity), 1.0)
    payload_ratio = min(max(float(weight) / safe_capacity, 0.0), 1.0)
    safe_fuel = min(max(float(fuel_level), 0.0), 100.0)

    congestion = compute_corridor_congestion(
        float(pickup_lat),
        float(pickup_lng),
        float(drop_lat),
        float(drop_lng),
    )
    temporal_wave = rush_hour_intensity(hour, day_of_week)

    features = build_feature_vector(
        distance_km=safe_distance,
        hour=hour,
        day_of_week=day_of_week,
        vehicle_type=vehicle_type,
        payload_ratio=payload_ratio,
        fuel_level=safe_fuel,
        corridor_congestion=congestion,
        priority=priority,
    )

    predicted_eta = float(model.predict(np.array([features], dtype=np.float64))[0])
    predicted_eta = round(max(3.0, predicted_eta), 1)

    baseline_eta = round(safe_distance * 3.0, 1)
    free_flow_speed = VEHICLE_FREE_FLOW_SPEED_KMPH.get(vehicle_type, 27.0)
    free_flow_drive = (safe_distance / free_flow_speed) * 60.0
    baseline_handling = (
        4.0 + (4.5 * payload_ratio) + (2.0 if vehicle_type == "truck" else 0.0)
    )
    free_flow_total = free_flow_drive + baseline_handling
    estimated_delay = round(max(0.0, predicted_eta - free_flow_total), 1)

    delay_ratio = estimated_delay / max(free_flow_total, 5.0)
    if delay_ratio >= 0.50 or safe_fuel < 18.0:
        delay_risk = "high"
    elif delay_ratio >= 0.22 or (congestion >= 0.65 and temporal_wave >= 0.55):
        delay_risk = "medium"
    else:
        delay_risk = "low"

    factors: list[str] = []
    if temporal_wave >= 0.65:
        factors.append("Peak Bengaluru rush-hour traffic window")
    if congestion >= 0.65:
        factors.append("High corridor congestion near major arterial hub")
    if payload_ratio >= 0.75:
        factors.append(f"Heavy load ratio ({round(payload_ratio * 100)}% capacity)")
    if safe_fuel < 20.0:
        factors.append("Low fuel reserve increases delay risk")
    if vehicle_type == "truck":
        factors.append("Heavy truck urban speed profile")
    if not factors:
        factors.append("Normal corridor and free-flow operating conditions")

    return {
        "predicted_eta_minutes": predicted_eta,
        "baseline_eta_minutes": baseline_eta,
        "free_flow_minutes": round(free_flow_total, 1),
        "estimated_delay_minutes": estimated_delay,
        "delay_risk": delay_risk,
        "corridor_congestion": congestion,
        "top_factors": factors[:3],
    }
