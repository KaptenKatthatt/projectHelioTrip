import type { GameMode } from "../../../lib/missions/types";
import type { MobileHudSheetId } from "../../../lib/mobileHudSheetIds";
import { MobileBottomNav } from "../../MobileBottomNav";
import { MobileTimePill } from "../../molecules/MobileTimePill";

type HudMobileNavRegionProps = {
  readonly mobileLayout: boolean;
  readonly openNavSheet: MobileHudSheetId | null;
  readonly onToggleSheet: (id: MobileHudSheetId) => void;
  readonly gameMode: GameMode;
  readonly starsContextActive: boolean;
};

export const HudMobileNavRegion = ({
  mobileLayout,
  openNavSheet,
  onToggleSheet,
  gameMode,
  starsContextActive,
}: HudMobileNavRegionProps) => {
  if (!mobileLayout) return null;

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 px-3">
      <MobileTimePill />
      <div className="w-full">
        <MobileBottomNav
          openSheet={openNavSheet}
          onToggleSheet={onToggleSheet}
          gameMode={gameMode}
          starsContextActive={starsContextActive}
        />
      </div>
    </div>
  );
};
