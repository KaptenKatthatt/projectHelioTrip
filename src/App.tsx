import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { HUD } from "./components/HUD";
import { LoadingScreen } from "./components/LoadingScreen";
import { SceneErrorBoundary } from "./components/SceneErrorBoundary";
import { useStore } from "./store/useStore";

/** Minsta tid laddningsskärmen visas (ms). Öka för längre “splash”, sänk för snabbare borttagning. */
const MIN_LOADING_MS = 5000;
/** Failsafe: dismiss loading even if WebGL init never fires onSceneReady. */
const SCENE_READY_FALLBACK_MS = 12000;

const LazyScene = lazy(async () => {
  const { Scene } = await import("./scene/Scene");
  return {
    default: (props: { readonly onSceneReady?: () => void }) => (
      <Scene {...props} />
    ),
  };
});

export const App = () => {
  const locale = useStore((s) => s.locale);
  const appStartMsRef = useRef<number | null>(null);
  const [minGateDone, setMinGateDone] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [gateMounted, setGateMounted] = useState(true);
  const [sceneMountKey, setSceneMountKey] = useState(0);

  const handleSceneReady = useCallback(() => {
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const startedAt = appStartMsRef.current;
    console.info("HelioTrip scene ready", {
      metric: "scene_ready_ms",
      value: startedAt === null ? 0 : Math.round(now - startedAt),
    });
    setSceneReady(true);
  }, []);

  const handleDismissed = useCallback(() => {
    setGateMounted(false);
  }, []);

  const handleRetryScene = useCallback(() => {
    setSceneReady(false);
    setSceneMountKey((value) => value + 1);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    appStartMsRef.current =
      typeof performance !== "undefined" ? performance.now() : Date.now();
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setMinGateDone(true), MIN_LOADING_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (sceneReady) return;
    const fallback = window.setTimeout(() => {
      console.error("Scene ready fallback fired", {
        feature: "scene_ready_fallback",
        fallbackDelayMs: SCENE_READY_FALLBACK_MS,
        sceneReadyBeforeFallback: sceneReady,
      });
      setSceneReady(true);
    }, SCENE_READY_FALLBACK_MS);
    return () => window.clearTimeout(fallback);
  }, [sceneReady]);

  const dismissOverlay = minGateDone && sceneReady;

  return (
    <>
      {gateMounted ? (
        <LoadingScreen dismiss={dismissOverlay} onDismissed={handleDismissed} />
      ) : null}
      <SceneErrorBoundary onRetry={handleRetryScene}>
        <Suspense fallback={null}>
          <LazyScene key={sceneMountKey} onSceneReady={handleSceneReady} />
        </Suspense>
      </SceneErrorBoundary>
      <HUD />
      <Analytics />
      <SpeedInsights />
    </>
  );
};
