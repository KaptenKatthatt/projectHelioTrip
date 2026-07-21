/**
 * Scene Routing and Scaling Logic
 * 
 * Responsible for mounting the appropriate 3D environment and applying 
 * scale/opacity transforms during transitions between the solar system 
 * overview and planet surface views.
 */
import { Suspense, lazy, memo } from "react";
import { SceneErrorBoundary } from "../SceneErrorBoundary";
import { useStore } from "../../../store/useStore";

// Single import site so the module-eval prefetch below and LazyScene are
// guaranteed to share one module-cache entry.
const loadScene = () => import("../../../scene/Scene");

const LazyScene = lazy(async () => {
  const { Scene } = await loadScene();
  return {
    default: (props: {
      readonly onSceneReady?: () => void;
      readonly onSceneMounted?: () => void;
    }) => <Scene {...props} />,
  };
});

// Start fetching the scene chunk at module evaluation, in parallel with
// React mounting, instead of waiting for the first render to trigger the
// lazy import. Failures are deliberately swallowed here: the guarded
// LazyScene import retries the same chunk and surfaces errors through
// SceneErrorBoundary, so this must not emit an unhandled rejection.
void loadScene().catch(() => {});

interface SceneRouterProps {
  sceneMountKey: number;
  handleSceneReady: () => void;
  handleSceneMounted: () => void;
  handleRetryScene: () => void;
}

export const SceneRouter = memo(({ sceneMountKey, handleSceneReady, handleSceneMounted, handleRetryScene }: SceneRouterProps) => {
  const isLanded = useStore((s) => s.isLanded);
  const marsTransitionState = useStore((s) => s.marsTransitionState);
  const moonTransitionState = useStore((s) => s.moonTransitionState);
  const isLandedOnMoon = useStore((s) => s.isLandedOnMoon);

  return (
    <div
      className="absolute inset-0 z-0 min-h-0 transition-transform duration-[3000ms] ease-in-out"
      style={{
        transform:
          (marsTransitionState !== 'idle' || isLanded || moonTransitionState !== 'idle' || isLandedOnMoon)
            ? 'scale(5)'
            : 'scale(1)',
        transformOrigin: 'center center',
        opacity: (isLanded || isLandedOnMoon) ? 0 : 1,
      }}
    >
      <SceneErrorBoundary onRetry={handleRetryScene}>
        <Suspense fallback={null}>
          <LazyScene
            key={sceneMountKey}
            onSceneReady={handleSceneReady}
            onSceneMounted={handleSceneMounted}
          />
        </Suspense>
      </SceneErrorBoundary>
    </div>
  );
});
