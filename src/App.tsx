import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { HUD } from "./components/HUD";
import { LoadingScreen } from "./components/LoadingScreen";
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
  const [minGateDone, setMinGateDone] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [gateMounted, setGateMounted] = useState(true);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const handleDismissed = useCallback(() => {
    setGateMounted(false);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const t = window.setTimeout(() => setMinGateDone(true), MIN_LOADING_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (sceneReady) return;
    const fallback = window.setTimeout(() => {
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
      <Suspense fallback={null}>
        <LazyScene onSceneReady={handleSceneReady} />
      </Suspense>
      <HUD />
    </>
  );
};
