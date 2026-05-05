# Moon Surface Feature — Design Spec
**Date:** 2026-05-04  
**Branch:** `because-its-hard`  
**Status:** Approved

---

## Overview

Add a "Land on Moon" experience mirroring the existing Mars rover feature. When the user focuses on the Moon and clicks a landing button, they enter an immersive 3D scene showing the Apollo 11 Lunar Module on the lunar surface. A fact slideshow in the lower-left corner auto-advances through Apollo 11 mission facts.

---

## Architecture: Approach A — Mirror Mars Pattern

No shared abstractions. `MoonSurface.tsx` is an independent organism alongside `MarsSurface.tsx`. Each surface owns its own state, transitions, and 3D scene. This matches the existing codebase pattern and avoids premature generalization.

---

## 1. State (useStore.ts)

Four new fields, exactly mirroring the Mars pattern:

```ts
// State fields
isLandedOnMoon: boolean                                   // default: false
moonTransitionState: 'idle' | 'landing' | 'taking_off'   // default: 'idle'

// Actions
setIsLandedOnMoon(landed: boolean): void
setMoonTransitionState(state: 'idle' | 'landing' | 'taking_off'): void
```

`isLandedOnMoon` is NOT persisted to localStorage. The two landing booleans (`isLanded` for Mars, `isLandedOnMoon` for Moon) are independent and cannot both be true simultaneously in practice (the user can only be focused on one body at a time).

---

## 2. New File: src/components/organisms/MoonSurface.tsx

### Sub-components

| Component | Responsibility |
|---|---|
| `LunarModule` | Loads `/Apollo%20Lunar%20Module.glb`, `ContactShadows` underneath |
| `MoonTerrain` | Procedural gray-blue terrain + rocks, moon texture |
| `EarthSphere` | Earth mesh in the sky using existing earth textures |
| `StarField` | 200 `Points` particles in a hemisphere above terrain |
| `CameraZoomController` | Fly-in (from high/far to `[8,3,8]`) and take-off animations |
| `FactSlideshow` | 5-card auto-advancing panel, dots navigation, progress bar |
| `MoonLandingScene` | `<Canvas>` wrapper with lights and all sub-components |
| `MoonSurface` | Root export — renders when `isLandedOnMoon === true` |

### Visual Style: Poetisk & Romantisk

- **Background color:** `#000310` (deep dark blue)
- **No fog** — the Moon has no atmosphere, visibility is infinite
- **Sky:** Pure dark background; no `<Sky>` component from drei
- **Accent colors:** Ice-blue (`#6080c0` / `rgba(160,180,255,…)`) and silver/white
- **Header text:** "Moon Explorer" in silver-white; subline "Fokuserad på: Apollo 11 — Tranquility Base" in muted blue-white

### Terrain

- `PlaneGeometry(300, 300, 64, 64)` rotated flat, same as Mars
- Noise function produces shallower hills than Mars (Moon is flatter near Tranquility Base)
- Flatten zone around center (radius 6) kept clear for the LEM
- Texture: `/textures/moon/diffuse.webp`, `repeat.set(30, 30)`, color tint `#888ea0`
- ~150 rocks (icosahedron level 1), smaller and flatter than Mars rocks; rock texture clone with `repeat.set(1,1)`, color `#606470`

### Lighting

| Light | Settings |
|---|---|
| `ambientLight` | intensity `0.15`, color `#0a0f2a` (very dark — Moon has no scattered light) |
| `directionalLight` | position `[80, 60, 20]`, intensity `3.0`, color `#fff8f0`, `castShadow`, harsh single-direction |

### EarthSphere

- `SphereGeometry(8, 32, 32)` positioned high in the sky, upper-right of the initial camera view (approximate: `[-60, 80, -120]` — to be tuned during implementation)
- Textures loaded via `useTexture`: `/textures/earth/diffuse.webp`, `/textures/earth/normal.webp`, `/textures/earth/roughness.webp`
- Slow auto-rotation (axial, ~0.001 rad/frame) to show it's alive
- Point light near Earth: color `#3060cc`, intensity `0.4`, for subtle blue ambient fill on terrain

### StarField

- 200 random points distributed in upper hemisphere (`y > 0`)
- `THREE.Points` with `THREE.PointsMaterial`, size `0.3`, color `#c8d8ff`
- Radius ~400 units — stays outside terrain view

### Camera

- Fly-in: starts at `[15, 60, 40]`, animates to `[8, 3, 8]` over 6.5 s (easeOutQuart), 500 ms delay before start — identical to Mars
- Take-off: multiplies current position by 6 (min y = 40) over 3.5 s (easeInCubic)
- `OrbitControls`: `minDistance: 4`, `maxDistance: 20`, `maxPolarAngle: Math.PI / 2 - 0.1`
- OrbitControls disabled during fly-in and take-off (same guard as Mars)

---

## 3. Fact Slideshow Panel

**Position:** Fixed, bottom-left, inside HUD overlay (`pointer-events-auto`)  
**Size:** Same `max-w-sm` as Mars fact panel — `rounded-2xl border bg-black/60 backdrop-blur-md p-4`

### Color scheme (moon)

