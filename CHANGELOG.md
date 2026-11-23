# Changelog

All notable milestones in the development of Javiator, aligned with the repository commit history.

---

## [Unreleased]

- JWT-authenticated WebSockets (`ws/fleet/`, `ws/orders/`) and live map push updates
- Event-driven dispatch with OpenRouteService route caching and deduplicated alerts
- Live PostgreSQL-backed analytics aggregations and charts
- Automated Django test suite and GitHub Actions CI
- Seeded demo accounts and free-tier deployment setup

---

## 2026-11 — Cloud Readiness, RBAC Enforcement & Repository Cleanup

- **Configuration & Health Probes (`bd35ba8`, `76e8f11`):** Added `.env.example`, fixed `.gitignore` syntax, added environment-driven `DATABASE_URL`, `REDIS_URL`, `CHANNEL_LAYER_BACKEND`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` support, enabled `rest_framework_simplejwt.token_blacklist`, and exposed `/healthz/` and `/readyz/` health endpoints.
- **Frontend API & Auth Client (`c5b55fd`):** Replaced hardcoded localhost URLs in `javiator-ui/` with centralized `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` helpers, added deduplicated silent JWT refresh on `401`, and routed vehicle/order modals and tables through `apiFetch`.
- **API & UI Contract Fixes (`f1aa59b`):** Aligned `/api/fleet/kpis/` fields (`moving_vehicles`, `low_fuel_vehicles`, `order_fulfillment`), exposed order `delivery_progress` and read-only telemetry fields on `OrderSerializer`, fixed `ClientTrackingPanel` ETA/progress display, and passed `role` to `VehicleTable`.
- **Server-Side RBAC (`cb05867`):** Added `IsAdminOrManager` and `IsAdminOrManagerOrReadOnly` permissions across Fleet, Orders, Analytics, Notifications, and Simulation endpoints, and protected server-computed telemetry fields on `VehicleSerializer`.
- **Repository Organization (`21fb63f`):** Removed the legacy `frontend/` Vite prototype, unused backend files (`delivery_simulator.py`, draft `tracking` consumer/routing, empty `config/migrations/`), and unused Next.js starter SVGs; cleaned unused model code in `users/models.py`; added root `README.md` and updated `javiator-ui/README.md`.

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
