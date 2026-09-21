# AdZora

AdZora is a React/Vite frontend foundation for an advertising marketplace connecting advertisers and publishers.

## Current architecture

The frontend uses the API in `src/api.js`. The Node API is split into focused
modules under `server/`: configuration, PostgreSQL access, authentication, and
HTTP routes. `DATABASE_URL` is read only on the server and is never bundled into
the browser. Run `server/schema.sql` once against the Neon database before
starting the API.

Create a local `.env` from `.env.example`, set `DATABASE_URL` and a long random
`JWT_SECRET`, then run:

```bash
cp .env.example .env
npm install
npm run build
npm run server
```

The API exposes `GET /api/health` for deployment checks. It returns `200` only
when `DATABASE_URL` and either `JWT_SECRET` or `SESSION_SECRET` are configured; otherwise it returns a
clear `503` instead of allowing a partially configured API to fail unpredictably.

For local development, use `npm run dev`. This starts Vite and the API
together, with Vite proxying `/api` requests to the API on port `4000`.

JWT access tokens last 30 days by default and can be changed with
`JWT_EXPIRES_IN`. No database credentials or token values belong in the source
archive.

## Deploy on Vercel

The repository includes `vercel.json` and `api/index.js` so Vercel can serve
the Vite SPA and run the API as a Node serverless function. Set these
environment variables in the Vercel project:

- `DATABASE_URL` — the Neon connection string.
- `JWT_SECRET` — a long random secret; `SESSION_SECRET` is also accepted when `JWT_SECRET` is not set.
- `JWT_EXPIRES_IN` — optional; defaults to `30d`.

Run `server/schema.sql` against Neon once before using authentication or
database-backed features. Do not set `VITE_API_URL` for the same Vercel
deployment; the frontend uses the same-origin `/api` route by default.

## Frontend foundation

The first vertical slice establishes the product information architecture:

- Separate Publisher and Advertiser workspaces.
- Role-specific navigation and financial terminology.
- Centralized ad-format and pricing configuration.
- Responsive sidebar with a real mobile drawer, overlay, close button, and Escape behavior.
- Publisher and Advertiser overview dashboards with real empty states until data exists.
- Explicit Coming Soon states for routes not implemented yet.

## Run locally

npm install
npm run dev

Authentication, websites, campaigns, profile updates, wallet requests, and
database-backed empty states are now connected to the API. Creative previews remain
browser-local until a storage provider is configured; their temporary object URLs
are not sent to Neon as production URLs.

The browser ignores the legacy `adzora_token` key and clears it on startup. A
new session key is issued only after the user completes signup or login, so a
previous test account cannot be opened automatically.
