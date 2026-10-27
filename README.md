# Susi Air Pilot App — Fullstack Technical Test

Mobile-first pilot operations app built with Nuxt 3 and NestJS. The backend reads the supplied JSON files into memory when it starts; no database is used.

## Live deployment

- Frontend: https://susiair-gold.vercel.app/
- Backend: https://test-susiair.onrender.com
- Test account: `johndoe` / `susiairtest`

The backend runs on a free Render instance and sleeps after a period of inactivity. The first request after that can take up to about a minute; please allow it a moment.

## Project structure

One repository with `/nuxt` and `/nest`, matching the folder names in the brief.

The source follows each framework's conventions rather than adding a generic layers framework: Nest features own their controllers/services/DTOs, while Nuxt pages compose feature components and share API/auth state through composables and Pinia.

```text
.
├── nest/
│   ├── data/             # Runtime JSON seed files
│   └── src/
│       ├── auth/
│       ├── data/
│       ├── documents/
│       ├── flight-hours/
│       ├── pilot/
│       └── schedules/
└── nuxt/
    ├── assets/scss/
    ├── components/
    ├── composables/
    ├── middleware/
    ├── pages/
    ├── plugins/
    ├── stores/
    └── types/
```

- `nuxt/` — Nuxt 3, Vue 3, Pinia, and SCSS frontend.
- `nest/` — NestJS REST API and runtime copies of the three seed files in `nest/data/`.

The JSON files in `nest/data/` are unchanged copies of the supplied files.

## Requirements

- Node.js 20.19 or newer and npm.
- No database or other local service is required.

## Run locally

Start the API in one terminal:

```powershell
cd nest
npm install
npm run start:dev
```

The API listens on `http://localhost:3001` by default. It loads JSON from `nest/data/`; set `DATA_DIR` only if the seed files are stored elsewhere.

Start the frontend in another terminal:

```powershell
cd nuxt
npm install
npm run dev
```

Open `http://localhost:3000` and sign in with the test credentials:

- Username: `johndoe`
- Password: `susiairtest`

The frontend API URL defaults to `http://localhost:3001`. To use another URL, set `NUXT_PUBLIC_API_BASE` before starting or building Nuxt.

## Environment variables

### NestJS (`nest`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | HTTP port; hosting platforms can supply this. |
| `CORS_ORIGIN` | `http://localhost:3000` | Comma-separated allowed frontend origins (for example `https://susiair-gold.vercel.app`). Use origins only: no path; trailing slash is accepted. |
| `PILOT_AVATAR_URL` | UI Avatars URL for John Doe | Avatar URL returned by `GET /pilot/me`; the source JSON does not contain an avatar. |
| `DATA_DIR` | `<working directory>/data` | Directory containing the three seed JSON files. |

### Nuxt (`nuxt`)

