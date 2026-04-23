import { useEffect, useState } from 'react';
import { MousePointerClick } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

/**
 * Shown only while `navigationMode === 'free'` and the pointer is NOT
 * locked. Click anywhere to let PointerLockControls request the lock;
 * ESC (browser default) releases it.
 */
export const FreeFlightHint = () => {
  const { t } = useTranslation();
  const navigationMode = useStore((s) => s.navigationMode);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const update = (): void => {
      setLocked(document.pointerLockElement !== null);
    };
    update();
    document.addEventListener('pointerlockchange', update);
    return () => document.removeEventListener('pointerlockchange', update);
  }, []);

  if (navigationMode !== 'free' || locked) return null;

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
