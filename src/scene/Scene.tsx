import { Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei/core/Stars';
import { CameraManager } from './CameraManager';
import { GlobalZoom } from './GlobalZoom';
import { OverviewLookControls } from './OverviewLookControls';
import { PlanetOrbitControls } from './PlanetOrbitControls';
import { SkyFocusCamera } from './SkyFocusCamera';
import { TimeManager } from './TimeManager';
import { useStore } from '../store/useStore';
import { Planets } from './Planets';
import { Moons } from './Moons';
import { Satellites } from './Satellites';
import { AsteroidBelt } from './AsteroidBelt';
import { OrbitLines } from './OrbitLines';
import { MilkyWayBackground } from './MilkyWayBackground';

const LazyBodyPickers = lazy(async () => {
  const module = await import('./BodyPickers');
  return { default: module.BodyPickers };
});

const LazyConstellationLines = lazy(async () => {
  const module = await import('./ConstellationLines');
  return { default: module.ConstellationLines };
});

const LazyFreeFlightControls = lazy(async () => {
  const module = await import('./FreeFlightControls');
  return { default: module.FreeFlightControls };
});

const LazyEffects = lazy(async () => {
  const module = await import('./Effects');
  return { default: module.Effects };
});

export const Scene = () => {
  const navigationMode = useStore((s) => s.navigationMode);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const showSolarBodies = selectedConstellation === null;

  return (
    <Canvas
      camera={{ position: [0, 20, 80], fov: 55, near: 0.1, far: 8000 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#05060a']} />

      <ambientLight intensity={0.25} color="#b3c2ff" />
      <pointLight
        position={[0, 0, 0]}
        intensity={3.5}
        decay={0}
        color="#fff1c4"
      />

      <Suspense fallback={null}>
        {navigationMode === 'free' ? (
          <MilkyWayBackground />
        ) : (
          <Stars
            radius={2500}
            depth={400}
            count={12000}
            factor={6}
            saturation={0}
            fade
            speed={0.3}
          />
        )}
      </Suspense>

      <TimeManager />
      <OrbitLines />
      <Suspense fallback={null}>
        <LazyConstellationLines />
      </Suspense>
      {showSolarBodies ? (
        <>
          <Suspense fallback={null}>
            <Planets />
          </Suspense>
          <Moons />
          <Satellites />
          <AsteroidBelt />
        </>
      ) : null}

      <CameraManager />
      <SkyFocusCamera />
      <PlanetOrbitControls />
      <OverviewLookControls />
      <GlobalZoom />
      <Suspense fallback={null}>
        <LazyBodyPickers />
      </Suspense>
      {navigationMode === 'free' && (
        <Suspense fallback={null}>
          <LazyFreeFlightControls />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <LazyEffects />
      </Suspense>
    </Canvas>
  );
};
