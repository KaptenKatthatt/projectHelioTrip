import { useTranslation } from '../hooks/useTranslation';
import { LanguageToggle } from './LanguageToggle';
import { PlanetPanel } from './PlanetPanel';
import { PlanetSelector } from './PlanetSelector';
import { TimeScrubber } from './TimeScrubber';
import { ViewModeToggle } from './ViewModeToggle';

export const HUD = () => {
  const { t } = useTranslation();
  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-5 font-sans text-white sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="pointer-events-auto">
          <h1 className="text-lg font-semibold tracking-tight">
            {t.appTitle}
          </h1>
          <p className="text-xs text-white/50">{t.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle />
          <LanguageToggle />
        </div>
      </header>

      <div className="flex items-end justify-between gap-6">
        <PlanetSelector />
        <PlanetPanel />
      </div>

      <footer>
        <TimeScrubber />
      </footer>
    </div>
  );
};
