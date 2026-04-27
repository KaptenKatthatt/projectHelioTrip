# 🪐 HelioTrip

**HelioTrip** is an **edutainment** experience for **all ages** — a playful way to explore the solar system and learn through immersion, not homework vibes. 🌌✨

Pilot your view in **3D first-person** and drift through space: zoom past planets, follow orbits, and get a feel for scale and motion. Look up and explore **constellations** against the starfield — connect the dots in the sky while you move through the scene. ✨🌠

The interface is available in **Swedish** and **English**, so you can learn and play in whichever language fits you best. 🇸🇪🇬🇧

It works beautifully on **desktop** and **mobile**, so you can explore from the couch or on the go. 📱🖥️

On **touch devices**, use **pinch to zoom** to move closer or pull back — natural, camera-style control while you fly. 🤏🔭

---

## 🚀 Features

- **First-person 3D flight** through a solar-system scene
- **Constellations**: view named star patterns in the sky as part of the experience
- **Bilingual UI**: **Swedish** and **English** language support
- **Responsive**: full experience on **mobile** and **desktop**
- **Pinch to zoom** on mobile for comfortable framing
- **Edutainment**: learn by exploring; designed to be approachable for kids, parents, and curious adults alike

---

## 📖 In-app About (for this repo)

When you run HelioTrip, the footer has an **info (ℹ️) button** that opens a short **About** dialog — the same ideas as this README, but written for someone sitting in the app.

In a few sentences it explains that HelioTrip is **edutainment for all ages**, that you **fly in first person** on **desktop and mobile**, that **time runs forward** at **playable speeds** (not a scrubber — play/pause and presets), that **pinch** (and wheel) **zoom** works, and that the UI is **bilingual (Swedish / English)** with optional **constellation** lines. Copy lives in `src/i18n/locales/en.ts` and `sv.ts` under the `about*` keys if you want to tweak the wording.

---

## 🛸 Tech stack

| Layer          | Technology                                                                                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App & bundling | [Vite](https://vitejs.dev/)                                                                                                                                                                                |
| UI             | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)                                                                                                                             |
| Locales        | **Swedish** & **English** (`src/i18n/`)                                                                                                                                                                    |
| 3D             | [Three.js](https://threejs.org/) via [React Three Fiber](https://r3f.docs.pmnd.rs/), [Drei](https://github.com/pmndrs/drei), [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) |
| Motion         | [@react-spring/three](https://github.com/pmndrs/react-spring)                                                                                                                                              |
| Styling        | [Tailwind CSS](https://tailwindcss.com/)                                                                                                                                                                   |
| State          | [Zustand](https://github.com/pmndrs/zustand)                                                                                                                                                               |
| API (dev)      | [Hono](https://hono.dev/)                                                                                                                                                                                  |
| Icons          | [Lucide](https://lucide.dev/)                                                                                                                                                                              |

---

## 🌍 Getting started

```bash
npm install
npm run textures   # one-time: downloads CC BY 4.0 planet textures
npm run dev
```

`npm run textures` pulls diffuse/normal/roughness maps (plus Earth clouds) from [Solar System Scope](https://www.solarsystemscope.com/textures/) and `threejs.org/examples` into `public/textures/`. That folder is gitignored — run the script again after a fresh clone.

The dev script runs the Vite frontend together with the local API watcher (`concurrently`).

---

## ✅ CI and testing

This project uses GitHub Actions CI and runs automatically on:

- push to `main`
- pull requests

The CI workflow is in `.github/workflows/ci.yml` and runs:

- `npm run lint`
- `npm run test:unit`
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

## 📊 Anonymous analytics events

HelioTrip tracks a small set of anonymous custom events through its own API:

- `planet_selected` (`body_id`)
- `language_changed` (`locale`)
- `free_flight_activated`
- `constellation_opened` (`constellation_id`)
- `play_clicked` / `pause_clicked`
- `solar_system_start_clicked`

No user id, login id, cookie id, or custom fingerprint is sent. IP addresses may be logged by the hosting infrastructure but are not stored in the analytics database.

Events are posted to `POST /api/analytics/event` and aggregated by day/event/value. In production, add server-side throttling/ingress rate limiting for this endpoint (for example at your CDN, reverse proxy, or platform edge) to reduce abuse and write amplification.

You can view the stats in-app at:

- `/admin/analytics`

The analytics dashboard shows:

- event totals grouped by event type
- top values per event (for example selected planet / constellation / locale)
- daily totals (last days)
- active storage source (`Supabase` or `Local file fallback`)

### Persist analytics on Supabase (free)

By default, analytics are stored in a local file (or `/tmp` on serverless platforms like Vercel, where data is lost between function invocations).
To persist data, connect Supabase:

1. Create a Supabase project (free tier).
2. Run `supabase/analytics_events_daily.sql` in Supabase SQL editor.
3. Add environment variables in Vercel (Production + Preview):
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - optional `ANALYTICS_SUPABASE_TABLE` (default `analytics_events_daily`)
   - optional `ANALYTICS_SUPABASE_INCREMENT_RPC` (default `increment_analytics_event`)
   - `ANALYTICS_ADMIN_TOKEN` (strongly recommended for production; protects `/api/analytics/summary`)
4. Redeploy.

After that, `/api/analytics/event` writes to Supabase and `/admin/analytics` reads from Supabase.
If `ANALYTICS_ADMIN_TOKEN` is set, the analytics summary endpoint requires that token via one of:

- `Authorization: Bearer YOUR_TOKEN`
- a secure HTTP-only cookie (for example `analytics_admin_token`)

Security note: `POST /api/analytics/event` is a write endpoint that stores aggregated analytics in Supabase (when configured), so you should keep the dashboard read endpoint protected in production. `GET /api/analytics/summary` is protected by `ANALYTICS_ADMIN_TOKEN` when configured. Validate the token in your server-side admin route handler from auth headers/cookies (not from `req.query`) to avoid token leakage via URLs, logs, or browser history.

---

_Clear skies and smooth orbits._ 🛰️🌠
