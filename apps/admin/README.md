# Admin panel

The web app for the people who run Library SaaS: accounts, payments, the daily job and the audit log. It talks to the backend's `/admin/v1` API (see the backend README, "Admin API"). Library owners never use this; they have the mobile app.

Built with React, Vite and TypeScript, Tailwind for styles, TanStack Query for server data, React Router, and react-hook-form + zod for forms.

## Run locally

```bash
cd apps/admin
cp .env.example .env        # VITE_API_URL = your local backend, e.g. http://localhost:4000
npm install
npm run dev                 # http://localhost:5174
```

The backend needs `ADMIN_JWT_SECRET`, `ADMIN_TOTP_KEY` and `CORS_ORIGINS=http://localhost:5174`, and an admin made with `npm run admin:create` (backend repo). Log in with that email, the printed password and the 6-digit code from your authenticator app.

## Scripts

| | |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm test` | Unit tests (Vitest) |

## Deploy (Render Static Site)

| Setting | Value |
|---|---|
| Root directory | `apps/admin` |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |
| Environment | `VITE_API_URL=https://<your api domain>` |
| Redirects/Rewrites | Rewrite `/*` to `/index.html` (so page links work on reload) |

Then add the panel's URL to the backend's `CORS_ORIGINS`. Use its own subdomain (e.g. `admin.<domain>`) and don't link to it from anywhere public; the page also tells search engines not to index it.

## How it's put together

```
src/
  api/          client.ts (fetch + token + errors), admin.ts (one hook per endpoint), types.ts
  components/   AppShell (sidebar + login gate), ui.tsx (buttons, fields, tables, states)
  features/     one folder per page: overview, organizations, billing, ops, audit, auth
  lib/          formatting for India (₹ with Indian grouping, dates in IST)
```

- The login lasts the backend's admin session (8 hours by default) and is kept in `sessionStorage`, so closing the tab logs you out. Any 401 sends you back to the login screen.
- Every account action (extend trial, suspend, restore, log out everywhere) opens a dialog that says what will happen and asks for a reason, which the backend stores in the audit log.
- The overview opens with the day in plain sentences (`features/overview/brief.ts`), problems first.

## Why it lives here, and what's next

This repo's root is still the bare React Native app. Moving it into `apps/mobile` with npm workspaces could break its Android and iOS builds, and it's being replaced by a new Expo app anyway. So for now `apps/admin` installs on its own, and the root's TypeScript, Jest, ESLint and Metro configs skip `apps/`. When the Expo app arrives, the repo becomes a proper workspace (`apps/mobile`, `apps/admin`, later `apps/web`) and the API client in `src/api` moves to a shared `packages/api`.
