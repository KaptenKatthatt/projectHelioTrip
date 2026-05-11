import { useCallback, useEffect, useState } from "react";

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

export const useAppLoading = (appStartMsRef: React.MutableRefObject<number | null>) => {
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
  }, [appStartMsRef]);

  const handleDismissed = useCallback(() => {
    setGateMounted(false);
  }, []);

  const handleRetryScene = useCallback(() => {
    setSceneMounted(false);
    setSceneReady(false);
    setSceneMountKey((value) => value + 1);
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

  return {
    gateMounted,
    dismissOverlay,
    handleDismissed,
    sceneMountKey,
    handleSceneReady,
    handleSceneMounted,
    handleRetryScene,
  };
};
