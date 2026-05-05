import { Vector3 } from "three";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BodyId } from "../lib/bodies";
import type { ConstellationId } from "../lib/constellations";
import { detectLocale, isLocale } from "../i18n/translations";
import { INITIAL_OVERVIEW_CAMERA_POSITION } from "../lib/initialCamera";
import { analytics } from "../lib/analytics";
import {
  type GameMode,
  type MissionDomainEvent,
  type MissionProgress,
  createInitialProgress,
  isGameMode,
} from "../lib/missions/types";
import {
  getMissionDefinition,
  isMissionId,
} from "../lib/missions/missionDefinitions";
import { evaluateMissionStep } from "../lib/missions/missionEvaluator";
import {
  type AchievementId,
  type AchievementTrigger,
  evaluateAchievements,
  isAchievementId,
} from "../lib/missions/achievements";
import {
  inferShareLinkContextType,
  type ShareLinkState,
} from "../lib/shareLink";
import { DEFAULT_TIME_SCALE, TIME_SPEED_PRESETS } from "../lib/timePlayback";
import type { FactCardLevel } from "../lib/learning/bodyContent";
import { type TitleId, XP_AWARDS, resolveTitle } from "../lib/learning/xp";
import { createSimulationSlice, SimulationSlice } from "./slices/createSimulationSlice";
import { createGameSlice, GameSlice } from "./slices/createGameSlice";

const completedMissionIdsList = (
  missionProgress: Readonly<Record<string, MissionProgress>>,
): string[] =>
  Object.entries(missionProgress)
    .filter(([, p]) => p.completed)
    .map(([id]) => id);

export type Store = SimulationSlice & GameSlice & {
  travelTo: (id: BodyId) => void;
  travelToOverview: () => void;
  resetSolarSystemStart: () => void;
  focusSkyTarget: (id: ConstellationId) => void;
  recordPhotoTaken: (targetBodyId: BodyId | null) => void;
  restoreFromShareLink: (state: ShareLinkState) => void;
};

const DEFAULT_CAMERA_POSITION = INITIAL_OVERVIEW_CAMERA_POSITION.clone();

type PersistedState = {
  locale: any;
  gameMode: GameMode;
  missionProgress: Record<string, MissionProgress>;
  visitedBodies: BodyId[];
  unlockedAchievements: AchievementId[];
  learningLevel: FactCardLevel;
  xp: number;
  completedQuizzes: Record<string, number>;
  leftRailOpen: boolean;
  patienceRewardedOnByBody: Partial<Record<BodyId, string>>;
  quizStreakDays: number;
  lastQuizCompletedOn: string | null;
  discoveredConstellations: ConstellationId[];
};

const dateKeyFromLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayDateKey = (): string => dateKeyFromLocalDate(new Date());

const parseDateKeyToUtcMs = (dateKey: string): number | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return Date.UTC(year, month - 1, day);
};

const daysBetweenDateKeys = (previousKey: string, nextKey: string): number => {
  const previousUtc = parseDateKeyToUtcMs(previousKey);
  const nextUtc = parseDateKeyToUtcMs(nextKey);
  if (previousUtc === null || nextUtc === null) return Number.POSITIVE_INFINITY;
  return Math.round((nextUtc - previousUtc) / 86_400_000);
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const sanitizeMissionProgressEntry = (
  key: string,
  value: unknown,
): MissionProgress | null => {
  if (!isMissionId(key)) return null;
  if (!isObjectRecord(value)) return null;
  const candidate = value as Partial<MissionProgress>;
  if (candidate.missionId !== key) return null;
  if (typeof candidate.startedAtMs !== "number") return null;
  if (typeof candidate.completed !== "boolean") return null;
  if (!Array.isArray(candidate.completedStepIds)) return null;

  return {
    missionId: key,
    startedAtMs: candidate.startedAtMs,
    completedStepIds: candidate.completedStepIds.filter(
      (id): id is string => typeof id === "string",
    ),
    completed: candidate.completed,
    completedAtMs:
      typeof candidate.completedAtMs === "number" ? candidate.completedAtMs : null,
  };
};

const sanitizeMissionProgressMap = (
  raw: unknown,
): Record<string, MissionProgress> => {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, MissionProgress> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const sanitized = sanitizeMissionProgressEntry(key, value);
    if (!sanitized) continue;
    out[key] = sanitized;
  }
  return out;
};

