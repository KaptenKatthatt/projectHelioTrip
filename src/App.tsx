import {
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
import { usePhoneLandscapePortraitLock } from "./hooks/usePhoneLandscapePortraitLock";
import { useStore } from "./store/useStore";
import { parseShareLink } from "./lib/shareLink";
import { analytics } from "./lib/analytics";
import { SceneTransitions } from "./components/templates/App/SceneTransitions";
import { SceneRouter } from "./components/templates/App/SceneRouter";

/**
 * E2E tests set `window.__HELIOTRIP_E2E__ = true` via
 * `page.addInitScript` before navigation. When detected we collapse all
 * loading gates to zero so Playwright doesn't burn 5–30 s per test waiting
 * for the dev-server-compiled WebGL scene to load + boot. The Lab UI is a
 * 2D HTML overlay so it does not need the 3D scene to be ready in order
 * to be tested.
 */
const isE2E =
  typeof window !== "undefined" &&
  (window as { __HELIOTRIP_E2E__?: boolean }).__HELIOTRIP_E2E__ === true;

/** Minimum time the loading screen is shown (ms) — purely cosmetic splash. */
const MIN_LOADING_MS = isE2E ? 0 : 5000;

/**
 * Cold-load grace period for the lazy `Scene` chunk to mount.
 *
 * Vite dev compiles transitive imports lazily, so the first request for the
 * Scene module (which pulls in R3F, drei, Stars, Planets, Moons, Satellites,
 * AsteroidBelt and several sub-lazy chunks) can take 10–30 s before React
 * even mounts the component. We give it a wide window before bailing out and
 * dismissing the splash so the user is not stranded forever on a genuinely
 * slow connection.
 */
const SCENE_MOUNT_TIMEOUT_MS = isE2E
  ? 0
  : import.meta.env.DEV
    ? 30000
    : 15000;

/**
 * Once `Scene` has mounted (chunk fully loaded + React rendered), R3F's
 * `<Canvas>` should fire `onCreated` within a frame or two. If it takes
 * longer than this, the WebGL renderer itself is stuck — that is a real
 * issue worth surfacing in the console.
 */
const WEBGL_INIT_TIMEOUT_MS = isE2E ? 0 : 3000;

export const App = () => {
  const portraitLock = usePhoneLandscapePortraitLock();
  const locale = useStore((s) => s.locale);
  const appStartMsRef = useRef<number | null>(null);
  const [minGateDone, setMinGateDone] = useState(false);
  const [sceneMounted, setSceneMounted] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [gateMounted, setGateMounted] = useState(true);
  const [sceneMountKey, setSceneMountKey] = useState(0);

  const handleSceneMounted = useCallback(() => {
    setSceneMounted(true);
  }, []);

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
    setSceneMounted(false);
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

  // Phase 1: wait for the lazy `Scene` chunk to mount. If it doesn't mount
  // within `SCENE_MOUNT_TIMEOUT_MS` the chunk download is genuinely slow
  // (cold dev server compile, slow network, etc). Surface a `console.info`
  // diagnostic — it's degraded UX, not an error — and dismiss the splash
  // anyway so the user is not stranded.
  useEffect(() => {
    if (sceneMounted || sceneReady) return;
    const t = window.setTimeout(() => {
      if (!isE2E) {
        console.info("HelioTrip: Scene chunk slow to mount", {
          feature: "scene_chunk_timeout",
          timeoutMs: SCENE_MOUNT_TIMEOUT_MS,
        });
      }
      setSceneReady(true);
    }, SCENE_MOUNT_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [sceneMounted, sceneReady]);

  // Phase 2: once Scene has mounted, R3F's `<Canvas>` should call
  // `onCreated` within a frame or two. If it doesn't fire within
  // `WEBGL_INIT_TIMEOUT_MS` the renderer itself is stuck — that *is* a real
  // problem, so emit a `console.warn` with the diagnostic context.
  useEffect(() => {
    if (!sceneMounted || sceneReady) return;
    const t = window.setTimeout(() => {
      if (!isE2E) {
        console.warn("HelioTrip: WebGL renderer did not signal ready", {
          feature: "scene_webgl_timeout",
          timeoutMs: WEBGL_INIT_TIMEOUT_MS,
        });
      }
      setSceneReady(true);
    }, WEBGL_INIT_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [sceneMounted, sceneReady]);

  const dismissOverlay = minGateDone && sceneReady;

  return (
    <>
      {gateMounted ? (
        <LoadingScreen dismiss={dismissOverlay} onDismissed={handleDismissed} />
      ) : null}
      
      <SceneTransitions />

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
          <SceneRouter
            sceneMountKey={sceneMountKey}
            handleSceneReady={handleSceneReady}
            handleSceneMounted={handleSceneMounted}
            handleRetryScene={handleRetryScene}
          />
          <HUD hudFrame={portraitLock.active ? "stage" : "viewport"} />
        </div>
        {portraitLock.active ? <PortraitRotateOverlay /> : null}
      </div>
      <Analytics />
      <SpeedInsights />
    </>
  );
};
