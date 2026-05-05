/**
 * Moon Surface HUD Overlay and Scene Entry
 * 
 * This is the main entry point for the Moon surface view.
 * It manages the HUD overlay (header, exit button, facts) and
 * renders the 3D MoonLandingScene when active.
 */
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { MoonLandingScene } from './MoonSurface/MoonLandingScene';
import { FactSlideshow } from './MoonSurface/FactSlideshow';

export const MoonSurface = () => {
  const { t } = useTranslation();
  const isLandedOnMoon = useStore((s) => s.isLandedOnMoon);
  const moonTransitionState = useStore((s) => s.moonTransitionState);
  const setIsLandedOnMoon = useStore((s) => s.setIsLandedOnMoon);
  const setMoonTransitionState = useStore((s) => s.setMoonTransitionState);

  if (!isLandedOnMoon) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-200 flex flex-col bg-[#000310]">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <MoonLandingScene
          onTakeoffComplete={() => {
            setIsLandedOnMoon(false);
            setMoonTransitionState('idle');
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        <header className="flex items-center justify-between p-6">
          <div className="pointer-events-auto flex flex-col">
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase">
              {t.moonSurface.title}
            </h2>
            <p className="text-sm font-medium text-blue-200/60">{t.moonSurface.subtitle}</p>
          </div>

          <button
            type="button"
            aria-label={t.moonSurface.closeAriaLabel}
            onClick={() => {
              if (moonTransitionState === 'taking_off') return;
              setMoonTransitionState('taking_off');
            }}
            disabled={moonTransitionState === 'taking_off'}
            className="pointer-events-auto rounded-full bg-black/40 p-3 text-white backdrop-blur-md transition hover:bg-white/10"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </header>

        <div className="mt-auto flex items-end justify-between p-6">
          <FactSlideshow />

          <div className="pointer-events-auto flex flex-col gap-2">
            <p className="ds-eyebrow mb-1 text-right text-white/40">{t.moonSurface.mouseHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
