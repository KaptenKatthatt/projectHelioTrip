import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { PortraitRotateOverlay } from "./components/molecules/PortraitRotateOverlay";
import { HUD } from "./components/templates/HUD";
import { LoadingScreen } from "./components/templates/LoadingScreen";
import { usePhoneLandscapePortraitLock } from "./hooks/usePhoneLandscapePortraitLock";
import { SceneTransitions } from "./components/templates/App/SceneTransitions";
import { SceneRouter } from "./components/templates/App/SceneRouter";
import { useAppInit } from "./hooks/useAppInit";
import { useAppLoading } from "./hooks/useAppLoading";

export const App = () => {
  const portraitLock = usePhoneLandscapePortraitLock();

  const { appStartMsRef } = useAppInit();

  const {
    gateMounted,
    dismissOverlay,
    handleDismissed,
    sceneMountKey,
    handleSceneReady,
    handleSceneMounted,
    handleRetryScene,
  } = useAppLoading(appStartMsRef);

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
