import { useEffect } from "react";
import { useStore } from "../store/useStore";

const PATIENCE_REWARD_DELAY_MS = 25_000;

export const PatienceRewardEffect = () => {
  const activeBody = useStore((s) => s.activeBody);
  const isTraveling = useStore((s) => s.isTraveling);
  const gameMode = useStore((s) => s.gameMode);
  const maybeRewardBodyPatience = useStore((s) => s.maybeRewardBodyPatience);

  useEffect(() => {
    if (!activeBody || isTraveling) return;
    if (gameMode === "explore") return;
    const timer = window.setTimeout(maybeRewardBodyPatience, PATIENCE_REWARD_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [activeBody, isTraveling, gameMode, maybeRewardBodyPatience]);

  return null;
};
