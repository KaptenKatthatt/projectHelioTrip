import { useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useStore } from "../store/useStore";

const TOAST_VISIBLE_MS = 4000;

export const AchievementToast = () => {
  const { t } = useTranslation();
  const recent = useStore((s) => s.recentAchievement);
  const acknowledge = useStore((s) => s.acknowledgeAchievement);

  useEffect(() => {
    if (!recent) return;
    const timer = window.setTimeout(acknowledge, TOAST_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [recent, acknowledge]);

  if (!recent) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto fixed left-1/2 top-4 z-30 -translate-x-1/2 rounded-full border border-emerald-300/40 bg-emerald-300/15 px-4 py-2 text-sm font-medium text-emerald-100 shadow-lg backdrop-blur-md"
    >
      <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
        {t.phase3.achievements.unlocked}
      </span>
      {t.phase3.achievements[recent.id]}
    </div>
  );
};
