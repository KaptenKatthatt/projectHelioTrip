import { Suspense, lazy, useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei/core/Stars";
import { CameraManager } from "./CameraManager";
import { GlobalZoom } from "./GlobalZoom";
import { PlanetViewportOffset } from "./PlanetViewportOffset";
import { ConstellationViewportOffset } from "./ConstellationViewportOffset";
import { MobileViewOffset } from "./MobileViewOffset";
import { ViewportResizeSync } from "./ViewportResizeSync";
import { MobilePlanetInfoCanvasDismiss } from "./MobilePlanetInfoCanvasDismiss";
import { ConstellationRotationControls } from "./ConstellationRotationControls";
import { OverviewLookControls } from "./OverviewLookControls";
import { SkyFocusCamera } from "./SkyFocusCamera";
import { TimeManager } from "./TimeManager";
import { getQualityPreset, getEffectiveDpr } from "../lib/quality/qualityStore";
import { useQualityPreset } from "../hooks/useQualityPreset";
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
import { AdaptiveQualityController } from "./AdaptiveQualityController";
import { CanvasCapture } from "./CanvasCapture";
import { QualityEffects } from "./QualityEffects";

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

type SceneProps = {
  /** Fires once after the WebGL renderer is created (first interactive shell). */
  readonly onSceneReady?: () => void;
  /**
   * Fires once when this React component first mounts — i.e. when the
   * lazy chunk has finished downloading and React has rendered the tree.
   * This is *before* `onSceneReady`, which only fires after R3F's
   * `<Canvas>` has bootstrapped its WebGL renderer.
   *
   * Splitting the two signals lets `App.tsx` distinguish
   * "the JS chunk is still downloading" (expected on a cold dev server,
   * or on a slow client network) from "the WebGL renderer is stuck"
   * (a real bug worth logging).
   */
  readonly onSceneMounted?: () => void;
};


const SceneContent = ({
  capturesScreenshots,
}: {
  readonly capturesScreenshots: boolean;
}) => {
  const navigationMode = useStore((s) => s.navigationMode);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const showSolarBodies = selectedConstellation === null;
  const needsPlanetOrbitControls = useStore(
    (s) => s.activeBody !== null && s.viewMode === "close",
  );

  const starsRadius = useQualityPreset((preset) => preset.starsRadius);
  const starsCount = useQualityPreset((preset) => preset.starsCount);

  return (
    <>
      <ViewportResizeSync />
      <MobilePlanetInfoCanvasDismiss />
      <MobileViewOffset />
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
            radius={starsRadius}
            depth={400}
            count={starsCount}
            factor={6}
            saturation={0}
            fade
            speed={0.3}
          />
        )}
      </Suspense>

      <TimeManager />
      <QualityEffects />
      <AdaptiveQualityController />
      <CanvasCapture enabled={capturesScreenshots} />
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
      <ConstellationRotationControls />
      <PlanetViewportOffset />
      <ConstellationViewportOffset />
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
    </>
  );
};

export const Scene = ({ onSceneReady, onSceneMounted }: SceneProps) => {

  const sceneReadyFiredRef = useRef(false);
  const sceneMountedFiredRef = useRef(false);
  const handleCanvasCreated = useCallback(() => {
    if (sceneReadyFiredRef.current) return;
    sceneReadyFiredRef.current = true;
    /**
     * Readiness signal for `scripts/perf-baseline.mjs`. The profiler cannot use
     * `networkidle`, because `scheduleDeferredTexturePreloads` keeps warming
     * textures for as long as the page is open.
     */
    (window as { __HELIOTRIP_SCENE_READY__?: boolean }).__HELIOTRIP_SCENE_READY__ =
      true;
    onSceneReady?.();
  }, [onSceneReady]);

  useEffect(() => {
    if (sceneMountedFiredRef.current) return;
    sceneMountedFiredRef.current = true;
    onSceneMounted?.();
  }, [onSceneMounted]);

  /**
   * Read once. `antialias` is a context-creation attribute and cannot change
   * without a new WebGL context, so it is fixed at whatever the boot seed
   * chose; `EffectComposer` multisampling is the knob the controller uses at
   * runtime. The pixel ratio starts here and is then driven imperatively by
   * `QualityEffects`, which avoids re-rendering the whole scene tree.
   */
  const bootAntialias = getQualityPreset().antialias;
  const bootDpr = getEffectiveDpr(
    typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
  );

  /**
   * SceneRouter keeps this canvas mounted at `opacity: 0` behind the Mars and
   * Moon surface scenes, so the solar system kept rendering full frames — two
   * live WebGL contexts and two animation loops — underneath the heaviest
   * scenes in the app, for pixels nobody can see.
   */
  const isLanded = useStore((s) => s.isLanded);
  const isLandedOnMoon = useStore((s) => s.isLandedOnMoon);
  const isHiddenBehindSurfaceScene = isLanded || isLandedOnMoon;

  useEffect(() => {
    scheduleDeferredTexturePreloads();
  }, []);

  return (
    <div className="h-full w-full min-h-0">
      <Canvas
        className="block h-full w-full touch-none"
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
          antialias: bootAntialias,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          // Screenshots are served from inside the render loop by
          // <CanvasCapture />, so the driver can keep swapping buffers
          // instead of preserving and copying one on every frame.
          preserveDrawingBuffer: false,
        }}
        dpr={bootDpr}
        frameloop={isHiddenBehindSurfaceScene ? "never" : "always"}
        onCreated={handleCanvasCreated}
      >
        <SceneContent capturesScreenshots={!isHiddenBehindSurfaceScene} />
      </Canvas>
    </div>
  );
};
