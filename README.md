# Javiator — AI-Powered Logistics Intelligence Control Tower (Portfolio Prototype)

Javiator is a full-stack logistics dispatch, route optimization, and fleet telemetry control-tower prototype built with **Django REST Framework**, **Django Channels**, **Celery**, **scikit-learn**, **SciPy**, **PostgreSQL**, **Redis**, and **Next.js (TypeScript)**.

> **Honest scope note:** This repository is a portfolio demonstration and simulation prototype, not a production logistics system. The ML ETA model is trained on a deterministic **synthetic Bengaluru corridor dataset** (not proprietary fleet logs), and vehicle movement is simulated along decoded OpenRouteService road polylines rather than ingested from live GPS hardware.

---

## Core Architecture

```text
Javiator/
├── backend/                      # Django 5.2 + DRF + Channels (Daphne) + Celery
│   ├── config/                   # 12-factor settings, URLs, ASGI/WSGI, JWT WS auth, Celery, health probes
│   ├── accounts/                 # Custom User model, registration, /me, DRF RBAC permissions
│   ├── users/                    # JWT login & refresh-token logout blacklisting (/api/users/)
│   ├── fleet/                    # Vehicle models, read-only telemetry serializer, KPIs, tick & WS consumer
│   ├── orders/                   # Order models, event-driven dispatch, batch optimize API, WS consumer
│   ├── dispatch/
│   │   ├── ml/                   # scikit-learn GradientBoosting ETA & delay-risk pipeline + metrics
│   │   ├── optimizer.py          # SciPy Hungarian global assignment solver + multi-stop 2-opt sequencer
│   │   ├── routing.py            # OpenRouteService client with bounded LRU route cache
│   │   ├── services.py           # Atomic select_for_update() assignment & multi-stop polyline builder
│   │   ├── tasks.py              # Auto-dispatch sweep & deduplicated operational alerts
│   │   └── management/commands/  # `train_eta_model` reproducible training & evaluation command
│   ├── tracking/                 # Simulated polyline telemetry progression & WebSocket broadcasting
│   ├── analytics/                # Dashboard metrics & `/api/analytics/model-metrics/` endpoint
│   └── notifications/            # Deduplicated operational alert models and APIs
├── javiator-ui/                  # Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4 + Leaflet
│   ├── app/                      # Control-tower dashboard, login, map, tables, optimizer controls
│   ├── services/                 # Env-driven REST client (silent JWT refresh), auth, fleet/order WS clients
│   ├── lib/                      # Role-based UI capability helpers
│   └── types/                    # Shared TypeScript models
├── docs/
│   └── PROJECT_PRODUCTION_READINESS_REPORT.md  # Earlier architecture & readiness audit
├── docker-compose.yml            # Local stack: Daphne, Celery worker/beat, Redis, PostGIS/Postgres
├── CHANGELOG.md                  # Commit-aligned project evolution from May 2026 onward
└── .env.example                  # Safe environment-variable template
```

---

## What Is Implemented vs. Simulated

| Capability | Status & Details |
| --- | --- |
| **JWT Authentication & RBAC** | Implemented: SimpleJWT login (`/api/users/login/`), refresh rotation + blacklist (`/api/token/refresh/`), server-side logout blacklisting (`/api/users/logout/`), `/api/accounts/me/`, public signup locked to `client`, JWT WebSocket middleware (`?token=<jwt>`, `4401` on invalid/missing), and server-enforced `admin`/`manager`/`driver`/`client` DRF permissions. |
| **Predictive ETA & Delay Risk (`scikit-learn`)** | Implemented (synthetic Bengaluru corridor training data): `GradientBoostingRegressor` trained via `python manage.py train_eta_model` achieves **4.51 min MAE** vs. **14.89 min** naive `distance * 3` baseline (**69.7% MAE reduction**, **R² = 0.9644** on 600 held-out trips; <2 ms inference). Exposes `delay_risk` (`low`/`medium`/`high`), `eta_factors`, and `/api/analytics/model-metrics/`. |
| **Global Dispatch & Multi-Stop Optimization (`SciPy`)** | Implemented: `scipy.optimize.linear_sum_assignment` (Hungarian algorithm) over an ML-informed multi-factor cost matrix, benchmarked live against a greedy nearest-vehicle baseline (`POST /api/orders/optimize-dispatch/`), plus precedence-preserving multi-stop 2-opt route sequencing for clustered orders. |
| **Road Routing & Caching** | Implemented: OpenRouteService driving directions with coordinate validation, timeouts, bounded in-process LRU coordinate caching, and optional opt-in `ALLOW_SYNTHETIC_ROUTE_FALLBACK`. |
| **Real-Time Tracking & Free-Tier Mode** | Simulated telemetry: Celery steps moving vehicles along road polylines and broadcasts updates over authenticated `ws/fleet/` and `ws/orders/`. Supports `FREE_TIER_DEMO_MODE=True` + `POST /api/fleet/tick/` for single-service free hosting without paid background workers. |
| **Analytics & AI Copilot** | In progress: live PostgreSQL-aggregated charts and DB-grounded Operations Copilot coming next. |

---

## Key Backend Endpoints

- **Health:** `GET /healthz/`, `GET /readyz/`
- **Auth & JWT:** `POST /api/users/login/`, `POST /api/users/logout/`, `POST /api/token/refresh/`, `POST /api/token/verify/`, `POST /api/accounts/register/`, `GET /api/accounts/me/`
- **Fleet & Tracking:** `GET/POST /api/fleet/vehicles/`, `GET /api/fleet/kpis/`, `POST /api/fleet/tick/` *(admin/manager)*, `WS /ws/fleet/?token=<jwt>`
- **Orders & Optimization:** `GET/POST /api/orders/`, `POST /api/orders/<id>/dispatch/`, `POST /api/orders/optimize-dispatch/` *(admin/manager)*, `WS /ws/orders/?token=<jwt>`
- **ML & Telemetry Metrics:** `GET /api/analytics/model-metrics/`, `GET /api/analytics/dashboard/` *(admin/manager)*
- **Notifications:** `GET /api/notifications/`, `GET /api/notifications/unread-count/`, `POST /api/notifications/mark-read/<id>/`, `POST /api/notifications/mark-all-read/`

---

## Local Development Setup

### 1. Environment Configuration
Copy the template and fill in local values (never commit `.env`):

```bash
cp .env.example .env
```

Required variables include `DJANGO_SECRET_KEY` (required when `DEBUG=False`) and `ORS_API_KEY` (for OpenRouteService directions, unless `ALLOW_SYNTHETIC_ROUTE_FALLBACK=True` is enabled for offline demos).

### 2. Start the Backend Stack (Docker Compose)
```bash
docker compose up --build
```

To train or refresh the `scikit-learn` ETA model and inspect held-out metrics locally:

```bash
python backend/manage.py train_eta_model
```

### 3. Start the Next.js Frontend (`javiator-ui`)
```bash
cd javiator-ui
npm install
npm run dev
```

Open `http://localhost:3000`. Configure `NEXT_PUBLIC_API_URL` and optional `NEXT_PUBLIC_WS_URL` in `javiator-ui/.env.local` when pointing at a remote backend.

---

## Planned Improvements

- Live PostgreSQL-aggregated analytics dashboard and restored Recharts charts
- DB-grounded AI Operations Copilot (free-tier LLM API with deterministic telemetry fallback)
- Automated Django test suite and GitHub Actions CI
- Idempotent demo seed command, one-click demo role login, and free-tier Render deployment

For past milestones from May 2026 onward, see [CHANGELOG.md](CHANGELOG.md).