| Element | Mars | Moon |
|---|---|---|
| Border | `border-orange-500/20` | `border-blue-400/15` (rgba 160,180,255,0.15) |
| Eyebrow icon/text | `text-orange-400` | `text-blue-400` (#6080c0) |
| Body text | `text-white/80` | `text-blue-100/70` |
| Active dot | orange pill | blue-white pill |
| Progress bar | — | thin blue line |

### Behavior

- Auto-advances every **4 seconds**
- Clicking a dot jumps to that card and resets the 4 s timer
- Active dot: `width: 16px`, `border-radius: 3px` (pill), `background: rgba(160,180,255,0.85)`
- Inactive dots: `width: 5px`, `border-radius: 50%`, `background: rgba(160,180,255,0.25)`
- Progress bar: `height: 2px`, animates from 0% → 100% over 4 s, resets on card change
- Eyebrow label: **"Apollo 11 · 1969"**

### 5 Fact Cards (sv + en)

1. **sv:** Neil Armstrongs första steg — Klev ut ur landaren 21 juli 1969 kl. 02:56 UTC och satte mänsklighetens första fot på månen.  
   **en:** Neil Armstrong's first step — He stepped out of the lander on 21 July 1969 at 02:56 UTC, placing humanity's first footprint on the Moon.

2. **sv:** "Ett litet steg…" — "That's one small step for man, one giant leap for mankind" — citatet som sändes live till 600 miljoner TV-tittare.  
   **en:** "One small step…" — "That's one small step for man, one giant leap for mankind" — broadcast live to an estimated 600 million television viewers.

3. **sv:** Tranquility Base — Apollo 11 landade i Mare Tranquillitatis (Lugnthavshavet) — ett relativt flackt och stenfattigt område valt för säkerhetens skull.  
   **en:** Tranquility Base — Apollo 11 landed in Mare Tranquillitatis (Sea of Tranquility) — a relatively flat, rock-free area chosen for safety.

4. **sv:** 21 timmar på ytan — Astronauterna tillbringade 21 timmar och 36 minuter på månens yta, varav 2,5 timmar utanför landaren i rymddräkt (EVA).  
   **en:** 21 hours on the surface — The crew spent 21 hours and 36 minutes on the lunar surface, including 2.5 hours outside the lander in spacesuits (EVA).

5. **sv:** 21,5 kg månsten — Armstrong och Aldrin samlade in 21,5 kg lunar bergarter och jord — prover som forskare fortfarande analyserar idag.  
   **en:** 21.5 kg of Moon rock — Armstrong and Aldrin collected 21.5 kg of lunar rocks and soil — samples that scientists are still analysing today.

---

## 4. Changes to Existing Files

### src/App.tsx

The black fade overlay and scene zoom-out both live here. Two additions:

**Fade overlay** — add a second overlay for moon transitions (same pattern as Mars):
```tsx
const moonTransitionState = useStore((s) => s.moonTransitionState);
const isLandedOnMoon = useStore((s) => s.isLandedOnMoon);

{/* Cinematic Moon Transition Overlay */}
<div
  className={`pointer-events-none fixed inset-0 z-[300] bg-black ease-in-out ${
    moonTransitionState !== 'idle' ? 'opacity-100' : 'opacity-0'
  }`}
  style={{
    transitionProperty: 'opacity',
    transitionDuration: '500ms',
    // 1.5 s total = 1000 ms delay + 500 ms fade
    transitionDelay: moonTransitionState === 'landing' ? '1000ms' : moonTransitionState === 'taking_off' ? '3000ms' : '0ms'
  }}
/>
```

**Scene zoom** — extend existing condition to include moon state:
```tsx
transform: (marsTransitionState !== 'idle' || isLanded || moonTransitionState !== 'idle' || isLandedOnMoon)
  ? 'scale(5)' : 'scale(1)'
```

### src/components/organisms/PlanetPanel.tsx

Add a "LANDA PÅ MÅNEN" button, shown when `activeBody === 'moon'`:

```tsx
{activeBody === 'moon' && (
  <button onClick={() => {
    store.setMoonTransitionState('landing');
    setTimeout(() => {
      store.setIsLandedOnMoon(true);
      setTimeout(() => store.setMoonTransitionState('idle'), 100);
    }, 1500);  // 1.5 s total fade (1000 ms delay + 500 ms)
  }}>
    LANDA PÅ MÅNEN
  </button>
)}
```

Button style: same pattern as Mars but blue — `border-blue-400/30 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20`.

### src/components/templates/HUD.tsx

Add `import { MoonSurface } from "../organisms/MoonSurface"` and render `<MoonSurface />` directly below `<MarsSurface />`.

---

## 5. Mars Rock Fix (already implemented)

During brainstorming a texture issue on Mars rocks was identified and fixed:
- Rocks previously shared the ground texture clone with `repeat(40,40)` — caused an unnatural tiling pattern
- Fix: separate texture clone for rocks with `repeat(1,1)` and icosahedron subdivision level 1 for more natural shape

---

## 6. Out of Scope

- Mobile-specific layout adjustments for MoonSurface (follow same pattern as MarsSurface)
- Sound effects
- Mission/achievement integration
- Internationalization of the "LANDA PÅ MÅNEN" button label (hardcoded Swedish for now, same as Mars button)

---

## 7. File Summary

| File | Change |
|---|---|
| `src/store/useStore.ts` | +4 fields/actions for moon landing state |
| `src/components/organisms/MoonSurface.tsx` | New file (~320 lines) |
| `src/App.tsx` | +moon fade overlay + extend zoom condition |
| `src/components/organisms/PlanetPanel.tsx` | +1 button block for moon |
| `src/components/templates/HUD.tsx` | +1 import + `<MoonSurface />` |
| `src/components/organisms/MarsSurface.tsx` | Rock texture fix (already done) |
