import { useStore } from "../../store/useStore";
import { XP_TITLES } from "../../lib/learning/xp";
import { useTranslation } from "../../hooks/useTranslation";

type Props = {
  readonly className?: string;
};

export const XpBadge = ({ className }: Props) => {
  const xp = useStore((s) => s.xp);
  const title = useStore((s) => s.title);
  const { t } = useTranslation();

  const xpBased = XP_TITLES.filter((t) => !t.missionRequired);
  const next = xpBased.find((tier) => tier.xpRequired > xp);
  const titleLabel = t.learn.xpTitles[title];

  return (
    <div
      className={[
        "pointer-events-auto flex items-center gap-2 rounded-xl bg-black/40 px-3 py-1.5 backdrop-blur-md border border-white/10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="text-xs font-semibold text-white/90 leading-none">
        {titleLabel}
      </span>
      <span className="text-xs text-white/50 leading-none">
        {xp} {t.learn.ui.xpPoints}
      </span>
      {next && (
        <div className="flex items-center gap-1">
          <div className="h-1 w-14 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-700"
              style={{
                width: `${Math.round(
                  ((xp - (xpBased[xpBased.indexOf(next) - 1]?.xpRequired ?? 0)) /
                    (next.xpRequired - (xpBased[xpBased.indexOf(next) - 1]?.xpRequired ?? 0))) *
                    100,
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
