# DeepSecure360 Admin

React + TypeScript admin console for the DeepSecure360 backend (Backend Architecture Blueprint v1.0).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

It starts in **demo mode** (built-in mock data, sign in with any email and a 6+ character password).

To use the real backend, edit `.env`:

```
VITE_USE_MOCK=false
VITE_API_BASE_URL=/api/v1
```

`vite.config.ts` proxies `/api` to `http://localhost:3000` (the NestJS API). The client expects the
response envelope from Blueprint section 5.2/5.3 (`success`, `data`, `meta`, `error`) and
HTTP-only cookie auth.

## Structure

```
src/
  app/            App routes, ProtectedRoute
  components/
    ui/           Button, Icon, Badge, Alert, Card, StatCard, Modal, Pagination, EmptyState, Spinner
    globe/        ThreatGlobe (dark, draggable 3D threat-intel globe)
    geo/          GeoAccuracyMap (radius-based IP geolocation), AttackMap (point-to-point traffic map)
    satellite/    Satellite3D (CSS 3D rotating satellite), SatelliteTerminal (command console)
    form/         Input, Select, Textarea, Checkbox, Field, DynamicForm (+ FieldSchema types)
    data/         DataTable, SearchBar, FilterBar, ResourcePage
    charts/       BarLineChart, RadarChart, HeartbeatChart, ChartCard, Legend, TimeUnitTabs
    layout/       AppLayout, Sidebar, SocialLinks, Topbar, PageHeader
  config/         navigation.ts (sidebar items), social.ts (social links, replace the URLs)
  context/        AuthContext, ToastContext
  features/       auth, dashboard, cases, evidence, forensics, jobs, integrations, geolocation, soc, users, audit
  hooks/          useDebounce, useList
  mocks/          mock data used in demo mode
  services/       apiClient, resourceService (REST + mock), per-resource services
  styles/         base.css (design tokens), components.css, layout.css
  types/          api.ts (envelope), models.ts (blueprint tables)
  utils/          format, options, validators, cn
```

## Add a new admin page in ~30 lines

1. Add the type to `types/models.ts` and a service in `services/index.ts`
   (`createService<T>('/path', mockSeed, ['searchKeyA', 'searchKeyB'])`).
2. Create `features/<name>/<Name>Page.tsx` with `columns`, optional `filters` and a `FieldSchema[]`,
   and render `<ResourcePage ... />`. Copy `features/cases/CasesPage.tsx` as a template.
3. Register the route in `app/App.tsx` and the link in `config/navigation.ts`.

## Reusable pieces

- **DataTable**: sortable columns, row selection, row actions, skeleton loading, empty and error states, pagination.
- **DynamicForm**: describe fields as data (`FieldSchema`): required, min/max length, pattern, number range,
  custom `validate`, `visibleWhen` for conditional fields, half or full width. Validates on blur and submit and
  shows server errors in an error card.
- **Alert / useToast()**: error, success, warning and info note cards; `toast.success('Saved')`.
- **ResourcePage**: header, search, filters, table, create/edit modal, delete confirmation, toasts.

## Notes

- Evidence is edit-only here and cannot be deleted, to protect chain of custody. Uploads use the
  resumable upload API from the blueprint (not built in this UI yet).
- Role-based hiding of menu items and actions is not wired up yet; `AuthContext` exposes `user.role` for that.

## Dashboard graphs

The Overview has one time-scale selector (Year, Month, Day, Hour, Minute, Second) that drives every graph.
Second, minute and hour refresh automatically.

- **Bars + line:** active cases and evidence items as bars, critical cases as a line.
- **Spider net:** the same numbers spread across case categories; evidence counts under the category of its case.
- **Heartbeat:** live scrolling traces for processing, queued and failed jobs.
- **Evidence by case:** cases holding the most evidence items.

Demo mode builds the history from the mock data (`mocks/analytics.ts`); the newest point always equals the real
current number. With `VITE_USE_MOCK=false` the page calls `GET /dashboard/analytics?unit=day` and expects
`AnalyticsSnapshot` from `types/models.ts` inside the standard response envelope.

## Forensics & Integrations

Added to match the backend blueprint's `forensics/` module and the `SiemController` /
`WebhookController` code:

