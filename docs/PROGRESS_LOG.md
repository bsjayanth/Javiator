# Javiator — 3-Day Portfolio Sprint Progress Log

This log tracks each session, completed changes, verification results, and pending approvals across our three-day portfolio plan.

---

## Plan Overview

- **Day 1:** Foundation, config hardening, health probes, Next.js env centralization, API↔UI contract fixes.
- **Day 2:** Server-side RBAC enforcement, WebSocket JWT auth & group fix, event-driven dispatch + free-tier demo mode, real PostgreSQL analytics + honest operational insights, automated test suite.
- **Day 3:** One-click Demo Login + `seed_demo`, Sidebar navigation & UI polish, slim non-root Dockerfile + CI + `render.yaml`, honest root `README.md`, CV bullets, and free Render deployment (if separately approved).

---

## Day 1 — Completed (Uncommitted; Awaiting Review & Commit Approval)

### Implemented Steps
- [x] **Step 1 — Repo Hygiene & Onboarding Template**
  - Fixed stray markdown fences in `.gitignore`.
  - Added `.env.example` with safe placeholders for all backend and Next.js environment variables.
  - Created `docs/PROGRESS_LOG.md`.
- [ ] **Step 2 — Candidate Dead/Legacy File Deletions (Held for Explicit Per-Item Approval)**
  - Deferred deleting `frontend/`, `backend/dispatch/delivery_simulator.py`, `backend/tracking/consumers.py`, `backend/tracking/routing.py`, and cleaning unused model code in `backend/users/models.py` until each deletion is explicitly approved.
- [x] **Step 3 — 12-Factor Django Configuration (`backend/config/settings.py`)**
  - Added stdlib `DATABASE_URL` parsing (PostgreSQL with SSL query options + SQLite for in-memory checks/CI) while preserving existing `POSTGRES_*` Docker Compose defaults.
  - Added `REDIS_URL` support for both `CHANNEL_LAYERS` and `CELERY_BROKER_URL`, plus `CHANNEL_LAYER_BACKEND=memory` option for single-instance demo/test environments.
  - Made `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` environment-driven.
  - Added reverse-proxy HTTPS headers (`SECURE_PROXY_SSL_HEADER`, `USE_X_FORWARDED_HOST`, production secure cookie flags), conditional `STATICFILES_DIRS`, and structured console `LOGGING`.
- [x] **Step 4 — JWT Blacklist Fix & Health Probes (`backend/config/health.py`, `backend/config/urls.py`, `backend/config/settings.py`)**
  - Added `rest_framework_simplejwt.token_blacklist` to `INSTALLED_APPS` so `BLACKLIST_AFTER_ROTATION = True` no longer crashes `/api/token/refresh/`. *(Requires running `python manage.py migrate` when next applying migrations.)*
  - Added `GET /healthz/` (liveness) and `GET /readyz/` (database + optional Redis readiness) endpoints.
- [x] **Step 5 — Centralize `javiator-ui/` API & WebSocket URLs (`javiator-ui/services/`, modals, tables, login)**
  - Exported env-driven `API_BASE` (`NEXT_PUBLIC_API_URL`) and `WS_BASE` (`NEXT_PUBLIC_WS_URL` or auto-derived `ws`/`wss`) in `javiator-ui/services/api.ts`.
  - Added deduplicated silent JWT refresh on `401` inside `apiFetch` to prevent concurrent refresh-token rotation races.
  - Replaced all 10 hardcoded `127.0.0.1:8000` / `ws://127.0.0.1:8000` URLs across `api.ts`, `orderSocket.ts`, `login/page.tsx`, `AddOrderModal.tsx`, `AddVehicleModal.tsx`, `OrderTable.tsx`, and `VehicleTable.tsx`.
  - Fixed `AddVehicleModal.tsx` missing `Authorization` header by routing through `apiFetch`.
