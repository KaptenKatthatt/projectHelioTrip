import { useTranslation } from "../hooks/useTranslation";
import { useStore } from "../store/useStore";
import { ACHIEVEMENT_IDS } from "../lib/missions/achievements";
import { PLANETS } from "../lib/planets";
import { MOONS } from "../lib/moons";
import { SATELLITES } from "../lib/satellites";

type ProgressPanelProps = {
  readonly className?: string;
  readonly compact?: boolean;
};

export const ProgressPanel = ({
  className,
  compact = false,
}: ProgressPanelProps) => {
  const { t, bodyName } = useTranslation();
  const visitedBodies = useStore((s) => s.visitedBodies);
  const unlocked = useStore((s) => s.unlockedAchievements);

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
      <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
        {t.phase3.progressPanel.title}
      </h3>

      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-white/65">
          <span>{t.phase3.progressPanel.visited}</span>
          <span className="font-mono text-white/85">
            {visitedSet.size}/{totalBodies}
          </span>
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

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-white/65">
          <span>{t.phase3.progressPanel.achievementsTitle}</span>
          <span className="font-mono text-white/85">
            {unlockedSet.size}/{ACHIEVEMENT_IDS.length}
          </span>
        </div>
        {unlockedSet.size === 0 ? (
          <p className="mt-1 text-xs text-white/45">
            {t.phase3.progressPanel.noAchievements}
          </p>
        ) : (
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
        )}
      </div>
    </aside>
  );
};
