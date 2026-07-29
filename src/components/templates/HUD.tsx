import { Suspense, useEffect, useMemo } from 'react';
import { HudControlRailRegion } from './hud/HudControlRailRegion';
import { HudDetailRegion } from './hud/HudDetailRegion';
import { HudMobileNavRegion } from './hud/HudMobileNavRegion';
import { HudOverlayRegion } from './hud/HudOverlayRegion';
import { HudPrimaryNavRegion } from './hud/HudPrimaryNavRegion';
import { HudTopBarRegion } from './hud/HudTopBarRegion';
import { MobileContextStrip } from '../molecules/MobileContextStrip';
import { CameraTool } from '../molecules/CameraTool';
import { QualityNoticeToast } from '../molecules/QualityNoticeToast';
import { LabOverlay } from '../organisms/LabOverlay';
import { useHudLogic } from './hud/useHudLogic';
import { useStore } from '../../store/useStore';
import { lazyWithRecovery } from '../../lib/lazyImport';
import {
  MARS_SURFACE_BG_CLASS,
  MOON_SURFACE_BG_CLASS,
} from '../organisms/surfaceBackgrounds';

// Lazy so the landing scenes (three.js terrain, GLB models) stay out of the
// eager bundle; they are only reachable after landing on Mars or the Moon.
const MarsSurface = lazyWithRecovery('mars-surface', () =>
  import('../organisms/MarsSurface').then((m) => ({ default: m.MarsSurface })),
);
const MoonSurface = lazyWithRecovery('moon-surface', () =>
  import('../organisms/MoonSurface').then((m) => ({ default: m.MoonSurface })),
);

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

  const isLanded = useStore((s) => s.isLanded);
  const isLandedOnMoon = useStore((s) => s.isLandedOnMoon);
  const navigationMode = useStore((s) => s.navigationMode);

  /**
   * Free flight puts a virtual joystick in the bottom-left corner on mobile.
   * Its base sits directly on the HUD's 7rem bottom padding and is 118px tall,
   * so the camera buttons have to clear ~14.4rem to stop overlapping it.
   */
  const cameraToolPosition =
    navigationMode === 'free'
      ? 'fixed bottom-[calc(15.5rem+env(safe-area-inset-bottom))] left-4 z-10'
      : 'fixed bottom-32 left-4 z-10';

  /**
   * Held stable so `HudDetailRegion`'s memo boundary survives. An element
   * built inline in the prop list is a new object on every render of `HUD`,
   * which is enough on its own to re-render the largest region in the tree
   * whether or not anything it displays actually changed.
   */
  const mobileBottomNav = useMemo(
    () => (
      <HudMobileNavRegion
        mobileLayout={mobileLayout}
        openNavSheet={openNavSheet}
        onToggleSheet={handleToggleNavSheet}
        gameMode={gameMode}
        starsContextActive={gameMode === 'explore' && selectedConstellation !== null}
      />
    ),
    [mobileLayout, openNavSheet, handleToggleNavSheet, gameMode, selectedConstellation],
  );

  // Prefetch the surface chunks in idle time so they are already cached when
  // a landing starts. The Moon landing flips isLandedOnMoon only 1500ms after
  // the transition begins — too short a window to fetch the chunk on a cold
  // cache, so warming at transition start is not enough.
  useEffect(() => {
    const warm = () => {
      void import('../organisms/MarsSurface');
      void import('../organisms/MoonSurface');
    };
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(warm, { timeout: 10000 });
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(warm, 3000);
    return () => clearTimeout(timer);
  }, []);

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
        mobileBottomNav={mobileBottomNav}
      />
      <HudOverlayRegion />
      {mobileLayout && gameMode !== 'lab' && <CameraTool className={cameraToolPosition} />}
      <QualityNoticeToast />
      {gameMode === 'lab' ? <LabOverlay /> : null}
      {isLanded && (
        <Suspense
          fallback={
            <div
              className={`pointer-events-auto fixed inset-0 z-200 ${MARS_SURFACE_BG_CLASS}`}
            />
          }
        >
          <MarsSurface />
        </Suspense>
      )}
      {isLandedOnMoon && (
        <Suspense
          fallback={
            <div
              className={`pointer-events-auto fixed inset-0 z-200 ${MOON_SURFACE_BG_CLASS}`}
            />
          }
        >
          <MoonSurface />
        </Suspense>
      )}
    </div>
  );
};
