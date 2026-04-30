import { useState, type ReactNode } from "react";
import type { MobileHudSheetId } from "../../../lib/mobileHudSheetIds";
import type { Translation } from "../../../i18n/translations";
import { BottomSheet } from "../../molecules/BottomSheet";
import { ConstellationStoryCard } from "../../molecules/ConstellationStoryCard";
import { LanguageToggle } from "../../molecules/LanguageToggle";
import { FlightModeToggle } from "../../molecules/FlightModeToggle";
import { AboutDialog } from "../../organisms/AboutDialog";
import { ConstellationList } from "../../organisms/ConstellationList";
import { MissionCard } from "../../organisms/MissionCard";
import { PlanetPanel } from "../../organisms/PlanetPanel";
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
  const [planetPanelForcedTab, setPlanetPanelForcedTab] = useState<
    "info" | "facts" | "compare" | null
  >(null);
  const [planetPanelRenderKey, setPlanetPanelRenderKey] = useState(0);
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
        <div className="p-3 space-y-3">
          <MissionCard compact className="w-full" />
          {showPlanetInfoUi ? (
            <button
              type="button"
              onClick={() => {
                setPlanetPanelForcedTab("facts");
                setPlanetPanelRenderKey((prev) => prev + 1);
                closeNavSheets();
                setMobilePlanetInfoSheetOpen(true);
              }}
              className="w-full rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
            >
              {t.learn.ui.openFactsCta}
            </button>
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
              {t.learn.ui.selectPlanetForFacts}
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
          <PlanetPanel
            key={planetPanelRenderKey}
            omitHeading
            initialTab={planetPanelForcedTab ?? "info"}
          />
        </div>
      </BottomSheet>
    </>
  );
};
