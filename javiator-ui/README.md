# Javiator UI (`javiator-ui`)

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Leaflet frontend for the Javiator Logistics Control Tower.

See the root [README.md](../README.md) for full-stack architecture and backend setup.

## Local Scripts

```bash
npm install
npm run dev      # Start Next.js dev server on http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
npx tsc --noEmit # TypeScript type check
```

## Environment Variables

Configure in `javiator-ui/.env.local` (or your hosting provider's build environment):

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8000
NEXT_PUBLIC_CARTO_API_KEY=
```

`NEXT_PUBLIC_WS_URL` is optional; when omitted, WebSocket URLs are derived automatically (`ws://` or `wss://`) from `NEXT_PUBLIC_API_URL`.
