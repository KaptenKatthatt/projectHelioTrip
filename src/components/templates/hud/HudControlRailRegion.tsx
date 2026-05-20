import type { GameMode } from '../../../lib/missions/types';
import { AboutDialog } from '../../organisms/AboutDialog';
import { ConstellationViewControls } from '../../ConstellationViewControls';
import { FlightModeToggle } from '../../molecules/FlightModeToggle';
import { GameModeSwitcher } from '../../molecules/GameModeSwitcher';
import { TimePlaybackControls } from '../../organisms/TimePlaybackControls';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';

type HudControlRailRegionProps = {
  readonly show: boolean;
  readonly selectedConstellation: string | null;
  readonly gameMode: GameMode;
};

export const HudControlRailRegion = ({
  show,
  selectedConstellation,
  gameMode,
}: HudControlRailRegionProps) => {
  const layoutTier = useResponsiveLayout();
  const isTablet = layoutTier === 'medium';

  if (!show) return null;

  if (isTablet) {
    return (
      <footer className="shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] w-full flex justify-center">
        <div className="pointer-events-auto flex flex-row items-center gap-3 bg-space-dark-900/90 border border-white/10 px-4 py-2.5 rounded-full backdrop-blur-md max-w-full shadow-lg">
          {selectedConstellation === null ? (
            <>
              <TimePlaybackControls
                className="flex items-center bg-transparent border-none p-0 backdrop-blur-none flex-initial"
                hideSpeedUnitOnPresets={true}
              />
              <div className="h-6 w-px bg-white/10 shrink-0" />
            </>
          ) : null}
          <div className="flex items-center gap-2">
            {selectedConstellation !== null ? <ConstellationViewControls /> : null}
            <GameModeSwitcher compact={true} className="!bg-transparent !border-none !p-0 !backdrop-blur-none" />
            {gameMode !== 'lab' ? <FlightModeToggle /> : null}
            <AboutDialog />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-center">
        {selectedConstellation === null ? (
          <TimePlaybackControls
            className={'ds-panel-control pointer-events-auto w-full max-w-3xl sm:w-auto'}
          />
        ) : null}
        <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 sm:w-auto">
          {selectedConstellation !== null ? <ConstellationViewControls /> : null}
          <GameModeSwitcher compact={false} />
          {gameMode !== 'lab' ? <FlightModeToggle /> : null}
          <AboutDialog />
        </div>
      </div>
    </footer>
  );
};