const sanitizeVisitedBodies = (raw: unknown): BodyId[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is BodyId => typeof value === "string");
};

const sanitizeAchievements = (raw: unknown): AchievementId[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isAchievementId);
};

const sanitizeDiscoveredConstellations = (raw: unknown): ConstellationId[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is ConstellationId => typeof value === "string");
};

const applyMissionEventProgress = (
  state: Store,
  event: MissionDomainEvent,
  nowMs: number,
): void => {
  if (state.activeMissionId === null) return;
  const mission = getMissionDefinition(state.activeMissionId);
  const progress = state.missionProgress[state.activeMissionId];
  if (!mission || !progress || progress.completed) return;

  const result = evaluateMissionStep({
    mission,
    progress,
    event,
    nowMs,
  });
  if (result.newlyCompletedStepIds.length === 0) return;

  useStore.setState({
    missionProgress: {
      ...state.missionProgress,
      [mission.id]: result.progress,
    },
  });
  for (const stepId of result.newlyCompletedStepIds) {
    analytics.missionStepCompleted(mission.id, stepId);
    useStore.getState().awardXp(XP_AWARDS.missionStepCompleted);
    const stepDef = mission.steps.find((s) => s.id === stepId);
    if (stepDef?.triggersQuizId) {
      useStore.getState().triggerQuiz(stepDef.triggersQuizId);
    }
  }
  if (!result.missionJustCompleted) return;
  analytics.missionCompleted(mission.id);
  const isAdventure = mission.id === "water_hunt" || mission.id === "gravity_sling";
  useStore.getState().awardXp(
    isAdventure ? XP_AWARDS.adventureMissionCompleted : XP_AWARDS.missionCompleted,
  );
  unlockAchievements({ kind: "mission_completed" }, nowMs);
};

const resolveAchievementTrigger = (
  event: MissionDomainEvent,
): AchievementTrigger | null => {
  if (event.kind === "body_focused") {
    return { kind: "body_visited", bodyId: event.bodyId };
  }
  if (event.kind === "navigation_mode_changed" && event.mode === "free") {
    return { kind: "free_flight_activated" };
  }
  if (event.kind === "constellation_focused") {
    return { kind: "constellation_focused" };
  }
  return null;
};

const dispatchDomainEvent = (event: MissionDomainEvent): void => {
  const state = useStore.getState();
  const nowMs = Date.now();
  applyMissionEventProgress(state, event, nowMs);
  const achievementTrigger = resolveAchievementTrigger(event);
  if (!achievementTrigger) return;
  unlockAchievements(achievementTrigger, nowMs);
};

const unlockAchievements = (
  trigger: AchievementTrigger,
  nowMs: number,
): void => {
  const state = useStore.getState();
  const newly = evaluateAchievements(trigger, state.unlockedAchievements);
  if (newly.length === 0) return;
  const latest = newly[newly.length - 1];
  if (!latest) return;
  const merged = [...state.unlockedAchievements, ...newly];
  useStore.setState({
    unlockedAchievements: merged,
    recentAchievement: { id: latest, unlockedAtMs: nowMs },
  });
  for (const id of newly) {
    analytics.achievementUnlocked(id);
  }
};

const recordVisitedBody = (id: BodyId): void => {
  const state = useStore.getState();
  if (state.visitedBodies.includes(id)) return;
  const next = [...state.visitedBodies, id];
  useStore.setState({ visitedBodies: next });
  analytics.checklistProgress(next.length);
  useStore.getState().awardXp(XP_AWARDS.bodyVisited);
};