- **Forensics** (`/forensics`): YARA / Sigma / custom scan jobs run against evidence, with
  verdicts and matched rules. Read-only in the UI (scans are started by the backend's sandboxed workers).
- **Integrations** (`/integrations`): four tabs —
  - *SIEM query*: calls `POST /integrations/siem/query` (vendor + search string).
  - *EDR alerts*: calls `GET /integrations/edr/alerts`.
  - *Threat intel globe*: calls `GET /integrations/threat-feeds/indicators`, plotted on a dark,
    draggable 3D globe (`components/globe/ThreatGlobe.tsx`, canvas-based, no external map
    service). Points are **aggregate, country-level sensor geolocation** per indicator — this
    does not and cannot show a live location, a photo, or the social-media activity of a specific
    person. That kind of per-person live tracking isn't something an IP address supports, and
    isn't included.
  - *Webhook events*: a log of `POST /webhooks` deliveries with signature-valid status.

## Dark mode

The whole app now uses a single dark theme (tokens in `styles/base.css`). There is no light
mode toggle; change the token values there to adjust it. Layout is responsive from phone width
up (sidebar collapses to an off-canvas drawer under 900px, tables scroll horizontally, forms and
panels reflow to one column).

## IP Intelligence

`/ip-intelligence`: look up an IPv4 address and get back city, region, country, network owner
(ASN/org) and timezone — the same shape ipinfo.io returns, e.g.:

```json
{ "ip": "197.211.63.207", "city": "Abuja", "region": "FCT", "country": "NG",
  "loc": "9.0579,7.4951", "org": "AS37148 Globacom Limited", "timezone": "Africa/Lagos" }
```

This is **city/ISP-region accuracy** (the map shows the provider's typical radius, usually
15–60 km), which is the ceiling of what any IP geolocation service — ipinfo.io, MaxMind, or
otherwise — can provide. There is intentionally no path from an IP to a street address, a live
device position, a photo of whoever is using it, or their social media activity: none of that
is derivable from an IP address, so the module doesn't claim to show it.

- In demo mode (`VITE_USE_MOCK=true`), lookups use a small built-in sample set (including the
  Abuja example above) plus a deterministic fallback for any other IP, so the page works with
  no API key.
- For live lookups, set `VITE_USE_MOCK=false` and `VITE_IPINFO_TOKEN=<your ipinfo.io token>` in
  `.env`. The page calls `https://ipinfo.io/<ip>/json?token=...` directly from the browser.
- "Save to history" stores the lookup (with an optional case note) via
  `POST /integrations/geo/lookups` so analysts can attach it to a case later.

## Theme toggle

Dark is still the default (nothing changes until a user switches), but the app now supports
light mode too. `context/ThemeContext.tsx` holds the current theme (persisted in
localStorage) and sets `data-theme` on `<html>`; `styles/base.css` defines a
`[data-theme="light"]` token block alongside the original dark tokens. The toggle button lives
in the top bar and on the new Settings page.

## SOC Operations module

A new sidebar group mirroring a standard SOC console, each page reusing the same ResourcePage /
DataTable / DynamicForm patterns as the rest of the app:

- **Real-Time Monitor** — live stat cards, the attack map, and an auto-refreshing recent-alerts feed.
- **SIEM Search**, **Threat Intelligence** — standalone versions of the panels also reachable from Integrations.
- **Alerts**, **Incidents**, **Endpoint Security**, **Vulnerability Mgmt**, **Reports**, **Playbooks** — new
  CRUD tables backed by `services/soc.ts` and `mocks/soc.ts`.
- **Network Watch** — the attack map plus a connections table.
- **Case Management** — routes to the existing Cases page (`features/cases/CasesPage.tsx`, unchanged) so it
  appears in both the Investigations and SOC Operations groups without duplicating code.
- **Settings** — org/notification preferences (demo form, not persisted) plus the theme toggle.

### Attack map (point-to-point, city/country level)

`components/geo/AttackMap.tsx` draws animated arcs between aggregate source and destination
points. Hovering an endpoint shows "City, Region, Country"; clicking it zooms the canvas in
around that point (click again to zoom back out). Endpoints are always city/region/country
centroids from the same geolocation data as the IP Intelligence and Threat Intelligence pages —
never a street address, and never tied to an individual.

### Satellite Uplink

`/soc/satellite`: a CSS-only 3D satellite (`components/satellite/Satellite3D.tsx`) rotating
slowly on the X and Y axes, speeding up and glowing while "acquiring" or "connected", next to a
dark command terminal (`components/satellite/SatelliteTerminal.tsx`). Commands: `SCAN`,
`CONNECT <name|NORAD id>`, `STATUS`, `DISCONNECT`, `CLEAR`, `HELP`.

This deliberately surfaces real, public orbital data only — which satellite, its altitude, and
its next pass over a region (`services/satelliteService.ts`, `mocks/soc.ts`) — the same kind of
information sites like N2YO or Heavens-Above publish. There is no command that returns a
person's location, photo, or online activity, because no satellite uplink can actually provide
that for a third party; the terminal explicitly refuses command text that asks for it.

## SOC Overview

`/soc/overview` — the first item in the SOC Operations group — mirrors the reference SOC
dashboard layout: five trend stat cards with inline sparklines, a Real-time Attack Map card
(top attacking countries + attack-type donut alongside the live `AttackMap`), an Alert
Distribution donut, a System Status list, Recent Alerts, Recent Cases, and a scrolling Threat
Intelligence Feed ticker. New reusable pieces: `components/charts/DonutChart.tsx` (CSS
conic-gradient donut) and `components/charts/MiniSparkline.tsx`. Data is in `mocks/soc.ts`
(`mockOverviewStats`, `mockTopCountries`, `mockAttackTypes`, `mockAlertDistribution`, etc.) —
wire these to real endpoints the same way the other SOC pages are wired to `services/soc.ts`.

## Scrollbars & responsiveness

Scrollbars are hidden everywhere (`styles/responsive.css`) — sidebar, tables, the terminal,
modals — while scrolling itself still works via touch, trackpad, or keyboard; nothing lost the
ability to scroll. The same file adds breakpoints for small phones (stat grids drop to 2 then 1
column, toolbars and the top bar stack, modals stay within the viewport) and respects iPhone/iPad
safe-area insets for the notch and home indicator, on top of the breakpoints each page already had.
