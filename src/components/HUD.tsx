import { useTranslation } from '../hooks/useTranslation';
import { getBodyColor } from '../lib/bodies';
import { useStore } from '../store/useStore';
import { CollapsibleHudPanel } from './CollapsibleHudPanel';
import { FlightModeToggle } from './FlightModeToggle';
import { FreeFlightHelp } from './FreeFlightHelp';
import { FreeFlightHint } from './FreeFlightHint';
import { LanguageToggle } from './LanguageToggle';
import { NavigationAccordion } from './NavigationAccordion';
import { PlanetPanel } from './PlanetPanel';
import { TimeScrubber } from './TimeScrubber';

export const HUD = () => {
  const { t, bodyName } = useTranslation();
  const activeBody = useStore((s) => s.activeBody);
  const viewMode = useStore((s) => s.viewMode);
  const showPlanetPanel = activeBody !== null && viewMode !== 'overview';
  const mobileBodyTitle =
    activeBody !== null ? bodyName(activeBody) : t.ui.bodyInfo;
  const mobileBodyColor = activeBody !== null ? getBodyColor(activeBody) : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-3 font-sans text-white sm:p-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="pointer-events-auto">
          <h1 className="text-base font-semibold tracking-tight sm:text-lg">
            {t.appTitle}
          </h1>
          <p className="hidden text-xs text-white/50 sm:block">{t.tagline}</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <FlightModeToggle />
          <LanguageToggle />
        </div>
      </header>

      {showPlanetPanel ? (
        <div className="sm:hidden">
          <CollapsibleHudPanel
            key={activeBody}
            title={mobileBodyTitle}
            collapsedTitlePrefix={
              mobileBodyColor ? (
                <span
                  className="h-3 w-3 shrink-0 rounded-full ring-1 ring-white/20"
                  style={{ backgroundColor: mobileBodyColor }}
                />
              ) : null
            }
            collapsedTitleClassName="truncate text-lg font-semibold tracking-tight text-white"
            className="relative w-full"
            defaultCollapsed
            collapseLabel={t.ui.minimizePanel}
            expandLabel={t.ui.expandPanel}
            collapsedIcon="help"
            collapseOnExpandedHeaderClick
          >
            <PlanetPanel />
          </CollapsibleHudPanel>
        </div>
      ) : null}

      <FreeFlightHint />

      <div className="flex flex-1 flex-col justify-end gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <NavigationAccordion />
        <div className="hidden w-full flex-col items-stretch gap-3 sm:flex sm:w-auto sm:items-end">
          {showPlanetPanel ? (
            <CollapsibleHudPanel
              title={t.ui.bodyInfo}
              className="relative w-full max-w-sm"
              collapseLabel={t.ui.minimizePanel}
              expandLabel={t.ui.expandPanel}
            >
              <PlanetPanel />
            </CollapsibleHudPanel>
          ) : null}
          <FreeFlightHelp />
        </div>
      </div>

      <footer className="pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <CollapsibleHudPanel
          title={t.ui.timeControls}
          className="relative"
          collapseLabel={t.ui.minimizePanel}
          expandLabel={t.ui.expandPanel}
        >
          <TimeScrubber />
        </CollapsibleHudPanel>
      </footer>
    </div>
  );
};
