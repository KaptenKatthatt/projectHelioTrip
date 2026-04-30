import { useMemo, useState } from "react";
import type { Translation } from "../../i18n/translations";
import {
  MISSION_DEFINITIONS,
  getMissionDefinition,
} from "../../lib/missions/missionDefinitions";
import { computeMissionProgressFraction } from "../../lib/missions/missionEvaluator";
import type { MissionDefinition, MissionProgress } from "../../lib/missions/types";
import { useStore } from "../../store/useStore";
import { useTranslation } from "../../hooks/useTranslation";

type MissionCardProps = {
  readonly className?: string;
  readonly compact?: boolean;
};

const formatStepProgress = (
  template: string,
  current: number,
  total: number,
): string =>
  template
    .replace("{current}", String(current))
    .replace("{total}", String(total));

const localizedMission = (
  t: Translation,
  mission: MissionDefinition,
): { title: string; description: string } => {
  const entry =
    t.phase3.missions[mission.id as keyof Translation["phase3"]["missions"]];
  return {
    title: entry?.title ?? mission.id,
    description: entry?.description ?? "",
  };
};

const localizedStep = (t: Translation, copyKey: string): string =>
  t.phase3.steps[copyKey] ?? copyKey;

const resolveStepState = (
  ordered: boolean,
  completedStepIds: readonly string[],
  completedMission: boolean,
  stepId: string,
  index: number,
): { done: boolean; isCurrent: boolean } => {
  const done = completedStepIds.includes(stepId);
  const isCurrent =
    !completedMission &&
    !done &&
    (!ordered || index === completedStepIds.length);
  return { done, isCurrent };
};

const missionStepTextClass = (done: boolean, isCurrent: boolean): string => {
  if (done) return "text-white/55 line-through decoration-emerald-300/60";
  if (isCurrent) return "text-white";
  return "text-white/65";
};

const missionStepDotClass = (done: boolean, isCurrent: boolean): string => {
  if (done) return "bg-emerald-300";
  if (isCurrent) return "bg-white";
  return "bg-white/30";
};

export const MissionCard = ({
  className,
  compact = false,
}: MissionCardProps) => {
  const { t } = useTranslation();
  const gameMode = useStore((s) => s.gameMode);
  const activeMissionId = useStore((s) => s.activeMissionId);
  const missionProgress = useStore((s) => s.missionProgress);
  const startMission = useStore((s) => s.startMission);
  const abandonMission = useStore((s) => s.abandonMission);
  const setGameMode = useStore((s) => s.setGameMode);
  const [confirmingAbandon, setConfirmingAbandon] = useState(false);

  const activeMission = activeMissionId
    ? getMissionDefinition(activeMissionId)
    : undefined;
  const activeProgress: MissionProgress | undefined = activeMissionId
    ? missionProgress[activeMissionId]
    : undefined;

  const availableMissions = useMemo(
    () =>
      MISSION_DEFINITIONS.filter((m) => m.availableModes.includes(gameMode)),
    [gameMode],
  );

  if (gameMode === "explore") return null;

  const cardBase =
    "pointer-events-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md " +
    (compact ? "p-3 text-sm" : "p-4 text-sm sm:p-5");

  if (!activeMission || !activeProgress) {
    return (
      <aside className={`${cardBase} ${className ?? ""}`.trim()}>
        <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">
          {t.phase3.missionCard.pickMission}
        </h3>
        <ul className="mt-2 flex flex-col gap-1">
          {availableMissions.map((mission) => {
            const localized = localizedMission(t, mission);
            const progress = missionProgress[mission.id];
            const done = progress?.completed === true;
            return (
              <li key={mission.id}>
                <button
                  type="button"
                  onClick={() => startMission(mission.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {localized.title}
                  </span>
                  {done ? (
                    <span className="rounded-md border border-emerald-300/40 bg-emerald-300/10 px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide text-emerald-200">
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    );
  }

  const localized = localizedMission(t, activeMission);
  const totalSteps = activeMission.steps.length;
  const completedCount = activeProgress.completedStepIds.length;
  const fraction = computeMissionProgressFraction(activeMission, activeProgress);
  const fractionPercent = Math.round(fraction * 100);

  return (
    <aside className={`${cardBase} ${className ?? ""}`.trim()}>
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">
            {t.phase3.missionCard.activeMission}
          </p>
          <h3 className="mt-0.5 truncate text-base font-semibold tracking-tight text-white">
            {localized.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => {
            const confirmed = window.confirm(t.phase3.missionCard.confirmLeaveMission);
            if (!confirmed) return;
            abandonMission();
            setGameMode("explore");
          }}
          className="shrink-0 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-medium text-white/70 transition hover:bg-white/15 hover:text-white"
        >
          {t.phase3.missionCard.backToExplore}
        </button>
      </header>

      {!compact ? (
        <p className="mt-1.5 text-xs text-white/55">{localized.description}</p>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-300/80 transition-[width]"
            style={{ width: `${fractionPercent}%` }}
          />
        </div>
        <span className="font-mono text-[11px] text-white/55">
          {formatStepProgress(
            t.phase3.missionCard.stepProgress,
            completedCount,
            totalSteps,
          )}
        </span>
      </div>

      <ol className="mt-3 flex flex-col gap-1">
        {activeMission.steps.map((step, index) => {
          const { done, isCurrent } = resolveStepState(
            activeMission.ordered,
            activeProgress.completedStepIds,
            activeProgress.completed,
            step.id,
            index,
          );
          return (
            <li
              key={step.id}
              className={
                "flex items-start gap-2 rounded-md px-1 py-1 text-xs " +
                missionStepTextClass(done, isCurrent)
              }
            >
              <span
                aria-hidden
                className={
                  "mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full " +
                  missionStepDotClass(done, isCurrent)
                }
              />
              <span className="min-w-0 flex-1">{localizedStep(t, step.copyKey)}</span>
            </li>
          );
        })}
      </ol>

      {activeProgress.completed ? (
        <p className="mt-3 rounded-md bg-emerald-300/15 px-2 py-1.5 text-center text-xs font-medium text-emerald-200">
          {t.phase3.missionCard.missionCompleted}
        </p>
      ) : (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setConfirmingAbandon((prev) => !prev)}
            className="w-full rounded-md border border-white/10 bg-transparent px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-white/55 transition hover:bg-white/10 hover:text-white/85"
          >
            {t.phase3.missionCard.abandon}
          </button>
          {confirmingAbandon ? (
            <div className="mt-2 rounded-md border border-amber-300/30 bg-amber-300/10 p-2">
              <p className="text-xs text-amber-100/90">
                {t.phase3.missionCard.confirmAbandonMission}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    abandonMission();
                    setConfirmingAbandon(false);
                  }}
                  className="flex-1 rounded-md border border-amber-200/40 bg-amber-200/20 px-2 py-1 text-xs font-medium text-amber-50 transition hover:bg-amber-200/30"
                >
                  {t.phase3.missionCard.confirmAction}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingAbandon(false)}
                  className="flex-1 rounded-md border border-white/15 bg-transparent px-2 py-1 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  {t.phase3.missionCard.cancelAction}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </aside>
  );
};
