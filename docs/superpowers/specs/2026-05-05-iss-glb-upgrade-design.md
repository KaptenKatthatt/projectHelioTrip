# ISS GLB Upgrade — Design Spec

**Date:** 2026-05-05
**Branch:** iss-upgrade

## Goal

Replace the hand-built primitive ISS model (cylinders/boxes in `Satellite.tsx`) with the real NASA GLB model. Add a generic GLB loader to `Satellite.tsx` so future satellites (Voyager, Hubble, Tiangong, etc.) can also use real 3D models.

## File changes

### 1. Rename GLB file

`public/International Space Station (ISS) (A).glb`
→ `public/International_Space_Station_(ISS)_(A).glb`

Underscores instead of spaces to avoid percent-encoding in code.

### 2. `src/lib/satellites.ts`

Add optional `glbPath` field to `SatelliteDefinition`:

```ts
glbPath?: string;
```

Set it on the ISS entry:

```ts
glbPath: '/International_Space_Station_(ISS)_(A).glb',
```

### 3. `src/scene/Satellite.tsx`

Add `GLBSatelliteModel` component:

```tsx
const GLBSatelliteModel = ({ path, radius }: { path: string; radius: number }) => {
  const { scene } = useGLTF(path);
  return <primitive object={scene} scale={radius} />;
};
```

Add preload call at module level (outside any component):

```ts
useGLTF.preload('/International_Space_Station_(ISS)_(A).glb');
```

Update the `Satellite` render branch for ISS:

```tsx
if (satellite.glbPath) {
  return (
    <group ref={groupRef} position={initial}>
      <Suspense fallback={<FallbackBody radius={satellite.radius} color={satellite.color} />}>
        <GLBSatelliteModel path={satellite.glbPath} radius={satellite.radius} />
      </Suspense>
    </group>
  );
}
```

Remove the old `if (satellite.id === 'iss')` branch and the `ISSModel` / `SolarPanel` components.

## Fallback behavior

- While GLB loads → `FallbackBody` (existing primitive box) is shown
- If no `glbPath` set → `FallbackBody` always shown (backwards-compatible for future satellites without a model)

## Scale note

`GLBSatelliteModel` uses `scale={radius}` (0.08 scene units). The GLB model may need a multiplier tweak after visual inspection — this is a one-line change in `satellites.ts` or the component.

## No new files

All changes in two existing files. No additional abstractions.