| Variable | Default | Purpose |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001` | Public base URL used for API requests. Set it to the deployed backend URL for a production build/deployment. |

Keep environment files and credentials out of the repository. The technical-test login is deliberately hardcoded as requested by the brief.

## API

All responses use JSON. Errors have the shape:

```json
{
  "statusCode": 400,
  "message": "Validation error",
  "path": "/flight-hours?from=...",
  "timestamp": "2026-10-26T00:00:00.000Z"
}
```

| Method | Path | Authentication | Response |
|---|---|---|---|
| `POST` | `/auth/login` | Public | `{ "accessToken": "...", "tokenType": "Bearer" }` |
| `GET` | `/pilot/me` | Bearer token | Pilot name, total flight hours, and avatar URL. |
| `GET` | `/flight-hours?from=YYYY-MM-DD&to=YYYY-MM-DD` | Bearer token | `{ from, to, flightHours: [{ date, hours }] }` |
| `GET` | `/flight-hours/summary?range=1w\|1m\|3m\|6m\|1y` | Bearer token | Range configuration, server-computed limit cards, and 15 chart points. |
| `GET` | `/documents` | Bearer token | Document entries with expiry date, days remaining, and status. |
| `GET` | `/schedules?year=YYYY&month=MM` | Bearer token | `{ year, month, legend, schedules }`. |

Send the login token in `Authorization: Bearer <accessToken>` for all other API requests. Tokens are held in backend memory and are invalidated when the backend process restarts.

## Main implementation choices

- **In-memory JSON seed data:** follows the brief; no database is needed.
- **Fixed business date:** date-sensitive calculations use `2026-05-15`, not the machine's current date, as the brief requires. This is also what makes the app behave the same way on every review.
- **Inclusive date ranges:** `/flight-hours` includes both `from` and `to`; `from > to` returns HTTP 400.
- **Missing flight-hour dates:** represented as zero rather than omitted, as the brief requires. Rolling windows include their target date and the preceding `windowDays - 1` dates, so the Daily card (today only) and the Weekly card (7 days) are consistent. Dates before the seed range also contribute zero.
- **Future chart dates:** use seeded values as-is, including dates after the fixed business date, so every date in the display range returns a value. The chart returns 7 days before through 7 days after the fixed date.
- **Limit cards and chart math:** both are calculated in the API. The UI renders the response and does not calculate rolling sums.
- **Document badges:** status and days remaining are calculated against the fixed business date and the JSON warning threshold. This intentionally differs from the `today` value (`2026-05-31`) inside `mock-documents.json`, because the brief fixes today at 15 May 2026.
- **Schedule codes and colors:** the API returns the JSON legend unchanged, so duty codes follow the JSON (`DTY`, `RLV`, `TRD`, `TRX`, `REC`, `ULV`, and so on). Each calendar duty cell uses that entry's `base_color`. The `TRX` legend color differs from the 4 June schedule's `base_color`; neither seed value is rewritten.
- **Schedule completeness:** the calendar shows `count_schedules - count_logbooks`; completed dates show a check. It relies on the counts rather than the `status` field, because a few seed entries have a `status` that does not match their logbook counts.
- **Schedule response:** `GET /schedules` returns the legend together with the month's entries, so the calendar needs only one request per month change.
- **Avatar:** the JSON has no avatar, so the API returns `PILOT_AVATAR_URL` or a UI Avatars placeholder; the UI displays initials if image loading fails.
- **Icons:** use the maintained `@lucide/vue` package for the line-icon style requested in the brief.
- **Navigation:** Logbook and More are shown as disabled navigation items because their destination screens are not part of the brief. Tapping a schedule date opens the requested "Detail page coming soon" placeholder.
- **Schedule initial month:** opens May 2026, the fixed test date's month; previous/next month navigation requests the selected month from the API.
- **Authentication:** a random bearer token is issued for the single test account and checked by a global guard. Tokens are in-memory, suitable only for this test's scope.
- **Deployment environment:** set `CORS_ORIGIN` to the deployed frontend origin and `NUXT_PUBLIC_API_BASE` to the deployed API origin.

## Build and verify locally

```powershell
cd nest
npm run build
```

Run the backend service tests with:

```powershell
cd nest
npm test
```

```powershell
cd nuxt
npm run build
```

For manual API checks, start the backend and use a terminal HTTP client to log in, then send the returned bearer token to each protected endpoint. The frontend login, Home, chart range toggle, schedule month navigation, and schedule-date placeholder use the same API.

## Deployment

Deploy each folder as its own service from the same repository:

1. **Backend (Railway, Render, or Fly):** set the service root to `nest`, install with `npm install`, build with `npm run build`, and start with `npm run start:prod`. In the hosting service's environment settings, set `CORS_ORIGIN` to the exact deployed frontend origin, such as `https://susiair-gold.vercel.app` (not the API URL, and without a route path). If there are multiple frontend domains, separate them with commas. Save the environment change and redeploy/restart the backend. Include `nest/data/` in the deployed source so the JSON seed files are available at runtime.
2. **Frontend (Vercel or Netlify):** set the project root to `nuxt`, build with `npm run build`, and set `NUXT_PUBLIC_API_BASE` to the backend's public URL. Configure any required Nuxt/Nitro output settings using the host's Nuxt preset.
3. Once both services are deployed, test a fresh login and confirm Home and Schedule requests succeed against the public backend.

This submission uses Render (backend) and Vercel (frontend), with the URLs listed at the top of this README.

## Known limitations

- The backend is on a free Render instance, so it sleeps when idle and the first request after that is slow.
- Tokens are held in memory, so a backend restart or wake-up invalidates them and the user must sign in again.
- The current Nuxt 3 dependency tree reports advisories with `npm audit`; its suggested automatic fix upgrades to Nuxt 4, which is outside the required Nuxt 3 stack, so that breaking upgrade was not applied.

## With more time

- Replace in-memory test-account authentication with the production identity/authentication system if the app's scope grows, for example signed tokens (JWT) that survive a backend restart.
- Extend the backend service tests with HTTP-level coverage for controllers, auth guards, and DTO validation.
- Replace the placeholder avatar with an approved pilot profile image when one is supplied.
- Build the Logbook, More, and schedule detail screens once they are specified.