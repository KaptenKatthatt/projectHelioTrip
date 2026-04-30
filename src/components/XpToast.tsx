import { useEffect } from "react";
import { useStore } from "../store/useStore";

const TOAST_VISIBLE_MS = 2500;

export const XpToast = () => {
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
      className="pointer-events-none fixed left-1/2 top-16 z-30 -translate-x-1/2 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-4 py-1.5 text-sm font-semibold text-cyan-200 shadow-lg backdrop-blur-md"
    >
      +{recentXpGain} XP
    </div>
  );
};
