import { useState } from "react";
import type { ReactNode } from "react";
import type { MobileHudSheetId } from "../../../lib/mobileHudSheetIds";
import type { Translation } from "../../../i18n/translations";
import { BottomSheet } from "../../molecules/BottomSheet";
import { ConstellationStoryCard } from "../../molecules/ConstellationStoryCard";
import { LanguageToggle } from "../../molecules/LanguageToggle";
import { FlightModeToggle } from "../../molecules/FlightModeToggle";
import { AboutDialog } from "../../organisms/AboutDialog";
import { ConstellationList } from "../../organisms/ConstellationList";
import { MissionCard } from "../../organisms/MissionCard";
import { PlanetPanel, type PanelTab } from "../../organisms/PlanetPanel";
import { PlanetSelector } from "../../organisms/PlanetSelector";
import { ProgressPanel } from "../../organisms/ProgressPanel";
import { useStore } from "../../../store/useStore";

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
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const [planetSheetInitialTab, setPlanetSheetInitialTab] = useState<PanelTab>("info");

  if (!mobileLayout) return null;

  const handleOpenFactsSheet = (): void => {
    setPlanetSheetInitialTab("facts");
    closeNavSheets();
    setMobilePlanetInfoSheetOpen(true);
  };

  const handleClosePlanetSheet = (): void => {
    setMobilePlanetInfoSheetOpen(false);
    setPlanetSheetInitialTab("info");
  };

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
        <div className="p-3 flex flex-col gap-3">
          <ConstellationList
            className="max-h-[min(20rem,40dvh)]"
            onPick={() => {}}
          />
          {selectedConstellation && <ConstellationStoryCard />}
        </div>
      </BottomSheet>

      <BottomSheet
        open={openNavSheet === "learn"}
        onClose={closeNavSheets}
        title={t.phase3.gameMode.learn}
      >
        <div className="flex flex-col gap-3 p-3">
          <MissionCard compact className="w-full" />
          {showPlanetInfoUi ? (
            <button
              type="button"
              className="pointer-events-auto w-full rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-left text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
              onClick={handleOpenFactsSheet}
            >
              {t.learn.ui.viewFactsForBody.replace("{body}", mobileBodyTitle)}
            </button>
          ) : (
            <p className="text-xs text-white/40">
              {t.learn.ui.selectBodyForFacts}
            </p>
          )}
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
        onClose={handleClosePlanetSheet}
        title={mobileBodyTitle}
        titleAccentColor={mobileBodyColor}
        blurScrim={false}
        blurPanel={false}
        scrimBlocksPointerEvents={false}
        slideFromBottom
        panelClassName="max-h-[min(92dvh,40rem)]"
      >
        <div className="p-3 pt-0">
          <PlanetPanel omitHeading defaultTab={planetSheetInitialTab} />
        </div>
      </BottomSheet>
    </>
  );
};