const buildShareLinkPartialState = (
  snapshot: ShareLinkState,
  state: Store,
): Partial<Store> => {
  const partial: any = {};

  if (snapshot.gameMode !== null) {
    if (snapshot.gameMode !== state.gameMode) {
      analytics.modeChanged(snapshot.gameMode);
    }
    partial.gameMode = snapshot.gameMode;
  }
  if (snapshot.simulationTimeMs !== null) {
    partial.simulationTime = new Date(snapshot.simulationTimeMs);
  }
  if (snapshot.timeScale !== null) {
    partial.timeScale = snapshot.timeScale;
  }
  if (snapshot.navigationMode !== null) {
    partial.navigationMode = snapshot.navigationMode;
  }
  if (snapshot.bodyId !== null) {
    partial.activeBody = snapshot.bodyId;
    partial.isTraveling = true;
    partial.viewMode = "close";
    partial.travelId = state.travelId + 1;
    partial.selectedConstellation = null;
    partial.constellationUserSpinRad = 0;
  }
  if (snapshot.missionId !== null) {
    partial.activeMissionId = snapshot.missionId;
    const existing = state.missionProgress[snapshot.missionId];
    partial.missionProgress = {
      ...state.missionProgress,
      [snapshot.missionId]:
        existing ?? createInitialProgress(snapshot.missionId, Date.now()),
    };
  }

  return partial;
};

const trackShareLinkRestoreAnalytics = (
  snapshot: ShareLinkState,
  state: Store,
): void => {
  analytics.shareLinkRestored(
    inferShareLinkContextType({
      bodyId: snapshot.bodyId,
      simulationTimeMs: snapshot.simulationTimeMs ?? state.simulationTime.getTime(),
      timeScale: snapshot.timeScale ?? state.timeScale,
      gameMode: snapshot.gameMode ?? state.gameMode,
      missionId: snapshot.missionId,
      navigationMode: snapshot.navigationMode ?? state.navigationMode,
    }),
  );
};

