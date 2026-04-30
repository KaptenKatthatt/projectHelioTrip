import { Flame } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { useStore } from "../../store/useStore";

export const LearningStreakBadge = () => {
  const { t } = useTranslation();
  const streakDays = useStore((s) => s.learningStreakDays);

  if (streakDays < 1) return null;

  return (
    <div
      className="pointer-events-auto inline-flex items-center gap-1 rounded-xl border border-amber-300/35 bg-amber-300/15 px-2.5 py-1 text-xs text-amber-100"
      title={t.learn.ui.learningStreakResetHint}
    >
      <Flame className="h-3.5 w-3.5" aria-hidden />
      <span>{t.learn.ui.learningStreakLabel.replace("{days}", String(streakDays))}</span>
    </div>
  );
};
