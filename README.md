# 🪐 HelioTrip

**HelioTrip** is an **edutainment** experience for **all ages** — a playful way to explore the solar system and learn through immersion, not homework vibes. 🌌✨

Pilot your view in **3D first-person** and drift through space: zoom past planets, follow orbits, and get a feel for scale and motion. Switch to **rocket-style free flight** when you want to steer yourself. Look up and explore **constellations** against the starfield — connect the dots in the sky while you move through the scene. ✨🌠

The interface is available in **Swedish** and **English**, so you can learn and play in whichever language fits you best. 🇸🇪🇬🇧

It works beautifully on **desktop** and **mobile**, so you can explore from the couch or on the go. 📱🖥️ On phones, the main experience is framed for **portrait**; a rotate hint appears if you need to turn the device upright.

On **touch devices**, use **pinch to zoom** to move closer or pull back — natural, camera-style control while you fly. 🤏🔭

**Share links** let you save or send a snapshot of where you are in the app (opened from the URL on load). There is also light **learning content**: quizzes, daily challenges, guided **missions**, and short constellation stories — all optional layers on top of exploration.

---

## 🚀 Features

- **First-person 3D flight** through a solar-system scene, plus **rocket / free-flight** mode
- **Time controls**: play/pause and speed presets so simulated time runs forward at a pace you choose
- **Constellations**: view named star patterns in the sky; optional star-to-star lines
- **Missions, quizzes, and daily challenges** for structured learning alongside free exploration
- **Bilingual UI**: **Swedish** and **English** language support
- **Responsive**: full experience on **mobile** and **desktop** (portrait-first on phone)
- **Pinch to zoom** on mobile for comfortable framing; mouse wheel zoom on desktop
- **Shareable state** via URL query parameters (restored once, then cleaned from the address bar)
- **Edutainment**: learn by exploring; designed to be approachable for kids, parents, and curious adults alike

---

## 📖 In-app About (for this repo)

When you run HelioTrip, the footer has an **info (ℹ️) button** that opens a short **About** dialog — the same ideas as this README, but written for someone sitting in the app.

It covers **edutainment for all ages**, **first-person** flight on **desktop and mobile**, the **menu** for planets and moons, **rocket mode**, **time running forward** with **play/pause and speed presets** (not a scrubber), **pinch** and **wheel** zoom, **Swedish / English**, and **constellations** with optional lines. Copy lives in `src/i18n/locales/en.ts` and `sv.ts` under the `about*` keys if you want to tweak the wording.

---

## 🛸 Tech stack

