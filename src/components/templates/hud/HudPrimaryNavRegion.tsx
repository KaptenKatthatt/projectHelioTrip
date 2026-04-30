import { CollapsibleHudPanel } from "../../molecules/CollapsibleHudPanel";
import { ConstellationStoryCard } from "../../molecules/ConstellationStoryCard";
import { FreeFlightHelp } from "../../FreeFlightHelp";
import { FreeFlightHint } from "../../FreeFlightHint";
import { FreeFlightMobileControls } from "../../FreeFlightMobileControls";
import { MissionCard } from "../../organisms/MissionCard";
import { NavigationAccordion } from "../../organisms/NavigationAccordion";
import { PlanetPanel } from "../../organisms/PlanetPanel";
import { ProgressPanel } from "../../organisms/ProgressPanel";

type HudPrimaryNavRegionProps = {
  readonly mobileLayout: boolean;
  readonly showPlanetInfoUi: boolean;
  readonly showMissionUi: boolean;
  readonly selectedConstellation: string | null;
  readonly mobileBodyTitle: string;
  readonly minimizePanelLabel: string;
  readonly expandPanelLabel: string;
  readonly progressTitle: string;
};

export const HudPrimaryNavRegion = ({
  mobileLayout,
  showPlanetInfoUi,
  showMissionUi,
  selectedConstellation,
  mobileBodyTitle,
  minimizePanelLabel,
  expandPanelLabel,
  progressTitle,
}: HudPrimaryNavRegionProps) => (
  <>
    <FreeFlightHint />

    <div
      className={
        mobileLayout
          ? "flex min-h-0 flex-1 flex-col justify-end gap-3"
          : "flex min-h-0 flex-1 flex-col justify-end gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
      }
    >
      <FreeFlightMobileControls />
      {!mobileLayout ? <NavigationAccordion /> : null}
      <div
        className={
          mobileLayout
            ? "hidden"
            : "flex max-h-full w-full flex-col items-stretch gap-3 overflow-y-auto pr-1 pb-1 sm:w-auto sm:items-end"
        }
      >
        {selectedConstellation !== null && !showPlanetInfoUi ? (
          <ConstellationStoryCard />
        ) : null}
        {showMissionUi && (showPlanetInfoUi || selectedConstellation === null) ? (
          <MissionCard className="w-full max-w-sm" />
        ) : null}
        {showPlanetInfoUi ? (
          <CollapsibleHudPanel
            title={mobileBodyTitle}
            className="relative w-full max-w-sm"
            collapseLabel={minimizePanelLabel}
            expandLabel={expandPanelLabel}
          >
            <PlanetPanel />
          </CollapsibleHudPanel>
        ) : null}
        {showPlanetInfoUi || selectedConstellation === null ? (
          <CollapsibleHudPanel
            title={progressTitle}
            className="relative w-full max-w-sm"
            defaultCollapsed={showMissionUi}
            collapseLabel={minimizePanelLabel}
            expandLabel={expandPanelLabel}
          >
            {({ expandedCloseToggle }) => (
              <ProgressPanel showTitle={false} visitedRowEnd={expandedCloseToggle} />
            )}
          </CollapsibleHudPanel>
        ) : null}
        <FreeFlightHelp />
        <div
          aria-hidden
          className="pointer-events-none sticky bottom-0 h-8 w-full max-w-sm bg-linear-to-t from-black/45 to-transparent"
        />
      </div>
    </div>
  </>
);
