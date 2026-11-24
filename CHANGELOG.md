# Changelog

All notable milestones in the development of Javiator, aligned with the repository commit history.

---

## [Unreleased]

- Live PostgreSQL-backed analytics aggregations and restored Recharts visualizations
- DB-grounded AI Operations Copilot (free-tier LLM API with deterministic telemetry anomaly fallback)
- Automated Django test suite and GitHub Actions CI
- Seeded demo accounts, one-click demo login, and free-tier Render deployment setup

---

## 2026-11 — ML ETA Intelligence, Global Optimizer, JWT WebSockets & Cloud Readiness

- **JWT Logout Blacklisting:** Added `POST /api/users/logout/` to blacklist refresh tokens server-side on sign-out, returned user `role` from `/api/users/login/`, and wired `javiator-ui/services/auth.ts` to revoke tokens before clearing local session state.
- **Global Dispatch Optimizer & UI Controls (`194c137`, `f8d55fa`):** Added `backend/dispatch/optimizer.py` with `scipy.optimize.linear_sum_assignment` (Hungarian algorithm) over an ML-informed multi-factor cost matrix, greedy nearest-vehicle baseline benchmarking (`POST /api/orders/optimize-dispatch/`), and precedence-preserving multi-stop 2-opt route sequencing; surfaced ML delay-risk badges, dispatch scores, **Optimize Batch**, and **Step GPS** controls in `OrderTable` and `DispatchPanel`.
- **Predictive ETA & Delay-Risk ML Pipeline (`db4514c`, `3b94b04`):** Added reproducible synthetic Bengaluru corridor training data and a `scikit-learn` `GradientBoostingRegressor` (`python manage.py train_eta_model`), achieving 4.51 min held-out MAE vs. 14.89 min naive baseline (69.7% reduction, R² = 0.9644); integrated live ML ETA & risk inference into dispatch, tracking, `OrderSerializer`, and `GET /api/analytics/model-metrics/`.
- **Event-Driven Dispatch, Caching & Free-Tier Mode (`7cd069a`):** Added thread-safe LRU OpenRouteService route caching, deduplicated operational alerts, event-driven order dispatch (`FREE_TIER_DEMO_MODE`), manual `POST /api/orders/<id>/dispatch/`, deterministic `POST /api/fleet/tick/`, clustered-order completion fixes, and consolidated Celery Beat schedules.
- **Authenticated Real-Time WebSockets (`9f90fc0`):** Added Channels `JWTAuthMiddleware` (`?token=<jwt>`, `4401` rejection for anonymous/invalid sockets), fixed `OrderConsumer` group name mismatch (`orders` → `order_tracking`), added `fleetSocket.ts` with reconnect backoff, and connected `FleetMap` to live `ws/fleet/` updates.
- **Server-Side RBAC & Repository Cleanup (`cb05867`, `21fb63f`, `378e841`):** Enforced DRF role permissions (`IsAdminOrManager`, `IsAdminOrManagerOrReadOnly`), protected read-only telemetry fields on `VehicleSerializer`, removed the legacy `frontend/` Vite prototype and unused backend/starter files, and added root `README.md` and `CHANGELOG.md`.
- **12-Factor Cloud Config & Contracts (`76e8f11`, `bd35ba8`, `c5b55fd`, `f1aa59b`):** Added `.env.example`, env-driven `DATABASE_URL`/`REDIS_URL`/`CORS`/`CSRF`, `rest_framework_simplejwt.token_blacklist`, `/healthz/` & `/readyz/` probes, centralized env-driven Next.js API/WS clients with deduplicated silent JWT refresh, and aligned Fleet KPI & Order serializer contracts.

---

## 2026-10 — PostgreSQL Migration, Concurrency Safety & Security Hardening

- **Backend Hardening (`e7b97e8`):** Externalized `DJANGO_SECRET_KEY`, `DEBUG`, `DJANGO_ALLOWED_HOSTS`, and `ORS_API_KEY` to environment variables; hardened the OpenRouteService client with coordinate validation, timeouts, and structured error handling; wrapped vehicle assignment in `transaction.atomic()` with `select_for_update()`; locked self-registration to `role="client"`; mounted `/api/accounts/` and JWT refresh/verify routes.
- **Database & Migrations (`32e5a26`, `5bd2087`, `5c8dba2`):** Consolidated migration history, transitioned Django settings and Docker Compose to PostgreSQL (`postgis/postgis:15-3.4` with DB healthcheck and `manage.py migrate` on startup), and expanded `.gitignore` for development artifacts.

---

## 2026-05 — Core Logistics Control Tower, Routing & Real-Time Simulation

- **Platform Foundation (`6c73f3d`, `4f4ce3d`, `9fdc3ea`):** Built initial Django REST Framework backend for fleet and vehicle management, refactored tracking architecture, and added the live fleet KPI API.
- **Routing, Auto-Dispatch & Simulation (`df20675`, `cba4b41`):** Integrated OpenRouteService road-network routing, weighted heuristic auto-dispatch, Celery worker/beat simulation loops, and delivery status progression on the map.
- **WebSockets, Telemetry & Alerts (`5904377`, `cacaa92`, `033689d`):** Added Django Channels with Redis, ETA calculations, driver performance metrics, and in-app operational notifications.
- **Next.js Control-Tower UI & Role Views (`a75ad5f`, `82c61f7`, `34b55ff`, `6c063d6`):** Built the `javiator-ui` design system with dark/light modes and Leaflet map optimization, integrated `/api/accounts/me/` authenticated user state, and added role-aware dashboard layouts.
