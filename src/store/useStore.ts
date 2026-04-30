import { Vector3 } from "three";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BodyId } from "../lib/bodies";
import type { ConstellationId } from "../lib/constellations";
import { detectLocale, isLocale } from "../i18n/translations";
import type { Locale } from "../i18n/translations";
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
import { DEFAULT_TIME_SCALE } from "../lib/timePlayback";
import type { FactCardLevel } from "../lib/learning/bodyContent";
import { type TitleId, XP_AWARDS, resolveTitle } from "../lib/learning/xp";

const completedMissionIdsList = (
  missionProgress: Readonly<Record<string, MissionProgress>>,
): string[] =>
  Object.entries(missionProgress)
    .filter(([, p]) => p.completed)
    .map(([id]) => id);

export type ViewMode = "close" | "overview";

type NavigationMode = "cinematic" | "free";

type RecentAchievement = {
  readonly id: AchievementId;
  readonly unlockedAtMs: number;
};

type SimulationState = {
  activeBody: BodyId | null;
  cameraPosition: Vector3;
  isTraveling: boolean;
  isTravelAnimating: boolean;
  simulationTime: Date;
  timeScale: number;
  isPlaying: boolean;
  viewMode: ViewMode;
  travelId: number;
  overviewCameraResetId: number;
  locale: Locale;
  navigationMode: NavigationMode;
  selectedConstellation: ConstellationId | null;
  constellationLinesVisible: boolean;
  /**
   * Extra spin (rad) around the celestial radial through the constellation center;
   * pedagogical only, cleared when switching constellations.
   */
  constellationUserSpinRad: number;
  skyFocusId: number;
  // Phase 3 additions
  gameMode: GameMode;
  activeMissionId: string | null;
  missionProgress: Readonly<Record<string, MissionProgress>>;
  visitedBodies: ReadonlyArray<BodyId>;
  unlockedAchievements: ReadonlyArray<AchievementId>;
  recentAchievement: RecentAchievement | null;
  /** Mobile-only: planet info bottom sheet open (not persisted). */
  mobilePlanetInfoSheetOpen: boolean;
  // Learning mode additions
  learningLevel: FactCardLevel;
  xp: number;
  title: TitleId;
  completedQuizzes: Readonly<Record<string, number>>;
  /** Quiz id waiting to be presented as an overlay (not persisted). */
  pendingQuizId: string | null;
  /** XP amount from last awardXp call in learn/challenge mode (not persisted). */
  recentXpGain: number | null;
  /** Desktop left navigation rail open state. */
  leftRailOpen: boolean;
  /** Last rewarded day key per body for patience reward gating. */
  patienceRewardedOnByBody: Readonly<Partial<Record<BodyId, string>>>;
  /** Current daily quiz streak count. */
  quizStreakDays: number;
  /** Last date key (YYYY-MM-DD) when a quiz was completed. */
  lastQuizCompletedOn: string | null;
  /** Constellations the user has discovered at least once. */
  discoveredConstellations: ReadonlyArray<ConstellationId>;
};