| Layer          | Technology                                                                                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App & bundling | [Vite](https://vitejs.dev/)                                                                                                                                                                                |
| UI             | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)                                                                                                                             |
| Locales        | **Swedish** & **English** (`src/i18n/`)                                                                                                                                                                    |
| 3D             | [Three.js](https://threejs.org/) via [React Three Fiber](https://r3f.docs.pmnd.rs/), [Drei](https://github.com/pmndrs/drei), [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) |
| Motion         | [@react-spring/three](https://github.com/pmndrs/react-spring)                                                                                                                                              |
| Styling        | [Tailwind CSS v4](https://tailwindcss.com/) ([`@tailwindcss/vite`](https://tailwindcss.com/docs/installation/using-vite))                                                                                  |
| State          | [Zustand](https://github.com/pmndrs/zustand)                                                                                                                                                               |
| API (dev)      | [Hono](https://hono.dev/) (local dev server; see `scripts/dev-server.ts`)                                                                                                                                  |
| Icons          | [Lucide](https://lucide.dev/)                                                                                                                                                                              |
| Deploy (opt.)  | On [Vercel](https://vercel.com/), the app includes [@vercel/analytics](https://vercel.com/docs/analytics) and [@vercel/speed-insights](https://vercel.com/docs/speed-insights) (page views / Web Vitals)    |

---

## 🌍 Getting started

```bash
npm install
npm run textures   # one-time: downloads CC BY 4.0 planet textures
npm run dev
```

`npm run textures` pulls diffuse/normal/roughness maps (plus Earth clouds) from [Solar System Scope](https://www.solarsystemscope.com/textures/) and `threejs.org/examples` into `public/textures/`. That folder is gitignored — run the script again after a fresh clone.

The dev script runs the Vite frontend together with the local API watcher (`concurrently`).

**Optional maintainer scripts**

- `npm run elements` — regenerates `src/lib/orbitalElements.ts` from NASA JPL Horizons (network; not needed for a normal clone if the file is already committed).
- `npm run build` — production build (`tsc -b` + `vite build`); matches what you want green before shipping.

---

## ✅ CI and testing

This project uses GitHub Actions CI and runs automatically on:

- push to `main`
- pull requests

The CI workflow is in `.github/workflows/ci.yml`. It uses **Node 22**, runs:

- `npm run lint`
- `npm run test:unit`
- `npm run fallow` (complexity report; **allowed to fail** so it acts as signal without blocking merges)
- `npm run test:e2e`

Run the same checks locally:

```bash
npm run lint
npm run test:unit
npm run test:e2e
```

You can also run the combined test command:

```bash
npm run test:ci
```

---

## 📊 Analytics and privacy

### Custom in-app events (HelioTrip API)

HelioTrip tracks a small set of **anonymous** custom events through its own API (`POST /api/analytics/event`). Examples include:

- `planet_selected` (`body_id`)
- `language_changed` (`locale`)
- `free_flight_activated`, `mode_changed`
- `constellation_opened` (`constellation_id`)
- `play_clicked` / `pause_clicked`
- `solar_system_start_clicked`
- `mission_started`, `mission_step_completed`, `mission_completed`, `mission_abandoned`
- `checklist_progress`, `achievement_unlocked`
- `share_link_created` / `share_link_restored` (`context_type`)

No user id, login id, cookie id, or custom fingerprint is sent. IP addresses may be logged by the hosting infrastructure but are not stored in the analytics database.

Events are aggregated by day/event/value. In production, add server-side throttling or ingress rate limiting for this endpoint (for example at your CDN, reverse proxy, or platform edge) to reduce abuse and write amplification.

Set `VITE_DISABLE_ANALYTICS=true` at build time to stop the browser from posting these events (useful for local or private builds).

You can view the stats in-app at:

- `/admin/analytics`

The analytics dashboard shows:

- event totals grouped by event type
- top values per event (for example selected planet / constellation / locale)
- daily totals (last days)
- active storage source (`Supabase` or `Local file fallback`)

#### Protecting the summary endpoint

When `ANALYTICS_ADMIN_TOKEN` is set, `GET /api/analytics/summary` requires that exact token in the **`x-analytics-token`** HTTP header. The in-app admin page stores the token locally and sends this header. Do not pass the token in query strings (logs, history, referrers).

### Vercel Analytics & Speed Insights

When the app is deployed on Vercel, [@vercel/analytics](https://vercel.com/docs/analytics) and [@vercel/speed-insights](https://vercel.com/docs/speed-insights) are enabled in `App.tsx`. That is separate from the custom event pipeline above; see Vercel’s documentation for what they collect.

### Persist custom analytics on Supabase (free)

By default, custom analytics are stored in a local file (or `/tmp` on serverless platforms like Vercel, where data is lost between function invocations).
To persist data, connect Supabase:

1. Create a Supabase project (free tier).
2. Run `supabase/analytics_events_daily.sql` in Supabase SQL editor.
3. Add environment variables in Vercel (Production + Preview):
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`; both are read by the server)
   - optional `ANALYTICS_SUPABASE_TABLE` (default `analytics_events_daily`)
   - optional `ANALYTICS_SUPABASE_INCREMENT_RPC` (default `increment_analytics_event`)
   - `ANALYTICS_ADMIN_TOKEN` (strongly recommended for production; protects `/api/analytics/summary`)
4. Redeploy.

After that, `/api/analytics/event` writes to Supabase and `/admin/analytics` reads from Supabase.

Security note: `POST /api/analytics/event` is a write endpoint that stores aggregated analytics in Supabase (when configured). Keep `GET /api/analytics/summary` protected in production with `ANALYTICS_ADMIN_TOKEN` and validate the token only from the `x-analytics-token` header in your server handler.

---

_Clear skies and smooth orbits._ 🛰️🌠
