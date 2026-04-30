import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { useStore } from "../store/useStore";

const TOAST_VISIBLE_MS = 2200;

export const XpGainToast = () => {
  const { t } = useTranslation();
  const recentXpGain = useStore((s) => s.recentXpGain);
  const acknowledgeXpGain = useStore((s) => s.acknowledgeXpGain);

  useEffect(() => {
    if (!recentXpGain) return;
    const timer = window.setTimeout(acknowledgeXpGain, TOAST_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [recentXpGain, acknowledgeXpGain]);

  if (!recentXpGain) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-16 z-30 -translate-x-1/2 rounded-full border border-cyan-300/45 bg-cyan-300/15 px-3 py-1.5 text-xs font-medium text-cyan-100 shadow-lg backdrop-blur-md"
    >
      <span className="inline-flex items-center gap-1">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        {t.learn.ui.xpToastLabel.replace("{xp}", String(recentXpGain))}
      </span>
    </div>
  );
};
