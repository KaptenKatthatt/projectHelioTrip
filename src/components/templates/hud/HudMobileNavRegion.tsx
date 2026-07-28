import { memo } from 'react';
import type { GameMode } from "../../../lib/missions/types";
import type { MobileHudSheetId } from "../../../lib/mobileHudSheetIds";
import { useStore } from "../../../store/useStore";
import { MobileBottomNav } from "../../MobileBottomNav";
import { MobileTimePill } from "../../molecules/MobileTimePill";

type HudMobileNavRegionProps = {
  readonly mobileLayout: boolean;
  readonly openNavSheet: MobileHudSheetId | null;
  readonly onToggleSheet: (id: MobileHudSheetId) => void;
  readonly gameMode: GameMode;
  readonly starsContextActive: boolean;
};

export const HudMobileNavRegion = memo(({
  mobileLayout,
  openNavSheet,
  onToggleSheet,
  gameMode,
  starsContextActive,
}: HudMobileNavRegionProps) => {
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  /** Time pill is hidden when a constellation is focused — avoid flex gap above an empty row. */
  const bottomChromeGapClass = selectedConstellation !== null ? "gap-0" : "gap-2";

  if (!mobileLayout) return null;

  return (
    <div
      className={
        "pointer-events-auto fixed inset-x-0 bottom-0 z-20 flex w-full flex-col items-stretch " +
        bottomChromeGapClass
      }
    >
      <div className="flex justify-center px-3">
        <MobileTimePill />
      </div>
      <MobileBottomNav
        openSheet={openNavSheet}
        onToggleSheet={onToggleSheet}
        gameMode={gameMode}
        starsContextActive={starsContextActive}
      />
    </div>
  );
});

HudMobileNavRegion.displayName = "HudMobileNavRegion";
