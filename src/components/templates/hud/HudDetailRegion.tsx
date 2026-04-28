import type { ReactNode } from "react";
import type { MobileHudSheetId } from "../../../lib/mobileHudSheetIds";
import type { Translation } from "../../../i18n/translations";
import { BottomSheet } from "../../BottomSheet";
import { ConstellationList } from "../../ConstellationList";
import { LanguageToggle } from "../../LanguageToggle";
import { MissionCard } from "../../MissionCard";
import { PlanetPanel } from "../../PlanetPanel";
import { PlanetSelector } from "../../PlanetSelector";
import { ProgressPanel } from "../../ProgressPanel";
import { AboutDialog } from "../../AboutDialog";
import { FlightModeToggle } from "../../FlightModeToggle";

type HudDetailRegionProps = {
  readonly mobileLayout: boolean;
  readonly openNavSheet: MobileHudSheetId | null;
  readonly closeNavSheets: () => void;
  readonly t: Translation;
  readonly planetSheetOpen: boolean;
  readonly showPlanetInfoUi: boolean;
  readonly mobileBodyTitle: string;
  readonly mobileBodyColor: string | null;
  readonly setMobilePlanetInfoSheetOpen: (open: boolean) => void;
  readonly mobileBottomNav: ReactNode;
};

export const HudDetailRegion = ({
  mobileLayout,
  openNavSheet,
  closeNavSheets,
  t,
  planetSheetOpen,
  showPlanetInfoUi,
  mobileBodyTitle,
  mobileBodyColor,
  setMobilePlanetInfoSheetOpen,
  mobileBottomNav,
}: HudDetailRegionProps) => {
  if (!mobileLayout) return null;

  return (
    <>
      {mobileBottomNav}

      <BottomSheet
        open={openNavSheet === "explore"}
        onClose={closeNavSheets}
        title={t.ui.planets}
      >
        <div className="p-3">
          <PlanetSelector
            className="pointer-events-auto ds-panel flex w-full flex-col gap-0.5 p-2"
            showHeading={false}
            largePlanetDots
            onSelect={() => {
              closeNavSheets();
            }}
          />
        </div>
      </BottomSheet>

      <BottomSheet
        open={openNavSheet === "stars"}
        onClose={closeNavSheets}
        title={t.ui.constellations}
      >
        <div className="p-3">
          <ConstellationList
            className="max-h-[min(24rem,50dvh)]"
            onPick={closeNavSheets}
          />
        </div>
      </BottomSheet>

      <BottomSheet
        open={openNavSheet === "learn"}
        onClose={closeNavSheets}
        title={t.phase3.gameMode.learn}
      >
        <div className="p-3">
          <MissionCard compact className="w-full" />
        </div>
      </BottomSheet>

      <BottomSheet
        open={openNavSheet === "challenge"}
        onClose={closeNavSheets}
        title={t.phase3.gameMode.challenge}
      >
        <div className="p-3">
          <ProgressPanel compact className="w-full" />
        </div>
      </BottomSheet>

      <BottomSheet
        open={openNavSheet === "more"}
        onClose={closeNavSheets}
        title={t.ui.bottomNavMore}
      >
        <div className="flex flex-col gap-3 p-4">
          <FlightModeToggle />
          <LanguageToggle />
          <AboutDialog />
        </div>
      </BottomSheet>

      <BottomSheet
        open={planetSheetOpen && showPlanetInfoUi}
        onClose={() => setMobilePlanetInfoSheetOpen(false)}
        title={mobileBodyTitle}
        titleAccentColor={mobileBodyColor}
        blurScrim={false}
        blurPanel={false}
        scrimBlocksPointerEvents={false}
        slideFromBottom
        panelClassName="max-h-[min(92dvh,40rem)]"
      >
        <div className="p-3 pt-0">
          <PlanetPanel omitHeading />
        </div>
      </BottomSheet>
    </>
  );
};
