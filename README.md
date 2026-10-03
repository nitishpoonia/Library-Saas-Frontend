# Library SaaS — App

> **Admin panel:** the web app for running the service lives in [`apps/admin`](apps/admin/README.md). It installs and builds on its own; the Expo app's TypeScript, Jest and Metro ignore `apps/`.

Mobile app for library owners and their staff. Expo SDK 57, Expo Router, React Query, TypeScript. Talks to the backend's `/v1` API ([Libaray-Saas-Backend](https://github.com/nitishpoonia/Libaray-Saas-Backend)).

## Run it

The app uses native modules (secure storage, push, printing), so it runs in a **development build**, not Expo Go.

1. `npm install`
2. `cp .env.example .env` and set `EXPO_PUBLIC_API_URL` to your backend (the emulator reaches your computer at `10.0.2.2`).
3. Build and install the development app once:
   - on your computer with Android Studio: `npm run android`
   - or in the cloud: `npx eas-cli@latest build --profile development --platform android`
4. After that, `npm start` and open the project from the development app. Code changes reload instantly; rebuild only when native packages or `app.config.ts` change.

## Scripts

| Script | What it does |
|---|---|
| `npm start` | Dev server for the development build |
| `npm run android` | Build and run the development app on a device or emulator |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Jest) |

## Releases

Builds run on EAS (`eas.json`): `development`, `preview` (installable APK) and `production` (Play Store bundle).

- `android.package` stays **`com.librarysaas`**; the Play Store knows the app by it.
- Bump `android.versionCode` in `app.config.ts` for every store release.
- The first production build asks for the signing key: upload the existing upload keystore to EAS (`eas credentials`) so the Play Store accepts the update. Never commit keystores.
- `android/` and `ios/` are generated from `app.config.ts` (Continuous Native Generation) and aren't committed.

## How the code is organised

```
src/
  app/                 routes (Expo Router): every file is a screen
    (auth)/            sign-in, sign-up: only reachable when signed out
    (app)/             everything after sign-in
      setup.tsx        first branch, when the account has none
      (tabs)/          bottom tabs
  api/                 HTTP client, errors, query keys, response types
  session/             tokens, sign-in state, the current branch
  features/<feature>/  api.ts (requests), queries.ts (React Query hooks), forms and pieces
  ui/                  design system: theme tokens and shared components
  lib/                 formatting and small helpers
```

Rules that keep it consistent:

- **Screens never call `fetch`.** They use hooks from `features/*/queries.ts`, which use `api/client.ts`.
- **Every branch query key starts with `["library", id]`** (`api/keys.ts`), so switching branch never shows another branch's data.
- **Every colour, font and spacing comes from `ui/theme.ts`.**
- **Tokens:** the access token lives only in memory, the refresh token in the phone's secure storage. On a 401 the client refreshes once (shared by all requests waiting) and retries; if the refresh token is rejected, the app signs out and clears cached data.
