import { useEffect, useState } from "react";
import { useIsMobileLayout } from "../hooks/useIsMobileLayout";
import { useTranslation } from "../hooks/useTranslation";
import { getBodyColor } from "../lib/bodies";
import type { MobileHudSheetId } from "../lib/mobileHudSheetIds";
import { useStore } from "../store/useStore";
import { AboutDialog } from "./AboutDialog";
import { AchievementToast } from "./AchievementToast";
import { BottomSheet } from "./BottomSheet";
import { CollapsibleHudPanel } from "./CollapsibleHudPanel";
import { ConstellationList } from "./ConstellationList";
import { FlightModeToggle } from "./FlightModeToggle";
import { FreeFlightHelp } from "./FreeFlightHelp";
import { FreeFlightHint } from "./FreeFlightHint";
import { FreeFlightMobileControls } from "./FreeFlightMobileControls";
import { GameModeSwitcher } from "./GameModeSwitcher";
import { LanguageToggle } from "./LanguageToggle";
import { MissionCard } from "./MissionCard";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileTimePill } from "./MobileTimePill";
import { NavigationAccordion } from "./NavigationAccordion";
import { PlanetPanel } from "./PlanetPanel";
import { PlanetSelector } from "./PlanetSelector";
import { ProgressPanel } from "./ProgressPanel";
import { TimePlaybackControls } from "./TimePlaybackControls";

export const HUD = () => {
  const { t, bodyName } = useTranslation();
  const mobileLayout = useIsMobileLayout();
  const activeBody = useStore((s) => s.activeBody);
  const viewMode = useStore((s) => s.viewMode);
  const gameMode = useStore((s) => s.gameMode);
  const setGameMode = useStore((s) => s.setGameMode);
  const showPlanetPanel = activeBody !== null && viewMode !== "overview";
  const showMissionUi = gameMode !== "explore";
  const mobileBodyTitle =
    activeBody !== null ? bodyName(activeBody) : t.ui.bodyInfo;
  const mobileBodyColor = activeBody !== null ? getBodyColor(activeBody) : null;

  const [openNavSheet, setOpenNavSheet] = useState<MobileHudSheetId | null>(
    null,
  );
  const [planetSheetOpen, setPlanetSheetOpen] = useState(false);

  useEffect(() => {
    if (!mobileLayout) return;
    const id = window.requestAnimationFrame(() => {
      if (showPlanetPanel) {
        setPlanetSheetOpen(true);
        setOpenNavSheet(null);
      } else {
        setPlanetSheetOpen(false);
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [mobileLayout, showPlanetPanel, activeBody, viewMode]);

  const handleToggleNavSheet = (id: MobileHudSheetId): void => {
    const next = openNavSheet === id ? null : id;
    setOpenNavSheet(next);
    if (next !== null) {
      setPlanetSheetOpen(false);
    }
    if (next === "learn") {
      setGameMode("learn");
    } else if (next === "challenge") {
      setGameMode("challenge");
    } else if (next === "explore" || next === "stars") {
      setGameMode("explore");
    }
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
      <header
        className={
          mobileLayout
            ? "flex flex-col gap-3"
            : "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        }
      >
        <div className="pointer-events-auto">
          <h1
            className={
              mobileLayout
                ? "text-base font-semibold tracking-tight"
                : "text-base font-semibold tracking-tight sm:text-lg"
            }
          >
            {t.appTitle}
          </h1>
          <p className={mobileLayout ? "hidden" : "text-xs text-white/50"}>
            {t.tagline}
          </p>
        </div>
      </header>

      {!mobileLayout && showPlanetPanel ? (
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
            collapseLabel={t.ui.minimizePanel}
            expandLabel={t.ui.expandPanel}
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
          {showPlanetPanel ? (
            <CollapsibleHudPanel
              title={t.ui.bodyInfo}
              className="relative w-full max-w-sm"
              collapseLabel={t.ui.minimizePanel}
              expandLabel={t.ui.expandPanel}
            >
              <PlanetPanel />
            </CollapsibleHudPanel>
          ) : null}
          {showMissionUi ? <MissionCard className="w-full max-w-sm" /> : null}
          <CollapsibleHudPanel
            title={t.phase3.progressPanel.title}
            className="relative w-full max-w-sm"
            collapseLabel={t.ui.minimizePanel}
            expandLabel={t.ui.expandPanel}
          >
            {({ expandedCloseToggle }) => (
              <ProgressPanel
                showTitle={false}
                visitedRowEnd={expandedCloseToggle}
              />
            )}
          </CollapsibleHudPanel>
          <FreeFlightHelp />
        </div>
      </div>

      {!mobileLayout ? (
        <footer className="shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-center">
            <TimePlaybackControls
              className={
                "pointer-events-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-black/40 px-3 py-3 backdrop-blur-md sm:w-auto sm:px-4"
              }
            />
            <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 sm:w-auto">
              <GameModeSwitcher compact={false} />
              <FlightModeToggle />
              <AboutDialog />
            </div>
          </div>
        </footer>
      ) : null}

      {mobileLayout ? (
        <>
          <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 px-3">
            <MobileTimePill />
            <div className="w-full">
              <MobileBottomNav
                openSheet={openNavSheet}
                onToggleSheet={handleToggleNavSheet}
                gameMode={gameMode}
              />
            </div>
          </div>

          <BottomSheet
            open={openNavSheet === "explore"}
            onClose={closeNavSheets}
            title={t.ui.planets}
          >
            <div className="p-3">
              <PlanetSelector
                className="pointer-events-auto flex w-full flex-col gap-0.5 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md"
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
            open={planetSheetOpen && showPlanetPanel}
            onClose={() => setPlanetSheetOpen(false)}
            title={mobileBodyTitle}
            titleAccentColor={mobileBodyColor}
            panelClassName="max-h-[min(92dvh,40rem)]"
          >
            <div className="p-3 pt-0">
              <PlanetPanel omitHeading />
            </div>
          </BottomSheet>
        </>
      ) : null}

      <AchievementToast />
    </div>
  );
};