- [x] **Step 6 — API↔UI Contract Alignment (`backend/fleet/views.py`, `backend/orders/serializers.py`, `page.tsx`, `KPIGrid.tsx`, `ClientTrackingPanel.tsx`)**
  - Updated `fleet_kpis` to use SQL `Avg("fuel_level")` and return `moving_vehicles`, `low_fuel_vehicles`, `delivered_orders` alongside backwards-compatible `moving_now` / `low_fuel`.
  - Removed redundant 5s `/api/analytics/dashboard/` poll from `KPIGrid.tsx`; fulfillment now comes directly from `/api/fleet/kpis/`.
  - Exposed `delivery_progress`, `ai_dispatch_score`, `traffic_delay_minutes`, `fuel_cost_estimate`, `carbon_emission_score`, `assigned_at`, and `pickup_started_at` on `OrderSerializer` with server-computed fields marked `read_only_fields`.
  - Fixed `ClientTrackingPanel.tsx` to read `estimated_delivery_time` and `delivery_progress`, and replaced overclaiming footer copy with honest simulation wording.
  - Passed missing `role={role}` prop to `<VehicleTable>` in `javiator-ui/app/page.tsx` so Admin/Manager fleet actions render properly.

### Day 1 Checks Executed & Results
- `git check-ignore -v .env backend/db.sqlite3 backend/celerybeat-schedule backend/staticfiles` — **Passed** (all 4 ignored by `.gitignore`).
- Hardcoded URL grep across `javiator-ui/` — **Passed** (only intentional `DEFAULT_API_BASE` fallback in `javiator-ui/services/api.ts`).
- `DATABASE_URL=sqlite:///:memory: CHANNEL_LAYER_BACKEND=memory DEBUG=True venv/Scripts/python.exe backend/manage.py check` — **Passed** (`System check identified no issues (0 silenced).`).
- In-memory probe verification via Django test `Client`:
  - `GET /healthz/` → `200 {"status": "ok", "service": "javiator-api"}`
  - `GET /readyz/` → `200 {"status": "ready", "checks": {"database": "ok", "redis": "skipped (in-memory channels)"}}`
  - `_build_database_config()` with `postgresql://...?sslmode=require` → parsed engine, host, port, name, and `{'sslmode': 'require'}`.
- `npx tsc --noEmit` (in `javiator-ui/`) — **Passed** (0 errors).
- `npx eslint` on modified UI files (`api.ts`, `orderSocket.ts`, `login/page.tsx`, `page.tsx`, `AddOrderModal.tsx`, `AddVehicleModal.tsx`, `KPIGrid.tsx`, `ClientTrackingPanel.tsx`) — **Passed** (0 errors, 0 warnings).
- Full `npm run lint` across all of `javiator-ui/` — **Reported 9 pre-existing errors / 27 warnings** in untouched/pre-existing components (`AnalyticsDashboard.tsx`, `FleetMap.tsx`, `NotificationCenter.tsx`, `ActivityFeed.tsx`, and pre-existing `useEffect` lint rules in `OrderTable.tsx` / `VehicleTable.tsx`); tracked to clean up in Day 2/3.

---

## Ready for Day 2 Start (Pending Your Approval)
1. **Commit Day 1 work** (proposed 5 focused commits — no commits have been made yet):
   1. `chore: fix gitignore fences, add env example, and start progress log`
   2. `feat(config): support DATABASE_URL, REDIS_URL, and env-driven CORS/CSRF`
   3. `feat(api): enable JWT token blacklist app and add healthz/readyz probes`
   4. `feat(ui): centralize env-driven API/WS clients with silent token refresh`
   5. `fix(contracts): align fleet KPIs, order serializer progress/ETA, and vehicle table role prop`
2. **Approve Step 2 per-item deletions** (if desired): `frontend/`, `backend/dispatch/delivery_simulator.py`, `backend/tracking/consumers.py` + `backend/tracking/routing.py`, unused `User` model in `backend/users/models.py`.
3. **Begin Day 2:** Server-side RBAC, WebSocket group/JWT auth, event-driven dispatch + Render free-tier demo mode, real PostgreSQL analytics, and automated tests.
