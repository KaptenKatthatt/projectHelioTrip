import type { ReactNode } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { ACHIEVEMENT_IDS } from "../../lib/missions/achievements";
import { XP_TITLES } from "../../lib/learning/xp";
import { MOONS } from "../../lib/moons";
import { PLANETS } from "../../lib/planets";
import { SATELLITES } from "../../lib/satellites";
import { useStore } from "../../store/useStore";

type ProgressPanelProps = {
  readonly className?: string;
  readonly compact?: boolean;
  readonly showTitle?: boolean;
  readonly visitedRowEnd?: ReactNode;
};

export const ProgressPanel = ({
  className,
  compact = false,
  showTitle = true,
  visitedRowEnd,
}: ProgressPanelProps) => {
  const { t, bodyName } = useTranslation();
  const visitedBodies = useStore((s) => s.visitedBodies);
  const unlocked = useStore((s) => s.unlockedAchievements);
  const xp = useStore((s) => s.xp);
  const title = useStore((s) => s.title);
  const gameMode = useStore((s) => s.gameMode);

  const showXp = gameMode === "learn" || gameMode === "challenge";
  const titleLabel = t.learn.xpTitles[title];
  const xpBased = XP_TITLES.filter((tier) => !tier.missionRequired);
  const currentTierIdx = [...xpBased].reverse().findIndex((tier) => xp >= tier.xpRequired);
  const currentTier = xpBased[xpBased.length - 1 - currentTierIdx];
  const nextTier = currentTier ? xpBased[xpBased.indexOf(currentTier) + 1] : null;
  const prevXpRequired = currentTier?.xpRequired ?? 0;
  const nextXpRequired = nextTier?.xpRequired ?? prevXpRequired;
  const xpProgress =
    nextTier && nextXpRequired > prevXpRequired
      ? Math.min(((xp - prevXpRequired) / (nextXpRequired - prevXpRequired)) * 100, 100)
      : 100;

  const totalBodies = PLANETS.length + MOONS.length + SATELLITES.length;
  const visitedSet = new Set(visitedBodies);
  const unlockedSet = new Set(unlocked);

  return (
    <aside
      className={
        "pointer-events-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md " +
        (compact ? "p-3 text-sm" : "p-4 text-sm sm:p-5") +
        " " +
        (className ?? "")
      }
    >
      {showTitle ? (
        <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
          {t.phase3.progressPanel.title}
        </h3>
      ) : null}

      {showXp && (
        <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">{titleLabel}</span>
            <span className="text-xs text-white/50 font-mono">{xp} {t.learn.ui.xpPoints}</span>
          </div>
          {nextTier && (
            <>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <p className="text-xs text-white/40">
                {t.learn.ui.xpUntilNext
                  .replace("{xp}", String(nextXpRequired - xp))
                  .replace("{title}", t.learn.xpTitles[nextTier.id])}
              </p>
            </>
          )}
        </div>
      )}

      <div className={showTitle ? "mt-2" : ""}>
        <div className="flex items-start justify-between gap-3">
          <span className="text-sm font-medium text-white/80">
            {t.phase3.progressPanel.visited}
          </span>
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-mono text-sm tabular-nums text-white/85">
              {visitedSet.size}/{totalBodies}
            </span>
            {visitedRowEnd ? (
              <div className="flex justify-end">{visitedRowEnd}</div>
            ) : null}
          </div>
        </div>
        {!compact ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {visitedBodies.slice(-8).map((id) => (
              <span
                key={id}
                className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-white/75"
              >
                {bodyName(id)}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {unlockedSet.size > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-white/65">
            <span>{t.phase3.progressPanel.achievementsTitle}</span>
            <span className="font-mono text-white/85">
              {unlockedSet.size}/{ACHIEVEMENT_IDS.length}
            </span>
          </div>
          <ul className="mt-1 flex flex-wrap gap-1">
            {ACHIEVEMENT_IDS.filter((id) => unlockedSet.has(id)).map((id) => (
              <li
                key={id}
                className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-1.5 py-0.5 text-[11px] text-emerald-100"
              >
                {t.phase3.achievements[id]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};
