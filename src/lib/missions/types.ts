import type { BodyId } from "../bodies";
import type { ConstellationId } from "../constellations";

export type GameMode = "explore" | "learn" | "challenge";

export const GAME_MODES: readonly GameMode[] = [
  "explore",
  "learn",
  "challenge",
];

export const isGameMode = (value: unknown): value is GameMode =>
  value === "explore" || value === "learn" || value === "challenge";

export type NavigationModeLite = "cinematic" | "free";

/**
 * Domain events that the mission and achievement engines react to.
 * Events are explicit and dispatched by store actions, never derived
 * inside `useFrame` so mission logic stays cheap and predictable.
 */
export type MissionDomainEvent =
  | { kind: "body_focused"; bodyId: BodyId }
  | { kind: "time_scale_changed"; daysPerSecond: number }
  | { kind: "navigation_mode_changed"; mode: NavigationModeLite }
  | { kind: "constellation_focused"; constellationId: ConstellationId }
  | { kind: "quiz_completed"; quizId: string };

export type MissionStepTrigger =
  | { kind: "visit_body"; bodyId: BodyId }
  | { kind: "time_scale_at_least"; minimumDaysPerSecond: number }
  | { kind: "navigation_mode_is"; mode: NavigationModeLite }
  | { kind: "constellation_focused"; constellationId?: ConstellationId }
  | { kind: "quiz_completed"; quizId: string };

export type MissionStep = {
  readonly id: string;
  readonly trigger: MissionStepTrigger;
  /** Translation key under `t.phase3.missionDefs.<missionId>.steps.<stepId>`. */
  readonly copyKey: string;
  /** Quiz id to auto-trigger when this step completes. */
  readonly triggersQuizId?: string;
};

export type MissionDefinition = {
  readonly id: string;
  readonly availableModes: ReadonlyArray<GameMode>;
  /** Translation key under `t.phase3.missionDefs.<missionId>`. */
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly steps: ReadonlyArray<MissionStep>;
  /** When true, steps must be completed in declared order. */
  readonly ordered: boolean;
};

export type MissionProgress = {
  readonly missionId: string;
  readonly startedAtMs: number;
  readonly completedStepIds: ReadonlyArray<string>;
  readonly completed: boolean;
  readonly completedAtMs: number | null;
};

export const createInitialProgress = (
  missionId: string,
  nowMs: number,
): MissionProgress => ({
  missionId,
  startedAtMs: nowMs,
  completedStepIds: [],
  completed: false,
  completedAtMs: null,
});