export const useStore = create<Store>()(
  persist(
    (...args) => {
      const [set, get] = args;
      return {
        ...createSimulationSlice(...args),
        ...createGameSlice(...args),

        setLocale: (locale) =>
          set((state) => {
            if (state.locale !== locale) {
              analytics.languageChanged(locale);
            }
            return { locale };
          }),

        togglePlay: () =>
          set((state) => {
            analytics.playbackToggled(state.isPlaying);
            return { isPlaying: !state.isPlaying };
          }),

        travelTo: (id) => {
          analytics.planetSelected(id);
          const currentState = get();
          const targetSpeed = id === 'sun' ? (TIME_SPEED_PRESETS[2] ?? 7) : (TIME_SPEED_PRESETS[0] ?? 0.25);
          const shouldChangeSpeed = currentState.timeScale !== targetSpeed;

          set((state) => ({
            activeBody: id,
            isTraveling: true,
            viewMode: "close",
            travelId: state.travelId + 1,
            navigationMode: "cinematic",
            selectedConstellation: null,
            constellationUserSpinRad: 0,
            ...(shouldChangeSpeed ? { timeScale: targetSpeed } : {}),
          }));
          recordVisitedBody(id);
          dispatchDomainEvent({ kind: "body_focused", bodyId: id });
          if (shouldChangeSpeed) {
            dispatchDomainEvent({
              kind: "time_scale_changed",
              daysPerSecond: targetSpeed,
            });
          }
        },

        travelToOverview: () => {
          const targetSpeed = TIME_SPEED_PRESETS[2] ?? 7;
          const shouldChangeSpeed = get().timeScale !== targetSpeed;

          set((state) => ({
            isTraveling: true,
            viewMode: "overview",
            travelId: state.travelId + 1,
            navigationMode: "cinematic",
            ...(shouldChangeSpeed ? { timeScale: targetSpeed } : {}),
          }));

          if (shouldChangeSpeed) {
            dispatchDomainEvent({
              kind: "time_scale_changed",
              daysPerSecond: targetSpeed,
            });
          }
        },

        resetSolarSystemStart: () => {
          analytics.resetToSolarSystemStart();
          const targetSpeed = TIME_SPEED_PRESETS[2] ?? 7;
          const shouldChangeSpeed = get().timeScale !== targetSpeed;

          set((state) => ({
            activeBody: null,
            selectedConstellation: null,
            constellationUserSpinRad: 0,
            isTraveling: true,
            viewMode: "overview",
            travelId: state.travelId + 1,
            navigationMode: "cinematic",
            overviewCameraResetId: state.overviewCameraResetId + 1,
            ...(shouldChangeSpeed ? { timeScale: targetSpeed } : {}),
          }));

          if (shouldChangeSpeed) {
            dispatchDomainEvent({
              kind: "time_scale_changed",
              daysPerSecond: targetSpeed,
            });
          }
        },

        focusSkyTarget: (id) => {
          set((state) => {
            if (state.selectedConstellation !== id) {
              analytics.constellationOpened(id);
            }
            const keepPose = state.selectedConstellation === id;
            return {
              discoveredConstellations: state.discoveredConstellations.includes(id)
                ? state.discoveredConstellations
                : [...state.discoveredConstellations, id],
              selectedConstellation: id,
              constellationUserSpinRad: keepPose
                ? state.constellationUserSpinRad
                : 0,
              isPlaying: false,
              isTraveling: !keepPose,
              viewMode: "overview",
              travelId: state.travelId,
              navigationMode: "cinematic",
              skyFocusId: keepPose ? state.skyFocusId : state.skyFocusId + 1,
            };
          });
          dispatchDomainEvent({
            kind: "constellation_focused",
            constellationId: id,
          });
        },

        awardXp: (amount) =>
          set((state) => {
            if (state.gameMode === "explore") return state;
            const nextXp = state.xp + amount;
            const nextTitle = resolveTitle(
              nextXp,
              completedMissionIdsList(state.missionProgress),
            );
            return { xp: nextXp, title: nextTitle, recentXpGain: amount };
          }),

        startMission: (missionId) => {
          if (!isMissionId(missionId)) return;
          const state = get();
          const existing = state.missionProgress[missionId];
          const nowMs = Date.now();
          const nextProgress: MissionProgress =
            existing && !existing.completed
              ? existing
              : createInitialProgress(missionId, nowMs);
          set({
            activeMissionId: missionId,
            missionProgress: {
              ...state.missionProgress,
              [missionId]: nextProgress,
            },
          });
          if (!existing || existing.completed) {
            analytics.missionStarted(missionId);
          }
        },

        recordQuizResult: (quizId, stars) => {
          set((state) => {
            if (state.completedQuizzes[quizId] !== undefined) return state;
            const xpAmount =
              stars === 3
                ? XP_AWARDS.quizThreeStars
                : stars === 2
                  ? XP_AWARDS.quizTwoStars
                  : XP_AWARDS.quizOneStar;
            const nextXp = state.xp + xpAmount;
            const nextTitle = resolveTitle(
              nextXp,
              completedMissionIdsList(state.missionProgress),
            );
            const today = todayDateKey();
            const previousDay = state.lastQuizCompletedOn;
            const dayDelta = previousDay ? daysBetweenDateKeys(previousDay, today) : null;
            const nextStreak =
              dayDelta === null
                ? 1
                : dayDelta === 0
                  ? state.quizStreakDays
                  : dayDelta === 1
                    ? state.quizStreakDays + 1
                    : 1;

            return {
              completedQuizzes: { ...state.completedQuizzes, [quizId]: stars },
              xp: nextXp,
              title: nextTitle,
              recentXpGain: xpAmount,
              quizStreakDays: nextStreak,
              lastQuizCompletedOn: today,
            };
          });
          dispatchDomainEvent({ kind: "quiz_completed", quizId });
        },

        claimPatienceReward: (bodyId) => {
          const state = get();
          if (state.gameMode === "explore") return false;
          const today = todayDateKey();
          if (state.patienceRewardedOnByBody[bodyId] === today) return false;
          get().awardXp(XP_AWARDS.bodyPatience);
          set({
            patienceRewardedOnByBody: {
              ...state.patienceRewardedOnByBody,
              [bodyId]: today,
            },
          });
          return true;
        },

        recordPhotoTaken: (targetBodyId) => {
          dispatchDomainEvent({ kind: "photo_taken", targetBodyId });
        },

        restoreFromShareLink: (snapshot) => {
          const state = get();
          const partial = buildShareLinkPartialState(snapshot, state);
          set(partial as Partial<Store>);
          trackShareLinkRestoreAnalytics(snapshot, state);
        },
      };
    },
    {
      name: "heliotrip-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedState => ({
        locale: state.locale,
        gameMode: state.gameMode,
        missionProgress: { ...state.missionProgress },
        visitedBodies: [...state.visitedBodies],
        unlockedAchievements: [...state.unlockedAchievements],
        learningLevel: state.learningLevel,
        xp: state.xp,
        completedQuizzes: { ...state.completedQuizzes },
        leftRailOpen: state.leftRailOpen,
        patienceRewardedOnByBody: { ...state.patienceRewardedOnByBody },
        quizStreakDays: state.quizStreakDays,
        lastQuizCompletedOn: state.lastQuizCompletedOn,
        discoveredConstellations: [...state.discoveredConstellations],
      }),
      merge: (persisted, current): Store => {
        const p = persisted as Partial<PersistedState> | undefined;
        const sanitizedXp = typeof p?.xp === "number" && p.xp >= 0 ? p.xp : 0;
        const sanitizedLevel =
          p?.learningLevel === "middle" || p?.learningLevel === "upper" || p?.learningLevel === "both"
            ? p.learningLevel
            : "middle";
        const sanitizedCompletedMissions = sanitizeMissionProgressMap(p?.missionProgress);
        const completedMissionIds = Object.entries(sanitizedCompletedMissions)
          .filter(([, prog]) => prog.completed)
          .map(([id]) => id);
        return {
          ...current,
          locale: isLocale(p?.locale) ? p.locale : current.locale,
          gameMode: isGameMode(p?.gameMode) ? p.gameMode : current.gameMode,
          missionProgress: sanitizedCompletedMissions,
          visitedBodies: sanitizeVisitedBodies(p?.visitedBodies),
          unlockedAchievements: sanitizeAchievements(p?.unlockedAchievements),
          learningLevel: sanitizedLevel,
          xp: sanitizedXp,
          title: resolveTitle(sanitizedXp, completedMissionIds),
          completedQuizzes:
            typeof p?.completedQuizzes === "object" && p.completedQuizzes !== null
              ? (p.completedQuizzes as Record<string, number>)
              : {},
          leftRailOpen: typeof p?.leftRailOpen === "boolean" ? p.leftRailOpen : true,
          patienceRewardedOnByBody:
            typeof p?.patienceRewardedOnByBody === "object" && p.patienceRewardedOnByBody !== null
              ? (p.patienceRewardedOnByBody as Partial<Record<BodyId, string>>)
              : {},
          quizStreakDays: typeof p?.quizStreakDays === "number" ? p.quizStreakDays : 0,
          lastQuizCompletedOn:
            typeof p?.lastQuizCompletedOn === "string" ? p.lastQuizCompletedOn : null,
          discoveredConstellations: sanitizeDiscoveredConstellations(
            p?.discoveredConstellations,
          ),
        };
      },
    },
  ),
);
