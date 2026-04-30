import { useStore } from "../../store/useStore";
import { useTranslation } from "../../hooks/useTranslation";

type Props = {
  readonly className?: string;
};

export const XpBadge = ({ className }: Props) => {
  const xp = useStore((s) => s.xp);
  const title = useStore((s) => s.title);
  const { t } = useTranslation();

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
    </div>
  );
};
