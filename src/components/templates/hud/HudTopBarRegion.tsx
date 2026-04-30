import type { GameMode } from "../../../lib/missions/types";
import { XpBadge } from "../../atoms/XpBadge";

type HudTopBarRegionProps = {
  readonly mobileLayout: boolean;
  readonly appTitle: string;
  readonly tagline: string;
  readonly gameMode: GameMode;
};

const MODE_ACCENT: Record<GameMode, string> = {
  explore: "",
  learn: "bg-cyan-400",
  challenge: "bg-emerald-400",
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

        {showXpBadge && <XpBadge />}
      </header>

      {accentClass && (
        <div
          className={[
            "h-0.5 w-full rounded-full opacity-70 transition-all duration-500",
            accentClass,
          ].join(" ")}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
