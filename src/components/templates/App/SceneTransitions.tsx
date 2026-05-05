/**
 * Cinematic Scene Transition Overlays
 * 
 * Manages full-screen black overlays used to mask scene changes 
 * during landing and takeoff sequences (Mars and Moon). 
 * Includes specific timing delays for cinematic effect.
 */
import { useStore } from "../../../store/useStore";

export const SceneTransitions = () => {
  const marsTransitionState = useStore((s) => s.marsTransitionState);
  const moonTransitionState = useStore((s) => s.moonTransitionState);

  return (
    <>
      {/* Cinematic Mars Transition Overlay */}
      <div
        className={`pointer-events-none fixed inset-0 z-[300] bg-black ease-in-out ${
          marsTransitionState !== 'idle' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transitionProperty: 'opacity',
          transitionDuration: '500ms',
          transitionDelay: marsTransitionState === 'landing' ? '2500ms' : marsTransitionState === 'taking_off' ? '3000ms' : '0ms'
        }}
      />

      {/* Cinematic Moon Transition Overlay */}
      <div
        className={`pointer-events-none fixed inset-0 z-[300] bg-black ease-in-out ${
          moonTransitionState !== 'idle' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transitionProperty: 'opacity',
          transitionDuration: '500ms',
          transitionDelay:
            moonTransitionState === 'landing'
              ? '1000ms'
              : moonTransitionState === 'taking_off'
                ? '3000ms'
                : '0ms',
        }}
      />
    </>
  );
};
