import { Suspense, lazy, useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei/core/Stars";
import { CameraManager } from "./CameraManager";
import { GlobalZoom } from "./GlobalZoom";
import { MobileCloseViewFraming } from "./MobileCloseViewFraming";
import { ViewportResizeSync } from "./ViewportResizeSync";
import { OverviewLookControls } from "./OverviewLookControls";
import { SkyFocusCamera } from "./SkyFocusCamera";
import { TimeManager } from "./TimeManager";
import {
  getCanvasDprCap,
  getGraphicsPreset,
  getGraphicsTier,
} from "../lib/graphicsTier";
import {
  INITIAL_OVERVIEW_CAMERA_POSITION,
  INITIAL_OVERVIEW_FOV,
} from "../lib/initialCamera";
import { useStore } from "../store/useStore";
import { Planets } from "./Planets";
import { Moons } from "./Moons";
import { Satellites } from "./Satellites";
import { AsteroidBelt } from "./AsteroidBelt";
import { OrbitLines } from "./OrbitLines";
import { MilkyWayBackground } from "./MilkyWayBackground";
import { scheduleDeferredTexturePreloads } from "../lib/texturePreload";
import { PerformanceBaselineProbe } from "./PerformanceBaselineProbe";

const LazyBodyPickers = lazy(async () => {
  const module = await import("./BodyPickers");
  return { default: module.BodyPickers };
});

const LazyConstellationLines = lazy(async () => {
  const module = await import("./ConstellationLines");
  return { default: module.ConstellationLines };
});

const LazyFreeFlightControls = lazy(async () => {
  const module = await import("./FreeFlightControls");
  return { default: module.FreeFlightControls };
});

const LazyEffects = lazy(async () => {
  const module = await import("./Effects");
  return { default: module.Effects };
});

const LazyPlanetOrbitControls = lazy(async () => {
  const module = await import("./PlanetOrbitControls");
  return { default: module.PlanetOrbitControls };
});

export type SceneProps = {
  /** Fires once after the WebGL renderer is created (first interactive shell). */
  readonly onSceneReady?: () => void;
};

export const Scene = ({ onSceneReady }: SceneProps) => {
  const sceneReadyFiredRef = useRef(false);
  const handleCanvasCreated = useCallback(() => {
    if (sceneReadyFiredRef.current) return;
    sceneReadyFiredRef.current = true;
    onSceneReady?.();
  }, [onSceneReady]);

  const navigationMode = useStore((s) => s.navigationMode);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const showSolarBodies = selectedConstellation === null;
  const needsPlanetOrbitControls = useStore(
    (s) => s.activeBody !== null && s.viewMode === "close",
  );

  const graphicsTier = getGraphicsTier();
  const graphicsPreset = getGraphicsPreset();
  const dprCap = getCanvasDprCap(graphicsTier);

  useEffect(() => {
    scheduleDeferredTexturePreloads();
  }, []);

  return (
    <Canvas
      camera={{
        position: [
          INITIAL_OVERVIEW_CAMERA_POSITION.x,
          INITIAL_OVERVIEW_CAMERA_POSITION.y,
          INITIAL_OVERVIEW_CAMERA_POSITION.z,
        ],
        fov: INITIAL_OVERVIEW_FOV,
        near: 0.1,
        far: 8000,
      }}
      gl={{
        antialias: graphicsPreset.antialias,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      dpr={dprCap}
      onCreated={handleCanvasCreated}
    >
      <ViewportResizeSync />
      <color attach="background" args={["#05060a"]} />

      <ambientLight intensity={0.25} color="#b3c2ff" />
      <pointLight
        position={[0, 0, 0]}
        intensity={3.5}
        decay={0}
        color="#fff1c4"
      />

      <Suspense fallback={null}>
        {navigationMode === "free" ? (
          <MilkyWayBackground />
        ) : (
          <Stars
            radius={graphicsPreset.starsRadius}
            depth={400}
            count={graphicsPreset.starsCount}
            factor={6}
            saturation={0}
            fade
            speed={0.3}
          />
        )}
      </Suspense>

      <TimeManager />
      <PerformanceBaselineProbe />
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
      {needsPlanetOrbitControls ? (
        <Suspense fallback={null}>
          <LazyPlanetOrbitControls />
        </Suspense>
      ) : null}
      <OverviewLookControls />
      <GlobalZoom />
      <MobileCloseViewFraming />
      <Suspense fallback={null}>
        <LazyBodyPickers />
      </Suspense>
      {navigationMode === "free" && (
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
