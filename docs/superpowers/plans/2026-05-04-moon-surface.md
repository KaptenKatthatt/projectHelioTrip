# Moon Surface (Apollo 11) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "LANDA PÅ MÅNEN" immersive 3D scene showing the Apollo 11 Lunar Module at Tranquility Base, triggered from the Moon's planet panel, with an auto-advancing fact slideshow.

**Architecture:** Mirrors the existing Mars landing pattern (Approach A) — independent `MoonSurface.tsx` alongside `MarsSurface.tsx`, own store state (`isLandedOnMoon`, `moonTransitionState`). Fade-to-black overlay and scene zoom live in `App.tsx`. No shared abstraction with Mars.

**Tech Stack:** React 18 + TypeScript, React Three Fiber (`@react-three/fiber`), `@react-three/drei` (useGLTF, OrbitControls, ContactShadows, useTexture, Instances, Instance), Zustand (`useStore`), Tailwind CSS, Vitest + React Testing Library

**Design spec:** `docs/superpowers/specs/2026-05-04-moon-surface-design.md`

---

### Task 1: Store — moon landing state

**Files:**
- Modify: `src/store/useStore.ts`
- Test: `src/store/useStore.test.ts`

- [ ] **Step 1: Add moon state types to useStore.ts**

In `src/store/useStore.ts`, add to `SimulationState` (after `isLanded: boolean`):

```ts
isLandedOnMoon: boolean;
```

Add to `SimulationActions` (after `setMarsTransitionState`):

```ts
setIsLandedOnMoon: (landed: boolean) => void;
moonTransitionState: 'idle' | 'landing' | 'taking_off';
setMoonTransitionState: (state: 'idle' | 'landing' | 'taking_off') => void;
```

- [ ] **Step 2: Add moon state initial values and actions**

In the `create<Store>()` call, add after `marsTransitionState: 'idle'`:

```ts
isLandedOnMoon: false,
moonTransitionState: 'idle',
```

Add after `setMarsTransitionState: (state) => set({ marsTransitionState: state })`:

```ts
setIsLandedOnMoon: (landed) => set({ isLandedOnMoon: landed }),
setMoonTransitionState: (state) => set({ moonTransitionState: state }),
```

- [ ] **Step 3: Write failing tests**

Add to `src/store/useStore.test.ts` (follow the existing `loadStore` pattern):

```ts
describe('moon landing state', () => {
  it('isLandedOnMoon defaults to false', async () => {
    const { useStore } = await loadStore();
    expect(useStore.getState().isLandedOnMoon).toBe(false);
  });

  it('setIsLandedOnMoon sets the value', async () => {
    const { useStore } = await loadStore();
    useStore.getState().setIsLandedOnMoon(true);
    expect(useStore.getState().isLandedOnMoon).toBe(true);
  });

  it('moonTransitionState defaults to idle', async () => {
    const { useStore } = await loadStore();
    expect(useStore.getState().moonTransitionState).toBe('idle');
  });

  it('setMoonTransitionState sets the value', async () => {
    const { useStore } = await loadStore();
    useStore.getState().setMoonTransitionState('landing');
    expect(useStore.getState().moonTransitionState).toBe('landing');
  });
});
```

- [ ] **Step 4: Run tests**

```
npm run test:unit
```

Expected: all moon state tests pass (and existing tests still pass).

- [ ] **Step 5: Commit**

```bash
git add src/store/useStore.ts src/store/useStore.test.ts
git commit -m "feat: add moon landing state to store"
```

---

### Task 2: App.tsx — moon transition overlay + zoom

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Read the existing overlay block**

Locate the comment `{/* Cinematic Mars Transition Overlay */}` in `src/App.tsx` (~line 134). You will add a moon equivalent immediately after it.

- [ ] **Step 2: Add moon state selectors**

After the existing line:
```tsx
const marsTransitionState = useStore((s) => s.marsTransitionState);
```

Add:
```tsx
const moonTransitionState = useStore((s) => s.moonTransitionState);
const isLandedOnMoon = useStore((s) => s.isLandedOnMoon);
```

