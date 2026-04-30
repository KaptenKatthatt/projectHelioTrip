import { Sparkle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { resolveCuriosityHookMessage } from "../lib/learning/curiosityHooks";
import { getMissionDefinition } from "../lib/missions/missionDefinitions";
import { useStore } from "../store/useStore";

const PROMPT_VISIBLE_MS = 6500;

export const DrAstraPromptToast = () => {
  const { t, locale, bodyName } = useTranslation();
  const activeBody = useStore((s) => s.activeBody);
  const completedQuizzes = useStore((s) => s.completedQuizzes);
  const activeMissionId = useStore((s) => s.activeMissionId);
  const gameMode = useStore((s) => s.gameMode);
  const [message, setMessage] = useState<string | null>(null);
  const previousBodyRef = useRef(activeBody);
  const previousQuizCountRef = useRef(Object.keys(completedQuizzes).length);
  const previousMissionRef = useRef(activeMissionId);

  const currentQuizCount = Object.keys(completedQuizzes).length;
  const missionTitle = useMemo(() => {
    if (!activeMissionId) return null;
    const mission = getMissionDefinition(activeMissionId);
    if (!mission) return null;
    const localized = t.phase3.missions[mission.id as keyof typeof t.phase3.missions];
    return localized?.title ?? mission.id;
  }, [activeMissionId, t]);

  useEffect(() => {
    if (gameMode === "explore") return;
    if (activeBody && activeBody !== previousBodyRef.current) {
      setMessage(
        resolveCuriosityHookMessage(locale, { kind: "body_selected", bodyId: activeBody }, bodyName(activeBody)),
      );
    } else if (currentQuizCount > previousQuizCountRef.current) {
      setMessage(
        resolveCuriosityHookMessage(locale, {
          kind: "quiz_completed",
          quizCount: currentQuizCount,
        }),
      );
    } else if (activeMissionId && activeMissionId !== previousMissionRef.current && missionTitle) {
      setMessage(
        resolveCuriosityHookMessage(locale, {
          kind: "daily_challenge",
          missionTitle,
        }),
      );
    }
    previousBodyRef.current = activeBody;
    previousQuizCountRef.current = currentQuizCount;
    previousMissionRef.current = activeMissionId;
  }, [activeBody, activeMissionId, bodyName, currentQuizCount, gameMode, locale, missionTitle]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), PROMPT_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-28 z-30 w-[min(28rem,92vw)] -translate-x-1/2 rounded-xl border border-violet-300/35 bg-violet-300/15 px-3 py-2 text-xs text-violet-100 shadow-lg backdrop-blur-md"
    >
      <p className="inline-flex items-start gap-1.5 leading-relaxed">
        <Sparkle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          <span className="mr-1 font-semibold text-violet-50">{t.learn.ui.narratorAstra}:</span>
          {message}
        </span>
      </p>
    </div>
  );
};
