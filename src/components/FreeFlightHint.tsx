import { useEffect, useState } from 'react';
import { Gamepad2, MousePointerClick } from 'lucide-react';
import { useIsMobileLayout } from '../hooks/useIsMobileLayout';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

type MobileTouchHintPhase = 'visible' | 'fading' | 'gone';

/**
 * Desktop: shown while free flight and pointer not locked — click canvas
 * to lock. Mobile: short hint for on-screen sticks; fades out on first touch.
 */
export const FreeFlightHint = () => {
  const { t } = useTranslation();
  const navigationMode = useStore((s) => s.navigationMode);
  const isMobile = useIsMobileLayout();
  const [locked, setLocked] = useState(false);
  const [mobileTouchHint, setMobileTouchHint] =
    useState<MobileTouchHintPhase>('gone');

  useEffect(() => {
    const update = (): void => {
      setLocked(document.pointerLockElement !== null);
    };
    update();
    document.addEventListener('pointerlockchange', update);
    return () => document.removeEventListener('pointerlockchange', update);
  }, []);

  useEffect(() => {
    if (navigationMode === 'free' && isMobile) {
      setMobileTouchHint('visible');
    } else {
      setMobileTouchHint('gone');
    }
  }, [navigationMode, isMobile]);

  useEffect(() => {
    if (navigationMode !== 'free' || !isMobile || mobileTouchHint !== 'visible') {
      return;
    }

    const onPointerDown = (): void => {
      setMobileTouchHint('fading');
    };

    window.addEventListener('pointerdown', onPointerDown, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, { capture: true });
    };
  }, [navigationMode, isMobile, mobileTouchHint]);

  if (navigationMode !== 'free') return null;

  if (isMobile) {
    if (mobileTouchHint === 'gone') return null;

    const fadeClass =
      mobileTouchHint === 'fading' ? 'opacity-0' : 'opacity-100';

    return (
      <div
        className={`pointer-events-none fixed inset-x-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center justify-center text-center transition-opacity duration-300 ease-out ${fadeClass}`}
        onTransitionEnd={(event): void => {
          if (event.propertyName !== 'opacity') return;
          if (mobileTouchHint === 'fading') {
            setMobileTouchHint('gone');
          }
        }}
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white/90 backdrop-blur-md">
          <Gamepad2 className="h-4 w-4" />
          <span>{t.ui.freeFlightTouchHint}</span>
        </div>
      </div>
    );
  }

  if (locked) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2 text-center">
      <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white/90 backdrop-blur-md">
        <MousePointerClick className="h-4 w-4" />
        <span>{t.ui.clickToFly}</span>
      </div>
      <p className="text-xs text-white/50">{t.ui.escToRelease}</p>
    </div>
  );
};
