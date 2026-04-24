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

## 🛸 Tech stack

| Layer | Technology |
| ----- | ---------- |
| App & bundling | [Vite](https://vitejs.dev/) |
| UI | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Locales | **Swedish** & **English** (`src/i18n/`) |
| 3D | [Three.js](https://threejs.org/) via [React Three Fiber](https://r3f.docs.pmnd.rs/), [Drei](https://github.com/pmndrs/drei), [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) |
| Motion | [@react-spring/three](https://github.com/pmndrs/react-spring) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| API (dev) | [Hono](https://hono.dev/) |
| Icons | [Lucide](https://lucide.dev/) |

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

*Clear skies and smooth orbits.* 🛰️🌠
