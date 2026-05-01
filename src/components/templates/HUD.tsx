import { useEffect, useState } from "react";
import { useActiveBodyViewGameMode } from "../../hooks/useActiveBodyViewGameMode";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useTranslation } from "../../hooks/useTranslation";
import { getBodyColor } from "../../lib/bodies";
import type { MobileHudSheetId } from "../../lib/mobileHudSheetIds";
import { useStore } from "../../store/useStore";
import { HudControlRailRegion } from "./hud/HudControlRailRegion";
import { HudDetailRegion } from "./hud/HudDetailRegion";
import { HudMobileNavRegion } from "./hud/HudMobileNavRegion";
import { HudOverlayRegion } from "./hud/HudOverlayRegion";
import { HudPrimaryNavRegion } from "./hud/HudPrimaryNavRegion";
import { HudTopBarRegion } from "./hud/HudTopBarRegion";
import { MobileContextStrip } from "../molecules/MobileContextStrip";

const SHEET_GAME_MODE: Partial<Record<MobileHudSheetId, "explore" | "learn" | "challenge">> = {
  explore: "explore",
  stars: "explore",
  learn: "learn",
  challenge: "challenge",
};

export const HUD = () => {
  const { t, bodyName } = useTranslation();
  const layoutTier = useResponsiveLayout();
  const mobileLayout = layoutTier === "compact";
  const { activeBody, viewMode, gameMode } = useActiveBodyViewGameMode();
  const setGameMode = useStore((s) => s.setGameMode);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const isTraveling = useStore((s) => s.isTraveling);
  const isTravelAnimating = useStore((s) => s.isTravelAnimating);
  const showPlanetPanel = activeBody !== null && viewMode !== "overview";
  const showPlanetInfoUi =
    showPlanetPanel && !isTraveling && !isTravelAnimating;
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
  const resetSolarSystemStart = useStore((s) => s.resetSolarSystemStart);
  const setSelectedConstellation = useStore((s) => s.setSelectedConstellation);

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
    if (next === null) {
      setGameMode("explore");
      return;
    }

    setMobilePlanetInfoSheetOpen(false);
    const nextGameMode = SHEET_GAME_MODE[next];
    if (!nextGameMode) return;
    setGameMode(nextGameMode);
  };

  const closeNavSheets = (): void => {
    setOpenNavSheet(null);
    setGameMode("explore");
  };

  const handleResetToStart = (): void => {
    closeNavSheets();
    setMobilePlanetInfoSheetOpen(false);
    resetSolarSystemStart();
  };

  const handleBackToConstellationsMenu = (): void => {
    setSelectedConstellation(null);
    setMobilePlanetInfoSheetOpen(false);
    setOpenNavSheet("stars");
    setGameMode("explore");
  };

  return (
    <div
      className={
        "pointer-events-none fixed inset-0 z-10 flex flex-col justify-between font-sans text-white " +
        (mobileLayout
          ? "p-3 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))]"
          : layoutTier === "expanded"
            ? "p-5"
            : "p-3 sm:p-5")
      }
    >
      {mobileLayout && (
        <MobileContextStrip
          onOpenChallengeSheet={() => handleToggleNavSheet("challenge")}
          onOpenConstellationsSheet={() => handleToggleNavSheet("stars")}
          onBackFromPlanet={handleResetToStart}
          onResetToStart={handleResetToStart}
        />
      )}
      <HudTopBarRegion
        mobileLayout={mobileLayout}
        appTitle={t.appTitle}
        tagline={t.tagline}
        gameMode={gameMode}
      />
      <HudPrimaryNavRegion
        mobileLayout={mobileLayout}
        showPlanetInfoUi={showPlanetInfoUi}
        showMissionUi={showMissionUi}
        activeBody={activeBody}
        selectedConstellation={selectedConstellation}
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
        onBackToConstellationsMenu={handleBackToConstellationsMenu}
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
