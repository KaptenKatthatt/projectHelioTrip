import { memo } from 'react';
import { Flame } from "lucide-react";
import type { GameMode } from "../../../lib/missions/types";
import { useTranslation } from "../../../hooks/useTranslation";
import { useStore } from "../../../store/useStore";
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
  lab: "bg-indigo-400",
};

export const HudTopBarRegion = memo(({
  mobileLayout,
  appTitle,
  tagline,
  gameMode,
}: HudTopBarRegionProps) => {
  const { t } = useTranslation();
  const quizStreakDays = useStore((s) => s.quizStreakDays);
  if (mobileLayout) return null;
  const accentClass = MODE_ACCENT[gameMode];
  const showXpBadge = gameMode === "learn" || gameMode === "challenge";

  return (
    <div className="flex flex-col gap-1.5">
      <header className="flex items-start justify-between">
        <div className="pointer-events-auto">
          <h1 className="text-base font-semibold tracking-tight sm:text-lg">
            {appTitle}
          </h1>
          <p className="text-xs text-white/50">{tagline}</p>
        </div>

        {showXpBadge ? (
          <div className="pointer-events-auto flex items-center gap-2">
            {quizStreakDays > 0 ? (
              <div
                className="flex items-center gap-1 rounded-xl border border-amber-300/35 bg-amber-300/10 px-2 py-1 text-xs text-amber-100"
                aria-label={`${t.learn.ui.streakLabel}: ${quizStreakDays}`}
                title={`${t.learn.ui.streakLabel}: ${quizStreakDays}`}
              >
                <Flame className="h-4 w-4" aria-hidden />
                <span className="font-semibold">{quizStreakDays}</span>
              </div>
            ) : null}
            <XpBadge />
          </div>
        ) : null}
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
});

HudTopBarRegion.displayName = "HudTopBarRegion";