- [ ] **Step 3: Add moon fade overlay**

Directly after the closing `/>` of the Mars overlay `<div>`, add:

```tsx
{/* Cinematic Moon Transition Overlay */}
<div
  className={`pointer-events-none fixed inset-0 z-[300] bg-black ease-in-out ${
    moonTransitionState !== 'idle' ? 'opacity-100' : 'opacity-0'
  }`}
  style={{
    transitionProperty: 'opacity',
    transitionDuration: '500ms',
    transitionDelay:
      moonTransitionState === 'landing'
        ? '1000ms'
        : moonTransitionState === 'taking_off'
          ? '3000ms'
          : '0ms',
  }}
/>
```

- [ ] **Step 4: Extend zoom condition**

Find the line (approximately):
```tsx
transform: (marsTransitionState !== 'idle' || isLanded) ? 'scale(5)' : 'scale(1)',
```

Replace with:
```tsx
transform:
  (marsTransitionState !== 'idle' || isLanded || moonTransitionState !== 'idle' || isLandedOnMoon)
    ? 'scale(5)'
    : 'scale(1)',
```

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add moon transition overlay and zoom to App"
```

---

### Task 3: PlanetPanel — "LANDA PÅ MÅNEN" button

**Files:**
- Modify: `src/components/organisms/PlanetPanel.tsx`

- [ ] **Step 1: Locate the Mars button block**

Find the block in `src/components/organisms/PlanetPanel.tsx` that starts with:
```tsx
{activeBody === "mars" && (
```
It is at approximately line 340. Add the moon button block directly below its closing `)}`.

- [ ] **Step 2: Add the moon button**

```tsx
{activeBody === "moon" && (
  <button
    type="button"
    onClick={() => {
      const store = useStore.getState();
      store.setMoonTransitionState('landing');
      setTimeout(() => {
        store.setIsLandedOnMoon(true);
        setTimeout(() => {
          store.setMoonTransitionState('idle');
        }, 100);
      }, 1500);
    }}
    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-400/10 px-3 py-3 text-sm font-bold text-blue-300 transition hover:bg-blue-400/20 hover:border-blue-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
    LANDA PÅ MÅNEN
  </button>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/PlanetPanel.tsx
git commit -m "feat: add land-on-moon button to PlanetPanel"
```

---

### Task 4: HUD.tsx — import and render MoonSurface

**Files:**
- Modify: `src/components/templates/HUD.tsx`

- [ ] **Step 1: Add import**

After the existing line:
```tsx
import { MarsSurface } from "../organisms/MarsSurface";
```

Add:
```tsx
import { MoonSurface } from "../organisms/MoonSurface";
```

- [ ] **Step 2: Render MoonSurface**

After `<MarsSurface />` (approximately line 191), add:
```tsx
<MoonSurface />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/templates/HUD.tsx
git commit -m "feat: register MoonSurface in HUD"
```

---

### Task 5: MoonSurface.tsx — terrain generation + camera controller

**Files:**
- Create: `src/components/organisms/MoonSurface.tsx`

This task creates the file with the terrain generation function (pure, testable) and the `CameraZoomController` (adapted from Mars). The Canvas is created but empty while later tasks fill it in.

- [ ] **Step 1: Create the file with imports and terrain generation**

Create `src/components/organisms/MoonSurface.tsx`:

```tsx
import {
  useGLTF,
  OrbitControls,
  ContactShadows,
  useTexture,
  Instances,
  Instance,
} from '@react-three/drei';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { X, Info } from 'lucide-react';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';

type MoonRockInstance = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

const terrainRng = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0xffff_ffff;
  };
};

