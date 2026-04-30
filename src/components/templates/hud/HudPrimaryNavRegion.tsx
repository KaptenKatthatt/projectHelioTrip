import { CollapsibleHudPanel } from "../../molecules/CollapsibleHudPanel";
import { CommunityPulseBadge } from "../../atoms/CommunityPulseBadge";
import { SpaceWeatherBadge } from "../../atoms/SpaceWeatherBadge";
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
  readonly activeBody: string | null;
  readonly selectedConstellation: string | null;
  readonly mobileBodyTitle: string;
  readonly mobileBodyColor: string | null;
  readonly minimizePanelLabel: string;
  readonly expandPanelLabel: string;
  readonly progressTitle: string;
};

export const HudPrimaryNavRegion = ({
  mobileLayout,
  showPlanetInfoUi,
  showMissionUi,
  activeBody,
  selectedConstellation,
  mobileBodyTitle,
  mobileBodyColor,
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
              className="relative w-full max-w-sm"
              defaultCollapsed
              collapseLabel={minimizePanelLabel}
              expandLabel={expandPanelLabel}
              collapseOnExpandedHeaderClick
            >
              <PlanetPanel />
            </CollapsibleHudPanel>
          ) : null}
          {showPlanetInfoUi || selectedConstellation === null ? (
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
          {showMissionUi && (showPlanetInfoUi || selectedConstellation === null) ? (
            <MissionCard className="w-full max-w-sm" />
          ) : null}
          {showMissionUi && selectedConstellation === null ? (
            <DailyChallengeCard className="max-w-sm" />
          ) : null}
          {showMissionUi && selectedConstellation === null ? <SpaceWeatherBadge /> : null}
          {showMissionUi && selectedConstellation === null ? <CommunityPulseBadge /> : null}
          {showMissionUi && selectedConstellation === null ? (
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
