# Javiator — Logistics Control Tower (Portfolio Prototype)

Javiator is a full-stack logistics dispatch and fleet telemetry control-tower prototype built with **Django REST Framework**, **Django Channels**, **Celery**, **PostgreSQL**, **Redis**, and **Next.js (TypeScript)**.

> **Scope note:** This repository is a portfolio demonstration and simulation prototype, not a production logistics system. Dispatch assignment uses a deterministic multi-factor heuristic paired with OpenRouteService road geometries, and vehicle movement is simulated along route polylines rather than ingested from live GPS hardware.

---

## Core Architecture

```text
Javiator/
├── backend/                  # Django 5.2 + DRF + Channels (Daphne) + Celery
│   ├── config/               # 12-factor settings, URLs, ASGI/WSGI, Celery, health probes
│   ├── accounts/             # Custom User model, registration, /me, RBAC permissions
│   ├── users/                # JWT login endpoint (/api/users/login/)
│   ├── fleet/                # Vehicle models, serializers, KPIs, fleet WebSocket consumer
│   ├── orders/               # Order models, CRUD API, order WebSocket consumer
│   ├── dispatch/             # Heuristic vehicle scoring, atomic assignment, OpenRouteService client
│   ├── tracking/             # Simulated GPS movement task along route polylines
│   ├── analytics/            # Dashboard metrics API (admin/manager only)
│   └── notifications/        # Operational alert models and APIs
├── javiator-ui/              # Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4 + Leaflet
│   ├── app/                  # Dashboard, login page, map/tables/modals, theme styles
│   ├── services/             # Env-driven REST client (silent JWT refresh), auth, WebSocket client
│   ├── lib/                  # Role-based UI capability helpers
│   └── types/                # Shared TypeScript models
├── docs/
│   ├── PROGRESS_LOG.md       # Incremental development & verification log
│   └── PROJECT_PRODUCTION_READINESS_REPORT.md  # Historical architecture audit
├── docker-compose.yml        # Local stack: Daphne, Celery worker/beat, Redis, PostGIS/Postgres
└── .env.example              # Safe environment-variable template
```

---

## What Is Implemented vs. Simulated

| Capability | Current Status |
| --- | --- |
| **Authentication & RBAC** | Implemented: JWT login, refresh rotation with token blacklist app, `/api/accounts/me/`, public signup locked to `client`, and server-enforced `admin`/`manager`/`driver`/`client` DRF permissions. |
| **Order Dispatch & Routing** | Implemented (heuristic): Atomic `select_for_update()` vehicle selection using a weighted distance/fuel/capacity/speed heuristic + OpenRouteService road polylines. Not an ML model or multi-stop VRP solver. |
| **Live Vehicle Tracking** | Simulated: Celery steps active vehicles along decoded route polylines, updating progress, fuel, and ETA. |
| **Health & Configuration** | Implemented: Env-driven `DATABASE_URL`, `REDIS_URL`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, and `/healthz/` + `/readyz/` endpoints. |
| **Analytics & WebSockets** | In progress (see [docs/PROGRESS_LOG.md](docs/PROGRESS_LOG.md) for upcoming Day 2–3 milestones). |

---

## Local Development Setup

### 1. Environment Configuration
Copy the template and fill in local values (never commit `.env`):

```bash
cp .env.example .env
```

Required variables include `DJANGO_SECRET_KEY` (required when `DEBUG=False`) and `ORS_API_KEY` (for OpenRouteService route geometry requests).

### 2. Start the Backend Stack (Docker Compose)
```bash
docker compose up --build
```

This starts:
- **Django / Daphne (HTTP + WebSockets):** `http://127.0.0.1:8000`
- **Health probes:** `GET /healthz/` and `GET /readyz/`
- **Celery worker & beat**
- **PostgreSQL** and **Redis**

### 3. Start the Next.js Frontend (`javiator-ui`)
```bash
cd javiator-ui
npm install
npm run dev
```

Open `http://localhost:3000`. By default the frontend connects to `http://127.0.0.1:8000`; override via `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` in `javiator-ui/.env.local`.

---

## Progress & Roadmap

Active development milestones, verification records, and free-tier deployment notes are tracked in [docs/PROGRESS_LOG.md](docs/PROGRESS_LOG.md).
