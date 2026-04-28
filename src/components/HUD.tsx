import { useEffect, useState } from "react";
import { useIsMobileLayout } from "../hooks/useIsMobileLayout";
import { useTranslation } from "../hooks/useTranslation";
import { getBodyColor } from "../lib/bodies";
import type { MobileHudSheetId } from "../lib/mobileHudSheetIds";
import { useStore } from "../store/useStore";
import { HudControlRailRegion } from "./templates/hud/HudControlRailRegion";
import { HudDetailRegion } from "./templates/hud/HudDetailRegion";
import { HudMobileNavRegion } from "./templates/hud/HudMobileNavRegion";
import { HudOverlayRegion } from "./templates/hud/HudOverlayRegion";
import { HudPrimaryNavRegion } from "./templates/hud/HudPrimaryNavRegion";
import { HudTopBarRegion } from "./templates/hud/HudTopBarRegion";

const SHEET_GAME_MODE: Partial<Record<MobileHudSheetId, "explore" | "learn" | "challenge">> = {
  explore: "explore",
  stars: "explore",
  learn: "learn",
  challenge: "challenge",
};

export const HUD = () => {
  const { t, bodyName } = useTranslation();
  const mobileLayout = useIsMobileLayout();
  const activeBody = useStore((s) => s.activeBody);
  const viewMode = useStore((s) => s.viewMode);
  const gameMode = useStore((s) => s.gameMode);
  const setGameMode = useStore((s) => s.setGameMode);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const isTraveling = useStore((s) => s.isTraveling);
  const showPlanetPanel = activeBody !== null && viewMode !== "overview";
  const showPlanetInfoUi = showPlanetPanel && !isTraveling;
  const showMissionUi = gameMode !== "explore";
  const mobileBodyTitle =
    activeBody !== null ? bodyName(activeBody) : t.ui.bodyInfo;
  const mobileBodyColor = activeBody !== null ? getBodyColor(activeBody) : null;

  const [openNavSheet, setOpenNavSheet] = useState<MobileHudSheetId | null>(
    null,
  );
  const planetSheetOpen = useStore((s) => s.mobilePlanetInfoSheetOpen);
  const setMobilePlanetInfoSheetOpen = useStore(
    (s) => s.setMobilePlanetInfoSheetOpen,
  );

  useEffect(() => {
    if (!mobileLayout) {
      setMobilePlanetInfoSheetOpen(false);
      return;
    }
    const id = window.requestAnimationFrame(() => {
      if (showPlanetInfoUi) {
        setMobilePlanetInfoSheetOpen(true);
        setOpenNavSheet(null);
      } else {
        setMobilePlanetInfoSheetOpen(false);
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [
    mobileLayout,
    showPlanetInfoUi,
    activeBody,
    viewMode,
    setMobilePlanetInfoSheetOpen,
  ]);

  const handleToggleNavSheet = (id: MobileHudSheetId): void => {
    const next = openNavSheet === id ? null : id;
    setOpenNavSheet(next);
    if (next === null) return;

    setMobilePlanetInfoSheetOpen(false);
    const nextGameMode = SHEET_GAME_MODE[next];
    if (!nextGameMode) return;
    setGameMode(nextGameMode);
  };

  const closeNavSheets = (): void => {
    setOpenNavSheet(null);
  };

  return (
    <div
      className={
        "pointer-events-none fixed inset-0 z-10 flex flex-col justify-between font-sans text-white " +
        (mobileLayout
          ? "p-3 pb-[calc(7rem+env(safe-area-inset-bottom))]"
          : "p-3 sm:p-5")
      }
    >
      <HudTopBarRegion
        mobileLayout={mobileLayout}
        appTitle={t.appTitle}
        tagline={t.tagline}
      />
      <HudPrimaryNavRegion
        mobileLayout={mobileLayout}
        showPlanetInfoUi={showPlanetInfoUi}
        showMissionUi={showMissionUi}
        activeBody={activeBody}
        mobileBodyTitle={mobileBodyTitle}
        mobileBodyColor={mobileBodyColor}
        minimizePanelLabel={t.ui.minimizePanel}
        expandPanelLabel={t.ui.expandPanel}
        progressTitle={t.phase3.progressPanel.title}
      />
      <HudControlRailRegion
        show={!mobileLayout}
        selectedConstellation={selectedConstellation}
      />
      <HudDetailRegion
        mobileLayout={mobileLayout}
        openNavSheet={openNavSheet}
        closeNavSheets={closeNavSheets}
        t={t}
        planetSheetOpen={planetSheetOpen}
        showPlanetInfoUi={showPlanetInfoUi}
        mobileBodyTitle={mobileBodyTitle}
        mobileBodyColor={mobileBodyColor}
        setMobilePlanetInfoSheetOpen={setMobilePlanetInfoSheetOpen}
        mobileBottomNav={
          <HudMobileNavRegion
            mobileLayout={mobileLayout}
            openNavSheet={openNavSheet}
            onToggleSheet={handleToggleNavSheet}
            gameMode={gameMode}
            starsContextActive={
              gameMode === "explore" && selectedConstellation !== null
            }
          />
        }
      />
      <HudOverlayRegion />
    </div>
  );
};
