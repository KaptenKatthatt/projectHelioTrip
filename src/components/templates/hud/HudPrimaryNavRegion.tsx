import { CollapsibleHudPanel } from "../../molecules/CollapsibleHudPanel";
import { ConstellationStoryCard } from "../../molecules/ConstellationStoryCard";
import { DailyChallengeCard } from "../../molecules/DailyChallengeCard";
import { NarrativeMessage } from "../../molecules/NarrativeMessage";
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
  readonly minimizePanelLabel: string;
  readonly expandPanelLabel: string;
  readonly progressTitle: string;
};

export const HudPrimaryNavRegion = ({
  mobileLayout,
  showPlanetInfoUi,
  showMissionUi,
  selectedConstellation,
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
      <div className={mobileLayout ? "hidden" : "relative sm:w-auto"}>
        <div
          className={
            mobileLayout
              ? "hidden"
              : "pointer-events-auto flex max-h-[calc(100dvh-8rem)] w-full flex-col items-stretch gap-3 overflow-y-auto pr-1 sm:w-auto sm:items-end"
          }
        >
          {selectedConstellation !== null && !showPlanetInfoUi ? (
            <ConstellationStoryCard />
          ) : null}
          {showPlanetInfoUi ? (
            <div className="pointer-events-auto max-h-[calc(100dvh-8rem)] overflow-y-auto custom-scrollbar rounded-2xl animate-slide-up">
              <PlanetPanel />
            </div>
          ) : null}
          {!showPlanetInfoUi && selectedConstellation === null ? (
            <CollapsibleHudPanel
              title={progressTitle}
              className="relative w-full max-w-sm"
              defaultCollapsed
              collapseLabel={minimizePanelLabel}
              expandLabel={expandPanelLabel}
            >
              {({ expandedCloseToggle }) => (
                <ProgressPanel showTitle={false} visitedRowEnd={expandedCloseToggle} />
              )}
            </CollapsibleHudPanel>
          ) : null}
          {showMissionUi && !showPlanetInfoUi && selectedConstellation === null ? (
            <MissionCard className="w-full max-w-sm" />
          ) : null}
          {showMissionUi && !showPlanetInfoUi && selectedConstellation === null ? (
            <DailyChallengeCard className="max-w-sm" />
          ) : null}
          {showMissionUi && !showPlanetInfoUi && selectedConstellation === null ? (
            <NarrativeMessage />
          ) : null}
          <FreeFlightHelp />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 rounded-b-2xl bg-linear-to-t from-black/30 to-transparent"
        />
      </div>
    </div>
  </>
);
