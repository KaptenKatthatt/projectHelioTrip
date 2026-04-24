import { useIsMobileLayout } from '../hooks/useIsMobileLayout';
import { useTranslation } from '../hooks/useTranslation';
import { getBodyColor } from '../lib/bodies';
import { useStore } from '../store/useStore';
import { CollapsibleHudPanel } from './CollapsibleHudPanel';
import { FlightModeToggle } from './FlightModeToggle';
import { FreeFlightHelp } from './FreeFlightHelp';
import { FreeFlightHint } from './FreeFlightHint';
import { FreeFlightMobileControls } from './FreeFlightMobileControls';
import { LanguageToggle } from './LanguageToggle';
import { NavigationAccordion } from './NavigationAccordion';
import { PlanetPanel } from './PlanetPanel';
import { TimeScrubber } from './TimeScrubber';

export const HUD = () => {
  const { t, bodyName } = useTranslation();
  const mobileLayout = useIsMobileLayout();
  const activeBody = useStore((s) => s.activeBody);
  const viewMode = useStore((s) => s.viewMode);
  const showPlanetPanel = activeBody !== null && viewMode !== 'overview';
  const mobileBodyTitle =
    activeBody !== null ? bodyName(activeBody) : t.ui.bodyInfo;
  const mobileBodyColor = activeBody !== null ? getBodyColor(activeBody) : null;

  return (
    <div
      className={
        'pointer-events-none fixed inset-0 z-10 flex flex-col justify-between font-sans text-white ' +
        (mobileLayout ? 'p-3' : 'p-3 sm:p-5')
      }
    >
      <header
        className={
          mobileLayout
            ? 'flex flex-col gap-3'
            : 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'
        }
      >
        <div className="pointer-events-auto">
          <h1
            className={
              mobileLayout
                ? 'text-base font-semibold tracking-tight'
                : 'text-base font-semibold tracking-tight sm:text-lg'
            }
          >
            {t.appTitle}
          </h1>
          <p
            className={
              mobileLayout ? 'hidden' : 'text-xs text-white/50'
            }
          >
            {t.tagline}
          </p>
        </div>
      </header>

      {showPlanetPanel ? (
        <div className={mobileLayout ? '' : 'hidden'}>
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

      <div
        className={
          mobileLayout
            ? 'flex flex-1 flex-col justify-end gap-3'
            : 'flex flex-1 flex-col justify-end gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6'
        }
      >
        <FreeFlightMobileControls />
        <NavigationAccordion />
        <div
          className={
            mobileLayout
              ? 'hidden'
              : 'flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-end'
          }
        >
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
        <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-center">
          <TimeScrubber
            className={
              'pointer-events-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-black/40 px-3 py-3 backdrop-blur-md ' +
              (mobileLayout ? '' : 'sm:w-auto sm:px-4')
            }
          />
          <div className="pointer-events-auto flex items-center gap-2">
            <FlightModeToggle />
            <LanguageToggle />
          </div>
        </div>
      </footer>
    </div>
  );
};
