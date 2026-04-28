import type { BodyId } from "../bodies";
import { getBody } from "../bodies";

export type AchievementId =
  | "first_planet"
  | "first_moon"
  | "first_satellite"
  | "first_constellation"
  | "first_free_flight"
  | "first_mission_completed";

export const ACHIEVEMENT_IDS: ReadonlyArray<AchievementId> = [
  "first_planet",
  "first_moon",
  "first_satellite",
  "first_constellation",
  "first_free_flight",
  "first_mission_completed",
];

export const isAchievementId = (value: unknown): value is AchievementId =>
  typeof value === "string" &&
  (ACHIEVEMENT_IDS as ReadonlyArray<string>).includes(value);

export type AchievementTrigger =
  | { kind: "body_visited"; bodyId: BodyId }
  | { kind: "constellation_focused" }
  | { kind: "free_flight_activated" }
  | { kind: "mission_completed" };

type AchievementDefinition = {
  readonly id: AchievementId;
  /** Translation key under `t.phase3.achievements.<id>`. */
  readonly titleKey: AchievementId;
  readonly matches: (event: AchievementTrigger) => boolean;
};

const isPlanetVisit = (event: AchievementTrigger): boolean => {
  if (event.kind !== "body_visited") return false;
  const body = getBody(event.bodyId);
  return body?.kind === "planet";
};

const isMoonVisit = (event: AchievementTrigger): boolean => {
  if (event.kind !== "body_visited") return false;
  const body = getBody(event.bodyId);
  return body?.kind === "moon";
};

const isSatelliteVisit = (event: AchievementTrigger): boolean => {
  if (event.kind !== "body_visited") return false;
  const body = getBody(event.bodyId);
  return body?.kind === "satellite";
};

const ACHIEVEMENT_DEFINITIONS: ReadonlyArray<AchievementDefinition> = [
  { id: "first_planet", titleKey: "first_planet", matches: isPlanetVisit },
  { id: "first_moon", titleKey: "first_moon", matches: isMoonVisit },
  {
    id: "first_satellite",
    titleKey: "first_satellite",
    matches: isSatelliteVisit,
  },
  {
    id: "first_constellation",
    titleKey: "first_constellation",
    matches: (event) => event.kind === "constellation_focused",
  },
  {
    id: "first_free_flight",
    titleKey: "first_free_flight",
    matches: (event) => event.kind === "free_flight_activated",
  },
  {
    id: "first_mission_completed",
    titleKey: "first_mission_completed",
    matches: (event) => event.kind === "mission_completed",
  },
];

export const evaluateAchievements = (
  event: AchievementTrigger,
  alreadyUnlocked: ReadonlyArray<AchievementId>,
): ReadonlyArray<AchievementId> => {
  const unlockedSet = new Set(alreadyUnlocked);
  const newly: AchievementId[] = [];
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (unlockedSet.has(def.id)) continue;
    if (def.matches(event)) newly.push(def.id);
  }
  return newly;
};