type SimulationActions = {
  setActiveBody: (id: BodyId | null) => void;
  setCameraPosition: (position: Vector3) => void;
  setIsTraveling: (traveling: boolean) => void;
  setSimulationTime: (time: Date) => void;
  travelTo: (id: BodyId) => void;
  travelToOverview: () => void;
  resetSolarSystemStart: () => void;
  arrive: () => void;
  resetSimulationTime: () => void;
  setTimeScale: (scale: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setViewMode: (mode: ViewMode) => void;
  setLocale: (locale: Locale) => void;
  setNavigationMode: (mode: NavigationMode) => void;
  setSelectedConstellation: (id: ConstellationId | null) => void;
  focusSkyTarget: (id: ConstellationId) => void;
  toggleConstellationLinesVisible: () => void;
  adjustConstellationSpin: (deltaRad: number) => void;
  // Phase 3 additions
  setGameMode: (mode: GameMode) => void;
  startMission: (missionId: string) => void;
  abandonMission: () => void;
  acknowledgeAchievement: () => void;
  restoreFromShareLink: (state: ShareLinkState) => void;
  setMobilePlanetInfoSheetOpen: (open: boolean) => void;
  // Learning mode additions
  setLearningLevel: (level: FactCardLevel) => void;
  awardXp: (amount: number) => void;
  recordQuizResult: (quizId: string, stars: number) => void;
  triggerQuiz: (quizId: string) => void;
  dismissQuiz: () => void;
  acknowledgeXpGain: () => void;
  toggleLeftRail: () => void;
  claimPatienceReward: (bodyId: BodyId) => boolean;
};

export type Store = SimulationState & SimulationActions;

const DEFAULT_CAMERA_POSITION = INITIAL_OVERVIEW_CAMERA_POSITION.clone();

type PersistedState = {
  locale: Locale;
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

/**
 * Side-effecting domain dispatcher: runs the pure mission evaluator
 * and achievement matcher against the current store snapshot, then
 * commits the diff back to the store and emits analytics events.
 */
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
): Partial<SimulationState> => {
  const partial: Partial<SimulationState> = {};

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
    (set) => ({
      activeBody: null,
      cameraPosition: DEFAULT_CAMERA_POSITION.clone(),
      isTraveling: false,
      isTravelAnimating: false,
      simulationTime: new Date(),
      timeScale: DEFAULT_TIME_SCALE,
      isPlaying: false,
      viewMode: "overview",
      travelId: 0,
      overviewCameraResetId: 0,
      locale: detectLocale(),
      navigationMode: "cinematic",
      selectedConstellation: null,
      constellationLinesVisible: true,
      constellationUserSpinRad: 0,
      skyFocusId: 0,
      gameMode: "explore",
      activeMissionId: null,
      missionProgress: {},
      visitedBodies: [],
      unlockedAchievements: [],
      recentAchievement: null,
      mobilePlanetInfoSheetOpen: false,
      learningLevel: "middle",
      xp: 0,
      title: "rookie",
      completedQuizzes: {},
      pendingQuizId: null,
      recentXpGain: null,
      leftRailOpen: true,
      patienceRewardedOnByBody: {},
      quizStreakDays: 0,
      lastQuizCompletedOn: null,
      discoveredConstellations: [],

      setActiveBody: (id) => set({ activeBody: id }),

      setCameraPosition: (position) =>
        set({ cameraPosition: position.clone() }),

      setIsTraveling: (traveling) => set({ isTraveling: traveling }),

      setSimulationTime: (time) => set({ simulationTime: time }),

      travelTo: (id) => {
        analytics.planetSelected(id);
        set((state) => ({
          activeBody: id,
          isTraveling: true,
          viewMode: "close",
          travelId: state.travelId + 1,
          navigationMode: "cinematic",
          selectedConstellation: null,
          constellationUserSpinRad: 0,
        }));
        recordVisitedBody(id);
        dispatchDomainEvent({ kind: "body_focused", bodyId: id });
      },

      travelToOverview: () =>
        set((state) => ({
          isTraveling: true,
          viewMode: "overview",
          travelId: state.travelId + 1,
          navigationMode: "cinematic",
        })),

      resetSolarSystemStart: () => {
        analytics.resetToSolarSystemStart();
        set((state) => ({
          activeBody: null,
          selectedConstellation: null,
          constellationUserSpinRad: 0,
          isTraveling: true,
          viewMode: "overview",
          travelId: state.travelId + 1,
          navigationMode: "cinematic",
          overviewCameraResetId: state.overviewCameraResetId + 1,
        }));
      },

      arrive: () => set({ isTraveling: false }),

      resetSimulationTime: () => set({ simulationTime: new Date() }),

      setTimeScale: (scale) => {
        set({ timeScale: scale });
        dispatchDomainEvent({
          kind: "time_scale_changed",
          daysPerSecond: scale,
        });
      },

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      togglePlay: () =>
        set((state) => {
          analytics.playbackToggled(state.isPlaying);
          return { isPlaying: !state.isPlaying };
        }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setLocale: (locale) =>
        set((state) => {
          if (state.locale !== locale) {
            analytics.languageChanged(locale);
          }
          return { locale };
        }),

      setNavigationMode: (mode) => {
        const previous = useStore.getState().navigationMode;
        set((state) => {
          if (mode === "free" && state.navigationMode !== "free") {
            analytics.freeFlightActivated();
          }
          return { navigationMode: mode };
        });
        if (previous !== mode) {
          dispatchDomainEvent({ kind: "navigation_mode_changed", mode });
        }
      },

      setSelectedConstellation: (id) =>
        set((state) => {
          const keepPose =
            id !== null && id === state.selectedConstellation;
          return {
            selectedConstellation: id,
            constellationUserSpinRad: keepPose
              ? state.constellationUserSpinRad
              : 0,
          };
        }),

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
            // SkyFocusCamera owns constellation transitions. Incrementing `travelId`
            // here would also start CameraManager travel and create competing camera writes.
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

      toggleConstellationLinesVisible: () =>
        set((state) => ({
          constellationLinesVisible: !state.constellationLinesVisible,
        })),

      adjustConstellationSpin: (deltaRad) =>
        set((state) => ({
          constellationUserSpinRad: state.constellationUserSpinRad + deltaRad,
        })),

      setGameMode: (mode) =>
        set((state) => {
          if (state.gameMode === mode) return state;
          analytics.modeChanged(mode);
          const activeMission =
            mode === "explore" ? null : state.activeMissionId;
          return { gameMode: mode, activeMissionId: activeMission };
        }),

      startMission: (missionId) => {
        if (!isMissionId(missionId)) return;
        const state = useStore.getState();
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

      abandonMission: () => {
        const state = useStore.getState();
        if (state.activeMissionId === null) return;
        analytics.missionAbandoned(state.activeMissionId);
        set({ activeMissionId: null });
      },

      acknowledgeAchievement: () => set({ recentAchievement: null }),

      setMobilePlanetInfoSheetOpen: (open) =>
        set({ mobilePlanetInfoSheetOpen: open }),

      setLearningLevel: (level) => set({ learningLevel: level }),

      awardXp: (amount) =>
        set((state) => {
          const nextXp = state.xp + amount;
          const nextTitle = resolveTitle(
            nextXp,
            completedMissionIdsList(state.missionProgress),
          );
          const showGain = state.gameMode !== "explore";
          return { xp: nextXp, title: nextTitle, recentXpGain: showGain ? amount : null };
        }),

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

      triggerQuiz: (quizId) => set({ pendingQuizId: quizId }),

      dismissQuiz: () => set({ pendingQuizId: null }),

      acknowledgeXpGain: () => set({ recentXpGain: null }),

      toggleLeftRail: () =>
        set((state) => ({ leftRailOpen: !state.leftRailOpen })),

      claimPatienceReward: (bodyId) => {
        const state = useStore.getState();
        if (state.gameMode === "explore") return false;
        const today = todayDateKey();
        if (state.patienceRewardedOnByBody[bodyId] === today) return false;
        useStore.getState().awardXp(XP_AWARDS.bodyPatience);
        set({
          patienceRewardedOnByBody: {
            ...state.patienceRewardedOnByBody,
            [bodyId]: today,
          },
        });
        return true;
      },

      restoreFromShareLink: (snapshot) => {
        const state = useStore.getState();
        const partial = buildShareLinkPartialState(snapshot, state);
        set(partial as Partial<Store>);
        trackShareLinkRestoreAnalytics(snapshot, state);
      },
    }),
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
