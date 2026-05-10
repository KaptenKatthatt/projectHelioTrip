import { HudControlRailRegion } from './hud/HudControlRailRegion';
import { HudDetailRegion } from './hud/HudDetailRegion';
import { HudMobileNavRegion } from './hud/HudMobileNavRegion';
import { HudOverlayRegion } from './hud/HudOverlayRegion';
import { HudPrimaryNavRegion } from './hud/HudPrimaryNavRegion';
import { HudTopBarRegion } from './hud/HudTopBarRegion';
import { MobileContextStrip } from '../molecules/MobileContextStrip';
import { CameraTool } from '../molecules/CameraTool';
import { LabOverlay } from '../organisms/LabOverlay';
import { MarsSurface } from '../organisms/MarsSurface';
import { MoonSurface } from '../organisms/MoonSurface';
import { useHudLogic } from './hud/useHudLogic';

type HudFrame = 'viewport' | 'stage';

type HUDProps = {
  /** `stage`: position relative to the letterboxed portrait stage; `viewport`: fixed to the window. */
  readonly hudFrame?: HudFrame;
};

export const HUD = ({ hudFrame = 'viewport' }: HUDProps) => {
  const {
    t,
    layoutTier,
    mobileLayout,
    gameMode,
    selectedConstellation,
    showPlanetInfoUi,
    showMissionUi,
    mobileBodyTitle,
    mobileBodyColor,
    openNavSheet,
    planetSheetOpen,
    setMobilePlanetInfoSheetOpen,
    handleToggleNavSheet,
    closeNavSheets,
    handleResetToStart,
    handleBackToConstellationsMenu,
  } = useHudLogic();

  return (
    <div
      className={
        'pointer-events-none z-10 flex flex-col justify-between font-sans text-white ' +
        (hudFrame === 'stage' ? 'absolute inset-0 ' : 'fixed inset-0 ') +
        (mobileLayout
          ? 'p-3 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))]'
          : layoutTier === 'expanded'
            ? 'p-5'
            : 'p-3 sm:p-5')
      }
    >
      {mobileLayout && (
        <MobileContextStrip
          onOpenChallengeSheet={() => handleToggleNavSheet('challenge')}
          onOpenConstellationsSheet={() => handleToggleNavSheet('stars')}
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
        selectedConstellation={selectedConstellation}
        minimizePanelLabel={t.ui.minimizePanel}
        expandPanelLabel={t.ui.expandPanel}
        progressTitle={t.phase3.progressPanel.title}
      />
      <HudControlRailRegion
        show={!mobileLayout}
        selectedConstellation={selectedConstellation}
        gameMode={gameMode}
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
            starsContextActive={gameMode === 'explore' && selectedConstellation !== null}
          />
        }
      />
      <HudOverlayRegion />
      {mobileLayout && gameMode !== 'lab' && <CameraTool className="fixed bottom-32 left-4 z-10" />}
      {gameMode === 'lab' ? <LabOverlay /> : null}
      <MarsSurface />
      <MoonSurface />
    </div>
  );
};
