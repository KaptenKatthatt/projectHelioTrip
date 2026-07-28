import { useCallback, useEffect, useState } from 'react';
import { useActiveBodyViewGameMode } from '../../../hooks/useActiveBodyViewGameMode';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';
import { useTranslation } from '../../../hooks/useTranslation';
import { getBodyColor } from '../../../lib/bodies';
import type { MobileHudSheetId } from '../../../lib/mobileHudSheetIds';
import { useStore } from '../../../store/useStore';

const SHEET_GAME_MODE: Partial<
  Record<MobileHudSheetId, 'explore' | 'learn' | 'challenge' | 'lab'>
> = {
  explore: 'explore',
  stars: 'explore',
  learn: 'learn',
  challenge: 'challenge',
  lab: 'lab',
};

export const useHudLogic = () => {
  const { t, bodyName } = useTranslation();
  const layoutTier = useResponsiveLayout();
  const mobileLayout = layoutTier === 'compact';
  const { activeBody, viewMode, gameMode } = useActiveBodyViewGameMode();
  const setGameMode = useStore((s) => s.setGameMode);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const isTraveling = useStore((s) => s.isTraveling);
  const isTravelAnimating = useStore((s) => s.isTravelAnimating);

  const showPlanetPanel = activeBody !== null && viewMode !== 'overview';
  const showPlanetInfoUi = showPlanetPanel && !isTraveling && !isTravelAnimating;
  const showMissionUi = gameMode !== 'explore' && gameMode !== 'lab';

  const mobileBodyTitle = activeBody !== null ? bodyName(activeBody) : t.ui.bodyInfo;
  const mobileBodyColor = activeBody !== null ? getBodyColor(activeBody) : null;

  const [openNavSheet, setOpenNavSheet] = useState<MobileHudSheetId | null>(null);
  const planetSheetOpen = useStore((s) => s.mobilePlanetInfoSheetOpen);
  const setMobilePlanetInfoSheetOpen = useStore((s) => s.setMobilePlanetInfoSheetOpen);
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
  }, [mobileLayout, showPlanetInfoUi, activeBody, viewMode, setMobilePlanetInfoSheetOpen]);

  /*
   * Stable identities, so the HUD regions below can be memoized at all. These
   * are passed down as props; recreated every render they would invalidate
   * any `React.memo` boundary they cross, which is the usual reason wrapping
   * a component in `memo` appears to do nothing. The zustand setters are
   * already stable, and `setOpenNavSheet` is a `useState` setter, so the only
   * real dependency here is the current sheet.
   */
  const handleToggleNavSheet = useCallback(
    (id: MobileHudSheetId): void => {
      const next = openNavSheet === id ? null : id;
      setOpenNavSheet(next);
      if (next === null) {
        return;
      }

      setMobilePlanetInfoSheetOpen(false);
      const nextGameMode = SHEET_GAME_MODE[next];
      if (!nextGameMode) return;
      setGameMode(nextGameMode);
    },
    [openNavSheet, setMobilePlanetInfoSheetOpen, setGameMode],
  );

  const closeNavSheets = useCallback((): void => {
    setOpenNavSheet(null);
  }, []);

  const handleResetToStart = useCallback((): void => {
    setOpenNavSheet(null);
    setMobilePlanetInfoSheetOpen(false);
    resetSolarSystemStart();
  }, [setMobilePlanetInfoSheetOpen, resetSolarSystemStart]);

  const handleBackToConstellationsMenu = useCallback((): void => {
    setSelectedConstellation(null);
    setMobilePlanetInfoSheetOpen(false);
    setOpenNavSheet('stars');
    setGameMode('explore');
  }, [setSelectedConstellation, setMobilePlanetInfoSheetOpen, setGameMode]);

  return {
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
  };
};
