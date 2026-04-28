import { AboutDialog } from "../../AboutDialog";
import { ConstellationViewControls } from "../../ConstellationViewControls";
import { FlightModeToggle } from "../../FlightModeToggle";
import { GameModeSwitcher } from "../../GameModeSwitcher";
import { TimePlaybackControls } from "../../TimePlaybackControls";

type HudControlRailRegionProps = {
  readonly show: boolean;
  readonly selectedConstellation: string | null;
};

export const HudControlRailRegion = ({
  show,
  selectedConstellation,
}: HudControlRailRegionProps) => {
  if (!show) return null;

  return (
    <footer className="shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-center">
        <TimePlaybackControls
          className={
            "pointer-events-auto ds-panel-control w-full max-w-3xl sm:w-auto"
          }
        />
        <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 sm:w-auto">
          {selectedConstellation !== null ? <ConstellationViewControls /> : null}
          <GameModeSwitcher compact={false} />
          <FlightModeToggle />
          <AboutDialog />
        </div>
      </div>
    </footer>
  );
};
