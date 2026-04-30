import type { GameMode } from "../../../lib/missions/types";
import { LearningStreakBadge } from "../../atoms/LearningStreakBadge";
import { XpBadge } from "../../atoms/XpBadge";

type HudTopBarRegionProps = {
  readonly mobileLayout: boolean;
  readonly appTitle: string;
  readonly tagline: string;
  readonly gameMode: GameMode;
};

const MODE_ACCENT: Record<GameMode, string> = {
  explore: "bg-white/30",
  learn: "bg-cyan-300",
  challenge: "bg-emerald-300",
};

export const HudTopBarRegion = ({
  mobileLayout,
  appTitle,
  tagline,
  gameMode,
}: HudTopBarRegionProps) => {
  const accentClass = MODE_ACCENT[gameMode];
  const showXpBadge = gameMode === "learn" || gameMode === "challenge";

  return (
    <div className="flex flex-col gap-1.5">
      <header
        className={
          mobileLayout
            ? "flex items-center justify-between"
            : "flex items-start justify-between"
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
            {appTitle}
          </h1>
          <p className={mobileLayout ? "hidden" : "text-xs text-white/50"}>{tagline}</p>
        </div>

        {showXpBadge ? (
          <div className="flex items-center gap-2">
            <LearningStreakBadge />
            <XpBadge />
          </div>
        ) : null}
      </header>

      {accentClass && (
        <div
          className={[
            "h-1 w-full rounded-full opacity-90 transition-all duration-500",
            accentClass,
          ].join(" ")}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
