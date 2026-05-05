# ISS GLB Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-built primitive ISS model with the real NASA GLB model and introduce a generic `glbPath` field on `SatelliteDefinition` so future satellites can also use real 3D models.

**Architecture:** Add an optional `glbPath` field to `SatelliteDefinition`. In `Satellite.tsx`, a new `GLBSatelliteModel` component loads the GLB via `useGLTF` and renders it as a `<primitive>`. The existing `FallbackBody` is kept as a Suspense fallback so something always renders during load.

**Tech Stack:** React Three Fiber, `@react-three/drei` (`useGLTF`), Vitest, TypeScript

---

### Task 1: Rename the GLB file

**Files:**
- Rename: `public/International Space Station (ISS) (A).glb` → `public/International_Space_Station_(ISS)_(A).glb`

- [ ] **Step 1: Rename the file**

```bash
mv "public/International Space Station (ISS) (A).glb" "public/International_Space_Station_(ISS)_(A).glb"
```

- [ ] **Step 2: Verify the file exists at the new path**

```bash
ls public/International_Space_Station_\(ISS\)_\(A\).glb
```

Expected: file listed with no error.

- [ ] **Step 3: Commit**

```bash
git add -A public/
git commit -m "chore: rename ISS GLB file to use underscores"
```

---

### Task 2: Add `glbPath` to `SatelliteDefinition` and set it on ISS

**Files:**
- Modify: `src/lib/satellites.ts`
- Test: `src/lib/satellites.test.ts` (new file)

- [ ] **Step 1: Write a failing test**

Create `src/lib/satellites.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { SATELLITES, getSatellite } from './satellites';

describe('SATELLITES', () => {
  it('ISS entry has a glbPath pointing to the renamed file', () => {
    const iss = getSatellite('iss');
    expect(iss?.glbPath).toBe('/International_Space_Station_(ISS)_(A).glb');
  });

  it('glbPath is optional — a satellite without it still type-checks', () => {
    const allHaveValidShape = SATELLITES.every(
      (s) => typeof s.id === 'string' && typeof s.radius === 'number',
    );
    expect(allHaveValidShape).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/lib/satellites.test.ts
```

Expected: FAIL — `iss?.glbPath` is `undefined`.

- [ ] **Step 3: Add `glbPath` to the type and ISS entry in `src/lib/satellites.ts`**

Add `glbPath?: string;` to `SatelliteDefinition` (after the `phase` field):

```ts
export type SatelliteDefinition = {
  id: SatelliteId;
  parent: PlanetId;
  radius: number;
  color: string;
  orbitRadius: number;
  periodDays: number;
  inclination: number;
  ascendingNode: number;
  phase: number;
  glbPath?: string;
};
```

Add `glbPath` to the ISS entry in `SATELLITES`:

```ts
export const SATELLITES: readonly SatelliteDefinition[] = [
  {
    id: 'iss',
    parent: 'earth',
    radius: 0.08,
    color: '#d8deea',
    orbitRadius: 1.9,
    periodDays: 1,
    inclination: 51.6 * DEG,
    ascendingNode: 0,
    phase: 0,
    glbPath: '/International_Space_Station_(ISS)_(A).glb',
  },
];
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx vitest run src/lib/satellites.test.ts
```

Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/satellites.ts src/lib/satellites.test.ts
git commit -m "feat: add optional glbPath to SatelliteDefinition, set on ISS"
```

---

### Task 3: Add `GLBSatelliteModel` and update `Satellite.tsx`

**Files:**
- Modify: `src/scene/Satellite.tsx`

- [ ] **Step 1: Add imports**

At the top of `src/scene/Satellite.tsx`, add `Suspense` and `useGLTF`:

```tsx
import { Suspense, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { type Group } from 'three';
import type { SatelliteDefinition } from '../lib/satellites';
import { useStore } from '../store/useStore';
import {
  getLivePosition,
  getLiveSatelliteOffset,
} from '../lib/positionsBus';
```

- [ ] **Step 2: Add `GLBSatelliteModel` component and preload call**

Add this below the imports, before the `Props` type:

```tsx
useGLTF.preload('/International_Space_Station_(ISS)_(A).glb');

const GLBSatelliteModel = ({
  path,
  radius,
}: {
  path: string;
  radius: number;
}) => {
  const { scene } = useGLTF(path);
  return <primitive object={scene} scale={radius} />;
};
```

- [ ] **Step 3: Update the `Satellite` render logic**

Replace the existing `if (satellite.id === 'iss')` branch with a `glbPath` check:

```tsx
if (satellite.glbPath) {
  return (
    <group ref={groupRef} position={initial}>
      <Suspense
        fallback={
          <FallbackBody radius={satellite.radius} color={satellite.color} />
        }
      >
        <GLBSatelliteModel
          path={satellite.glbPath}
          radius={satellite.radius}
        />
      </Suspense>
    </group>
  );
}
```

The fallback `return` at the bottom of `Satellite` stays unchanged.

- [ ] **Step 4: Remove `ISSModel` and `SolarPanel`**

Delete the `ISSModel` component (lines ~91–130) and the `SolarPanel` component (lines ~132–153) entirely — they are no longer used.

- [ ] **Step 5: Run TypeScript and lint**

```bash
npx tsc --noEmit
npm run lint
```

Expected: zero errors and zero warnings.

- [ ] **Step 6: Commit**

```bash
git add src/scene/Satellite.tsx
git commit -m "feat: replace primitive ISS model with NASA GLB via generic GLBSatelliteModel"
```

---

### Task 4: Visual verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open the app and check ISS**

Navigate to Earth in the scene. Confirm:
- ISS orbits Earth and is visible
- The model looks like a real space station (not a box/cylinders)
- No console errors about missing files or failed GLB loads

- [ ] **Step 3: Test slow-load fallback (optional)**

In browser DevTools → Network tab → throttle to "Slow 3G". Reload. Confirm ISS briefly shows as the primitive fallback before the GLB loads.

- [ ] **Step 4: Run full test suite**

```bash
npm run test:unit
```

Expected: all tests pass.
