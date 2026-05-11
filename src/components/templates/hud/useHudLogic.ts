import { useEffect, useState } from 'react';
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

  const handleToggleNavSheet = (id: MobileHudSheetId): void => {
    const next = openNavSheet === id ? null : id;
    setOpenNavSheet(next);
    if (next === null) {
      return;
    }

    setMobilePlanetInfoSheetOpen(false);
    const nextGameMode = SHEET_GAME_MODE[next];
    if (!nextGameMode) return;
    setGameMode(nextGameMode);
  };

  const closeNavSheets = (): void => {
    setOpenNavSheet(null);
  };

  const handleResetToStart = (): void => {
    closeNavSheets();
    setMobilePlanetInfoSheetOpen(false);
    resetSolarSystemStart();
  };

  const handleBackToConstellationsMenu = (): void => {
    setSelectedConstellation(null);
    setMobilePlanetInfoSheetOpen(false);
    setOpenNavSheet('stars');
    setGameMode('explore');
  };

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
