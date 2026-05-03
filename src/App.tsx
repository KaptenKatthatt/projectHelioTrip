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
import { PortraitRotateOverlay } from "./components/molecules/PortraitRotateOverlay";
import { HUD } from "./components/templates/HUD";
import { LoadingScreen } from "./components/templates/LoadingScreen";
import { SceneErrorBoundary } from "./components/templates/SceneErrorBoundary";
import { usePhoneLandscapePortraitLock } from "./hooks/usePhoneLandscapePortraitLock";
import { useStore } from "./store/useStore";
import { parseShareLink } from "./lib/shareLink";
import { analytics } from "./lib/analytics";

/** Minimum time the loading screen is shown (ms). Increase for a longer "splash", decrease for faster dismissal. */
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
  const portraitLock = usePhoneLandscapePortraitLock();
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
    if (typeof window === "undefined") return;
    const snapshot = parseShareLink(window.location.search);
    if (!snapshot) return;
    useStore.getState().restoreFromShareLink(snapshot);
    // Strip the share params from the URL once restored so reloads
    // don't keep re-applying them and accidentally fire analytics.
    const cleanUrl =
      window.location.origin + window.location.pathname + window.location.hash;
    window.history.replaceState(null, "", cleanUrl);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    analytics.deviceType(isMobile ? "mobile" : "desktop");

    const hour = new Date().getHours();
    let timeOfDay: "morning" | "afternoon" | "evening" | "night" = "night";
    if (hour >= 6 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
    else if (hour >= 18 && hour < 22) timeOfDay = "evening";
    
    analytics.timeOfDay(timeOfDay);
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

  const sceneBoundary = (
    <SceneErrorBoundary onRetry={handleRetryScene}>
      <Suspense fallback={null}>
        <LazyScene key={sceneMountKey} onSceneReady={handleSceneReady} />
      </Suspense>
    </SceneErrorBoundary>
  );

  return (
    <>
      {gateMounted ? (
        <LoadingScreen dismiss={dismissOverlay} onDismissed={handleDismissed} />
      ) : null}
      <div
        className={
          "fixed inset-0 z-0 min-h-0 " +
          (portraitLock.active
            ? "flex items-center justify-center bg-[hsl(231_38%_10%)]"
            : "")
        }
      >
        <div
          className="relative isolate min-h-0"
          style={
            portraitLock.active
              ? {
                  width: portraitLock.stageWidth,
                  height: portraitLock.stageHeight,
                }
              : { width: "100%", height: "100%" }
          }
        >
          <div className="absolute inset-0 z-0 min-h-0">{sceneBoundary}</div>
          <HUD hudFrame={portraitLock.active ? "stage" : "viewport"} />
        </div>
        {portraitLock.active ? <PortraitRotateOverlay /> : null}
      </div>
      <Analytics />
      <SpeedInsights />
    </>
  );
};