export const buildMoonTerrainGeometryAndRocks = (): {
  geometry: THREE.PlaneGeometry;
  rocks: MoonRockInstance[];
} => {
  const rnd = terrainRng(0x4d6f6f6e); // "Moon" in ASCII hex
  const geo = new THREE.PlaneGeometry(300, 300, 64, 64);
  geo.rotateX(-Math.PI / 2);

  const positions = geo.attributes.position!.array as Float32Array;

  // Shallower noise than Mars — Tranquility Base is relatively flat
  const noise = (x: number, z: number): number =>
    Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.5 +
    Math.sin(x * 0.08) * Math.cos(z * 0.09) * 0.8 +
    Math.sin(x * 0.15 + z * 0.12) * 0.3;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i] ?? 0;
    const z = positions[i + 2] ?? 0;
    const distFromCenter = Math.sqrt(x * x + z * z);
    const flattenFactor = Math.min(1, Math.max(0, (distFromCenter - 5) / 12));
    positions[i + 1] = noise(x, z) * flattenFactor - 0.05;
  }

  geo.computeVertexNormals();

  const rockData: MoonRockInstance[] = [];
  const count = 150;
  for (let i = 0; i < count; i++) {
    const rx = (rnd() - 0.5) * 200;
    const rz = (rnd() - 0.5) * 200;
    const dist = Math.sqrt(rx * rx + rz * rz);
    if (dist < 6) continue;

    const flattenFactor = Math.min(1, Math.max(0, (dist - 5) / 12));
    const ry = noise(rx, rz) * flattenFactor;
    // Moon rocks are smaller and flatter than Mars rocks
    const baseScale = rnd() * 1.2 + 0.3 + (dist > 50 ? rnd() * 2 : 0);

    rockData.push({
      position: [rx, ry - baseScale * 0.2, rz],
      rotation: [rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI],
      scale: [
        baseScale * (0.5 + rnd() * 1.2),
        baseScale * (0.2 + rnd() * 0.5),
        baseScale * (0.5 + rnd() * 1.2),
      ],
    });
  }

  return { geometry: geo, rocks: rockData };
};
```

- [ ] **Step 2: Add CameraZoomController (adapted from Mars)**

Append to the file:

```tsx
const CameraZoomController = ({
  isFlyingIn,
  setIsFlyingIn,
}: {
  isFlyingIn: boolean;
  setIsFlyingIn: (v: boolean) => void;
}) => {
  const moonTransitionState = useStore((s) => s.moonTransitionState);
  const { camera } = useThree();
  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  const animStateRef = useRef<{ startPos: THREE.Vector3; startTime: number } | null>(null);

  useEffect(() => {
    targetPosRef.current = null;
    animStateRef.current = null;
  }, [moonTransitionState]);

  useFrame(() => {
    if (moonTransitionState === 'taking_off') {
      if (!targetPosRef.current) {
        targetPosRef.current = camera.position.clone().multiplyScalar(6);
        targetPosRef.current.y = Math.max(targetPosRef.current.y, 40);
        animStateRef.current = { startPos: camera.position.clone(), startTime: performance.now() };
      }
      if (!animStateRef.current || !targetPosRef.current) return;
      const elapsed = performance.now() - animStateRef.current.startTime;
      const progress = Math.min(elapsed / 3500, 1.0);
      const easeIn = progress * progress * progress;
      camera.position.lerpVectors(animStateRef.current.startPos, targetPosRef.current, easeIn);
      camera.lookAt(0, 0, 0);
    } else if (isFlyingIn) {
      if (!targetPosRef.current) {
        targetPosRef.current = new THREE.Vector3(8, 3, 8);
        camera.position.set(15, 60, 40);
        animStateRef.current = {
          startPos: new THREE.Vector3(15, 60, 40),
          startTime: performance.now() + 500,
        };
      }
      if (!animStateRef.current || !targetPosRef.current) return;
      const now = performance.now();
      if (now < animStateRef.current.startTime) {
        camera.position.copy(animStateRef.current.startPos);
      } else {
        const elapsed = now - animStateRef.current.startTime;
        const progress = Math.min(elapsed / 6500, 1.0);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        camera.position.lerpVectors(
          animStateRef.current.startPos,
          targetPosRef.current,
          easeOutQuart,
        );
        if (progress >= 1.0) setIsFlyingIn(false);
      }
      camera.lookAt(0, 0, 0);
    } else {
      targetPosRef.current = null;
      animStateRef.current = null;
    }
  });

  return null;
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/MoonSurface.tsx
git commit -m "feat: moon surface — terrain generation + camera controller"
```

---

### Task 6: MoonSurface.tsx — terrain, rocks, stars, and Earth sphere

**Files:**
- Modify: `src/components/organisms/MoonSurface.tsx`

- [ ] **Step 1: Add MoonTerrain component**

Append to `src/components/organisms/MoonSurface.tsx`:

```tsx
const MoonTerrain = () => {
  const rawGroundTexture = useTexture('/textures/moon/diffuse.webp');

  const groundTexture = useMemo(() => {
    const texture = rawGroundTexture.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30, 30);
    texture.needsUpdate = true;
    return texture;
  }, [rawGroundTexture]);

  const rockTexture = useMemo(() => {
    const texture = rawGroundTexture.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.needsUpdate = true;
    return texture;
  }, [rawGroundTexture]);

  const { geometry, rocks } = useMemo(() => buildMoonTerrainGeometryAndRocks(), []);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial map={groundTexture} roughness={1} metalness={0.0} color="#888ea0" />
      </mesh>
      <Instances range={rocks.length} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial map={rockTexture} roughness={1} metalness={0.0} color="#606470" />
        {rocks.map((rock, i) => (
          <Instance key={i} position={rock.position} rotation={rock.rotation} scale={rock.scale} />
        ))}
      </Instances>
    </group>
  );
};
```

- [ ] **Step 2: Add StarField component**

Append to the file:

```tsx
const StarField = () => {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5; // upper hemisphere only
      const r = 380 + Math.random() * 20;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#c8d8ff" size={0.35} sizeAttenuation />
    </points>
  );
};
```

- [ ] **Step 3: Add EarthSphere component**

Append to the file:

```tsx
const EarthSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [diffuse, normal, roughness] = useTexture([
    '/textures/earth/diffuse.webp',
    '/textures/earth/normal.webp',
    '/textures/earth/roughness.webp',
  ]);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.001;
  });

  return (
    <group position={[-60, 80, -120]}>
      <mesh ref={meshRef} castShadow={false}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial
          map={diffuse}
          normalMap={normal}
          roughnessMap={roughness}
          roughness={1}
          metalness={0}
        />
      </mesh>
      {/* Subtle blue fill light from Earth direction */}
      <pointLight color="#3060cc" intensity={0.4} distance={300} />
    </group>
  );
};
```

- [ ] **Step 4: Commit**

```bash
git add src/components/organisms/MoonSurface.tsx
git commit -m "feat: moon surface — terrain, rocks, stars, earth sphere"
```

---

### Task 7: MoonSurface.tsx — LunarModule + MoonLandingScene

**Files:**
- Modify: `src/components/organisms/MoonSurface.tsx`

- [ ] **Step 1: Add LunarModule component**

Append to the file:

```tsx
const LunarModule = () => {
  const { scene } = useGLTF('/Apollo%20Lunar%20Module.glb');
  return (
    <group position={[0, 0, 0]}>
      <primitive object={scene} scale={2.0} />
      <ContactShadows opacity={0.4} scale={14} blur={2} far={4} />
    </group>
  );
};
```

- [ ] **Step 2: Add MoonLandingScene (Canvas wrapper)**

Append to the file:

```tsx
const MoonLandingScene = () => {
  const moonTransitionState = useStore((s) => s.moonTransitionState);
  const [isFlyingIn, setIsFlyingIn] = useState(true);
  const initialCameraPosition: [number, number, number] = isFlyingIn ? [15, 60, 40] : [8, 3, 8];

  return (
    <Canvas shadows camera={{ position: initialCameraPosition, fov: 45 }}>
      <Suspense fallback={null}>
        <CameraZoomController isFlyingIn={isFlyingIn} setIsFlyingIn={setIsFlyingIn} />

        {/* No <Sky> — Moon has no atmosphere */}
        <color attach="background" args={['#000310']} />

        <ambientLight intensity={0.15} color="#0a0f2a" />
        <directionalLight
          position={[80, 60, 20]}
          intensity={3.0}
          color="#fff8f0"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        <StarField />
        <EarthSphere />
        <LunarModule />
        <MoonTerrain />

        {moonTransitionState !== 'taking_off' && !isFlyingIn && (
          <OrbitControls
            makeDefault
            minDistance={4}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2 - 0.1}
          />
        )}
      </Suspense>
    </Canvas>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/MoonSurface.tsx
git commit -m "feat: moon surface — lunar module + complete 3D scene"
```

---

### Task 8: FactSlideshow component + tests

**Files:**
- Modify: `src/components/organisms/MoonSurface.tsx`
- Create: `src/components/organisms/MoonSurface.test.tsx`

- [ ] **Step 1: Add facts data and ProgressBar to MoonSurface.tsx**

Append to `src/components/organisms/MoonSurface.tsx`:

```tsx
type MoonFact = {
  title: { sv: string; en: string };
  body: { sv: string; en: string };
};

export const MOON_FACTS: MoonFact[] = [
  {
    title: {
      sv: 'Neil Armstrongs första steg',
      en: "Neil Armstrong's first step",
    },
    body: {
      sv: 'Den 21 juli 1969 klev Neil Armstrong ut ur landaren kl. 02:56 UTC och satte mänsklighetens första fot på månen.',
      en: 'On 21 July 1969 at 02:56 UTC Neil Armstrong stepped out of the lander and placed humanity\'s first footprint on the Moon.',
    },
  },
  {
    title: { sv: '"Ett litet steg…"', en: '"One small step…"' },
    body: {
      sv: '"That\'s one small step for man, one giant leap for mankind" — citatet sändes live till uppskattningsvis 600 miljoner TV-tittare.',
      en: '"That\'s one small step for man, one giant leap for mankind" — broadcast live to an estimated 600 million television viewers.',
    },
  },
  {
    title: { sv: 'Tranquility Base', en: 'Tranquility Base' },
    body: {
      sv: 'Apollo 11 landade i Mare Tranquillitatis — ett relativt flackt och stenfattigt område valt för säkerhetens skull.',
      en: 'Apollo 11 landed in Mare Tranquillitatis (Sea of Tranquility) — a relatively flat, rock-free area chosen for safety.',
    },
  },
  {
    title: { sv: '21 timmar på ytan', en: '21 hours on the surface' },
    body: {
      sv: 'Astronauterna tillbringade 21 timmar och 36 minuter på månens yta, varav 2,5 timmar utanför landaren i rymddräkt (EVA).',
      en: 'The crew spent 21 hours and 36 minutes on the lunar surface, including 2.5 hours outside the lander in spacesuits (EVA).',
    },
  },
  {
    title: { sv: '21,5 kg månsten', en: '21.5 kg of Moon rock' },
    body: {
      sv: 'Armstrong och Aldrin samlade in 21,5 kg bergarter och månstoft — prover som forskare fortfarande analyserar idag.',
      en: 'Armstrong and Aldrin collected 21.5 kg of rocks and lunar soil — samples that scientists are still analysing today.',
    },
  },
];

const ProgressBar = ({ resetKey }: { resetKey: number }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(false);
    const t = setTimeout(() => setActive(true), 20);
    return () => clearTimeout(t);
  }, [resetKey]);

  return (
    <div className="mt-2.5 h-0.5 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full bg-blue-400/50"
        style={{
          width: active ? '100%' : '0%',
          transition: active ? 'width 4s linear' : 'none',
        }}
      />
    </div>
  );
};
```

- [ ] **Step 2: Add FactSlideshow component**

Append to the file:

```tsx
export const FactSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const locale = useStore((s) => s.locale);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrent((c) => (c + 1) % MOON_FACTS.length);
      setResetKey((k) => k + 1);
    }, 4000);
    return () => clearTimeout(timer);
  }, [current, resetKey]);

  const jumpTo = (idx: number) => {
    setCurrent(idx);
    setResetKey((k) => k + 1);
  };

  const fact = MOON_FACTS[current]!;
  const title = locale === 'sv' ? fact.title.sv : fact.title.en;
  const body = locale === 'sv' ? fact.body.sv : fact.body.en;

  return (
    <div className="pointer-events-auto max-w-sm rounded-2xl border border-blue-400/15 bg-black/60 p-4 backdrop-blur-md">
      <div className="mb-2 flex items-center gap-2 text-blue-400">
        <Info className="h-4 w-4" aria-hidden />
        <span className="ds-eyebrow">Apollo 11 · 1969</span>
      </div>
      <p className="text-sm font-semibold text-blue-100/90 mb-1 leading-snug">{title}</p>
      <p className="text-xs leading-relaxed text-blue-100/70">{body}</p>
      <div className="flex justify-center gap-1.5 mt-3">
        {MOON_FACTS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Fakta ${i + 1}`}
            onClick={() => jumpTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? '16px' : '5px',
              height: '5px',
              background:
                i === current
                  ? 'rgba(160,180,255,0.85)'
                  : 'rgba(160,180,255,0.25)',
            }}
          />
        ))}
      </div>
      <ProgressBar resetKey={resetKey} />
    </div>
  );
};
```

- [ ] **Step 3: Write failing tests**

Create `src/components/organisms/MoonSurface.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { FactSlideshow, MOON_FACTS } from './MoonSurface';

vi.mock('../../store/useStore', () => ({
  useStore: (selector: (s: { locale: string }) => unknown) =>
    selector({ locale: 'sv' }),
}));

describe('FactSlideshow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the first fact card by default', () => {
    render(<FactSlideshow />);
    expect(screen.getByText(MOON_FACTS[0]!.title.sv)).toBeInTheDocument();
  });

  it('auto-advances to the next card after 4 seconds', () => {
    render(<FactSlideshow />);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.getByText(MOON_FACTS[1]!.title.sv)).toBeInTheDocument();
  });

  it('wraps from last card back to first after 4 seconds', () => {
    render(<FactSlideshow />);
    act(() => { vi.advanceTimersByTime(4000 * MOON_FACTS.length); });
    expect(screen.getByText(MOON_FACTS[0]!.title.sv)).toBeInTheDocument();
  });

  it('jumps to clicked dot card and resets timer', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FactSlideshow />);
    const dots = screen.getAllByRole('button', { name: /Fakta/i });
    await user.click(dots[2]!);
    expect(screen.getByText(MOON_FACTS[2]!.title.sv)).toBeInTheDocument();
    // Timer should have reset — advancing 3999ms should NOT advance card
    act(() => { vi.advanceTimersByTime(3999); });
    expect(screen.getByText(MOON_FACTS[2]!.title.sv)).toBeInTheDocument();
  });

  it('renders 5 dot buttons', () => {
    render(<FactSlideshow />);
    expect(screen.getAllByRole('button', { name: /Fakta/i })).toHaveLength(5);
  });
});
```

- [ ] **Step 4: Run tests (expect failures — component not yet wired with real store)**

```
npm run test:unit -- MoonSurface
```

Expected: tests pass (the store mock provides `locale: 'sv'`).

- [ ] **Step 5: Commit**

```bash
git add src/components/organisms/MoonSurface.tsx src/components/organisms/MoonSurface.test.tsx
git commit -m "feat: moon surface — fact slideshow with tests"
```

---

### Task 9: MoonSurface.tsx — root component (HUD overlay)

**Files:**
- Modify: `src/components/organisms/MoonSurface.tsx`

- [ ] **Step 1: Add the MoonSurface root export**

Append to `src/components/organisms/MoonSurface.tsx`:

```tsx
export const MoonSurface = () => {
  const isLandedOnMoon = useStore((s) => s.isLandedOnMoon);
  const setIsLandedOnMoon = useStore((s) => s.setIsLandedOnMoon);
  const setMoonTransitionState = useStore((s) => s.setMoonTransitionState);

  if (!isLandedOnMoon) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-200 flex flex-col bg-[#000310]">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <MoonLandingScene />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        <header className="flex items-center justify-between p-6">
          <div className="pointer-events-auto flex flex-col">
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase">
              Moon Explorer
            </h2>
            <p className="text-sm font-medium text-blue-200/60">
              Fokuserad på: Apollo 11 — Tranquility Base
            </p>
          </div>
          <button
            type="button"
            aria-label="Stäng månscenen"
            onClick={() => {
              setMoonTransitionState('taking_off');
              setTimeout(() => {
                setIsLandedOnMoon(false);
                setTimeout(() => {
                  setMoonTransitionState('idle');
                }, 100);
              }, 3500);
            }}
            className="pointer-events-auto rounded-full bg-black/40 p-3 text-white backdrop-blur-md transition hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        <div className="mt-auto flex items-end justify-between p-6">
          <FactSlideshow />
          <div className="pointer-events-auto flex flex-col gap-2">
            <p className="ds-eyebrow mb-1 text-right text-white/40">
              Dra med musen för att se dig omkring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Run all tests to confirm nothing is broken**

```
npm run test:unit
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/MoonSurface.tsx
git commit -m "feat: moon surface — root component with HUD overlay"
```

---

### Task 10: Visual verification

- [ ] **Step 1: Start dev server**

```
npm run dev
```

- [ ] **Step 2: Navigate to the Moon**

Open the app, click on the Moon in the solar system.

Expected: Moon planet panel opens with info tab.

- [ ] **Step 3: Verify landing button**

Expected: A blue "LANDA PÅ MÅNEN" button appears at the bottom of the planet panel (same position as the orange Mars button).

- [ ] **Step 4: Click the landing button**

Expected:
- Scene zooms in (scale 5) over ~1 s
- Screen fades to black
- After ~1.5 s total, MoonSurface mounts
- Fly-in camera animation starts from high altitude, sweeps down to `[8,3,8]` over ~6.5 s

- [ ] **Step 5: Verify scene elements**

Check each element is visible:
- [ ] Black/dark blue sky (no orange Mars sky)
- [ ] Stars visible as small white-blue dots
- [ ] Earth sphere visible upper-right of scene with blue glow
- [ ] Gray-blue terrain with rocky surface
- [ ] Apollo Lunar Module GLB model centered in scene
- [ ] "Moon Explorer" header (top left), close button (top right)
- [ ] Fact slideshow panel bottom-left — blue color scheme, "Apollo 11 · 1969" eyebrow

- [ ] **Step 6: Verify fact slideshow**

- [ ] First fact card shows Neil Armstrong text
- [ ] After 4 seconds, auto-advances to next card
- [ ] Progress bar fills from left to right during 4 s
- [ ] Clicking a dot jumps immediately to that card and resets the bar
- [ ] Five dots visible; active dot is pill-shaped (wider)

- [ ] **Step 7: Verify close button**

Click the X button.

Expected:
- Camera pulls away (scale-up animation)
- Screen fades to black after ~3 s
- Returns to normal solar system view

- [ ] **Step 8: Commit any visual adjustments**

If Earth sphere position needs tweaking, adjust the `position` prop on `<group>` in `EarthSphere`. Common adjustment: if Earth appears below the horizon, increase the Y value (e.g. `[-50, 90, -100]`).

```bash
git add -p  # stage only intentional changes
git commit -m "fix: tune moon scene visual parameters"
```

---

## Summary

| Task | Files touched | Testable |
|---|---|---|
| 1 — Store state | `useStore.ts`, `useStore.test.ts` | ✅ unit tests |
| 2 — App.tsx overlay | `App.tsx` | manual |
| 3 — Planet panel button | `PlanetPanel.tsx` | manual |
| 4 — HUD wire-up | `HUD.tsx` | manual |
| 5 — Terrain gen + camera | `MoonSurface.tsx` | manual |
| 6 — Terrain, stars, Earth | `MoonSurface.tsx` | manual |
| 7 — LunarModule + scene | `MoonSurface.tsx` | manual |
| 8 — FactSlideshow | `MoonSurface.tsx`, `MoonSurface.test.tsx` | ✅ unit tests |
| 9 — Root component | `MoonSurface.tsx` | manual |
| 10 — Visual verification | — | manual |
