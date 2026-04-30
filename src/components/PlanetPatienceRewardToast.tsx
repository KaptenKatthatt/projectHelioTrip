import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useStore } from "../store/useStore";

const REWARD_DELAY_MS = 25_000;
const REWARD_XP_AMOUNT = 15;
const TOAST_VISIBLE_MS = 3_500;

export const PlanetPatienceRewardToast = () => {
  const { t, bodyName } = useTranslation();
  const activeBody = useStore((s) => s.activeBody);
  const isTraveling = useStore((s) => s.isTraveling);
  const gameMode = useStore((s) => s.gameMode);
  const awardXp = useStore((s) => s.awardXp);
  const [message, setMessage] = useState<string | null>(null);
  const rewardedBodiesRef = useRef(new Set<string>());
  const rewardTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (rewardTimerRef.current !== null) {
      window.clearTimeout(rewardTimerRef.current);
      rewardTimerRef.current = null;
    }
    if (!activeBody || isTraveling) return;
    if (gameMode === "explore") return;
    if (rewardedBodiesRef.current.has(activeBody)) return;
    rewardTimerRef.current = window.setTimeout(() => {
      rewardedBodiesRef.current.add(activeBody);
      awardXp(REWARD_XP_AMOUNT);
      setMessage(
        t.learn.ui.patienceReward
          .replace("{body}", bodyName(activeBody))
          .replace("{xp}", String(REWARD_XP_AMOUNT)),
      );
    }, REWARD_DELAY_MS);
    return () => {
      if (rewardTimerRef.current !== null) {
        window.clearTimeout(rewardTimerRef.current);
        rewardTimerRef.current = null;
      }
    };
  }, [activeBody, awardXp, bodyName, gameMode, isTraveling, t.learn.ui.patienceReward]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), TOAST_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-40 z-30 w-[min(28rem,92vw)] -translate-x-1/2 rounded-xl border border-cyan-300/35 bg-cyan-300/15 px-3 py-2 text-xs text-cyan-100 shadow-lg backdrop-blur-md"
    >
      <p className="inline-flex items-start gap-1.5 leading-relaxed">
        <Star className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{message}</span>
      </p>
    </div>
  );
};
