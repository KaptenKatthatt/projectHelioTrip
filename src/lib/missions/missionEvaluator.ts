import type {
  MissionDefinition,
  MissionDomainEvent,
  MissionProgress,
  MissionStep,
  MissionStepTrigger,
} from "./types";

export type EvaluatorInput = {
  readonly mission: MissionDefinition;
  readonly progress: MissionProgress;
  readonly event: MissionDomainEvent;
  readonly nowMs: number;
};

export type EvaluatorOutput = {
  readonly progress: MissionProgress;
  readonly newlyCompletedStepIds: ReadonlyArray<string>;
  readonly missionJustCompleted: boolean;
};

const triggerMatchesEvent = (
  trigger: MissionStepTrigger,
  event: MissionDomainEvent,
): boolean => {
  switch (trigger.kind) {
    case "visit_body":
      return event.kind === "body_focused" && event.bodyId === trigger.bodyId;
    case "time_scale_at_least":
      return (
        event.kind === "time_scale_changed" &&
        event.daysPerSecond >= trigger.minimumDaysPerSecond
      );
    case "navigation_mode_is":
      return (
        event.kind === "navigation_mode_changed" && event.mode === trigger.mode
      );
    case "constellation_focused":
      return (
        event.kind === "constellation_focused" &&
        (trigger.constellationId === undefined ||
          trigger.constellationId === event.constellationId)
      );
  }
};

const findCandidateSteps = (
  mission: MissionDefinition,
  progress: MissionProgress,
): ReadonlyArray<MissionStep> => {
  if (!mission.ordered) {
    return mission.steps.filter(
      (step) => !progress.completedStepIds.includes(step.id),
    );
  }
  const next = mission.steps.find(
    (step) => !progress.completedStepIds.includes(step.id),
  );
  return next ? [next] : [];
};

/**
 * Pure mission evaluator. Returns the next progress snapshot together
 * with the diff of newly completed step ids and whether the mission
 * just transitioned to completed. It never mutates its inputs and is
 * safe to call from store actions or tests.
 */
export const evaluateMissionStep = (input: EvaluatorInput): EvaluatorOutput => {
  const { mission, progress, event, nowMs } = input;

  if (progress.completed) {
    return {
      progress,
      newlyCompletedStepIds: [],
      missionJustCompleted: false,
    };
  }

  const candidates = findCandidateSteps(mission, progress);
  const matched = candidates.filter((step) =>
    triggerMatchesEvent(step.trigger, event),
  );
  if (matched.length === 0) {
    return {
      progress,
      newlyCompletedStepIds: [],
      missionJustCompleted: false,
    };
  }

  const newCompletedStepIds = [
    ...progress.completedStepIds,
    ...matched.map((step) => step.id),
  ];
  const allDone = mission.steps.every((step) =>
    newCompletedStepIds.includes(step.id),
  );

  return {
    progress: {
      ...progress,
      completedStepIds: newCompletedStepIds,
      completed: allDone,
      completedAtMs: allDone ? nowMs : progress.completedAtMs,
    },
    newlyCompletedStepIds: matched.map((step) => step.id),
    missionJustCompleted: allDone,
  };
};

export const computeMissionProgressFraction = (
  mission: MissionDefinition,
  progress: MissionProgress,
): number => {
  if (mission.steps.length === 0) return 1;
  return progress.completedStepIds.length / mission.steps.length;
};
