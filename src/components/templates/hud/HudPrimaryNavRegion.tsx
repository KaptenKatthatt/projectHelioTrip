import { CollapsibleHudPanel } from "../../CollapsibleHudPanel";
import { FreeFlightHelp } from "../../FreeFlightHelp";
import { FreeFlightHint } from "../../FreeFlightHint";
import { FreeFlightMobileControls } from "../../FreeFlightMobileControls";
import { MissionCard } from "../../MissionCard";
import { NavigationAccordion } from "../../NavigationAccordion";
import { PlanetPanel } from "../../PlanetPanel";
import { ProgressPanel } from "../../ProgressPanel";

type HudPrimaryNavRegionProps = {
  readonly mobileLayout: boolean;
  readonly showPlanetInfoUi: boolean;
  readonly showMissionUi: boolean;
  readonly activeBody: string | null;
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
  mobileBodyTitle,
  mobileBodyColor,
  minimizePanelLabel,
  expandPanelLabel,
  progressTitle,
}: HudPrimaryNavRegionProps) => (
  <>
    {!mobileLayout && showPlanetInfoUi ? (
      <div>
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
          collapseLabel={minimizePanelLabel}
          expandLabel={expandPanelLabel}
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
            : "flex max-h-full w-full flex-col items-stretch gap-3 overflow-y-auto pr-1 sm:w-auto sm:items-end"
        }
      >
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
        {showMissionUi ? <MissionCard className="w-full max-w-sm" /> : null}
        <CollapsibleHudPanel
          title={progressTitle}
          className="relative w-full max-w-sm"
          collapseLabel={minimizePanelLabel}
          expandLabel={expandPanelLabel}
        >
          {({ expandedCloseToggle }) => (
            <ProgressPanel showTitle={false} visitedRowEnd={expandedCloseToggle} />
          )}
        </CollapsibleHudPanel>
        <FreeFlightHelp />
      </div>
    </div>
  </>
);
