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

export type ViewMode = "close" | "overview";

export type NavigationMode = "cinematic" | "free";

export type RecentAchievement = {
  readonly id: AchievementId;
  readonly unlockedAtMs: number;
};

export type SimulationState = {
  activeBody: BodyId | null;
  cameraPosition: Vector3;
  isTraveling: boolean;
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
  skyFocusId: number;
  // Phase 3 additions
  gameMode: GameMode;
  activeMissionId: string | null;
  missionProgress: Readonly<Record<string, MissionProgress>>;
  visitedBodies: ReadonlyArray<BodyId>;
  unlockedAchievements: ReadonlyArray<AchievementId>;
  recentAchievement: RecentAchievement | null;
};

export type SimulationActions = {
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
  // Phase 3 additions
  setGameMode: (mode: GameMode) => void;
  startMission: (missionId: string) => void;
  abandonMission: () => void;
  acknowledgeAchievement: () => void;
  restoreFromShareLink: (state: ShareLinkState) => void;
};

export type Store = SimulationState & SimulationActions;

const DEFAULT_CAMERA_POSITION = INITIAL_OVERVIEW_CAMERA_POSITION.clone();

type PersistedState = {
  locale: Locale;
  gameMode: GameMode;
  missionProgress: Record<string, MissionProgress>;
  visitedBodies: BodyId[];
  unlockedAchievements: AchievementId[];
};

const sanitizeMissionProgressMap = (
  raw: unknown,
): Record<string, MissionProgress> => {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, MissionProgress> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isMissionId(key)) continue;
    if (!value || typeof value !== "object") continue;
    const candidate = value as Partial<MissionProgress>;
    if (
      typeof candidate.missionId !== "string" ||
      candidate.missionId !== key ||
      typeof candidate.startedAtMs !== "number" ||
      typeof candidate.completed !== "boolean" ||
      !Array.isArray(candidate.completedStepIds)
    ) {
      continue;
    }
    out[key] = {
      missionId: key,
      startedAtMs: candidate.startedAtMs,
      completedStepIds: candidate.completedStepIds.filter(
        (id): id is string => typeof id === "string",
      ),
      completed: candidate.completed,
      completedAtMs:
        typeof candidate.completedAtMs === "number"
          ? candidate.completedAtMs
          : null,
    };
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

/**
 * Side-effecting domain dispatcher: runs the pure mission evaluator
 * and achievement matcher against the current store snapshot, then
 * commits the diff back to the store and emits analytics events.
 */
const dispatchDomainEvent = (event: MissionDomainEvent): void => {
  const state = useStore.getState();
  const nowMs = Date.now();

  if (state.activeMissionId !== null) {
    const mission = getMissionDefinition(state.activeMissionId);
    const progress = state.missionProgress[state.activeMissionId];
    if (mission && progress && !progress.completed) {
      const result = evaluateMissionStep({
        mission,
        progress,
        event,
        nowMs,
      });
      if (result.newlyCompletedStepIds.length > 0) {
        useStore.setState({
          missionProgress: {
            ...state.missionProgress,
            [mission.id]: result.progress,
          },
        });
        for (const stepId of result.newlyCompletedStepIds) {
          analytics.missionStepCompleted(mission.id, stepId);
        }
        if (result.missionJustCompleted) {
          analytics.missionCompleted(mission.id);
          unlockAchievements({ kind: "mission_completed" }, nowMs);
        }
      }
    }
  }

  if (event.kind === "body_focused") {
    unlockAchievements({ kind: "body_visited", bodyId: event.bodyId }, nowMs);
  } else if (
    event.kind === "navigation_mode_changed" &&
    event.mode === "free"
  ) {
    unlockAchievements({ kind: "free_flight_activated" }, nowMs);
  } else if (event.kind === "constellation_focused") {
    unlockAchievements({ kind: "constellation_focused" }, nowMs);
  }
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
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      activeBody: null,
      cameraPosition: DEFAULT_CAMERA_POSITION.clone(),
      isTraveling: false,
      simulationTime: new Date(),
      timeScale: 1,
      isPlaying: false,
      viewMode: "overview",
      travelId: 0,
      overviewCameraResetId: 0,
      locale: detectLocale(),
      navigationMode: "cinematic",
      selectedConstellation: null,
      constellationLinesVisible: true,
      skyFocusId: 0,
      gameMode: "explore",
      activeMissionId: null,
      missionProgress: {},
      visitedBodies: [],
      unlockedAchievements: [],
      recentAchievement: null,

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

      setSelectedConstellation: (id) => set({ selectedConstellation: id }),

      focusSkyTarget: (id) => {
        set((state) => {
          if (state.selectedConstellation !== id) {
            analytics.constellationOpened(id);
          }
          return {
            selectedConstellation: id,
            isPlaying: false,
            isTraveling: state.selectedConstellation === null,
            viewMode: "overview",
            travelId:
              state.selectedConstellation === null
                ? state.travelId + 1
                : state.travelId,
            navigationMode: "cinematic",
            skyFocusId:
              state.selectedConstellation === null
                ? state.skyFocusId + 1
                : state.skyFocusId,
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

      restoreFromShareLink: (snapshot) => {
        const state = useStore.getState();
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
        set(partial as Partial<Store>);
        analytics.shareLinkRestored(
          inferShareLinkContextType({
            bodyId: snapshot.bodyId,
            simulationTimeMs:
              snapshot.simulationTimeMs ?? state.simulationTime.getTime(),
            timeScale: snapshot.timeScale ?? state.timeScale,
            gameMode: snapshot.gameMode ?? state.gameMode,
            missionId: snapshot.missionId,
            navigationMode: snapshot.navigationMode ?? state.navigationMode,
          }),
        );
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
      }),
      merge: (persisted, current): Store => {
        const p = persisted as Partial<PersistedState> | undefined;
        return {
          ...current,
          locale: isLocale(p?.locale) ? p.locale : current.locale,
          gameMode: isGameMode(p?.gameMode) ? p.gameMode : current.gameMode,
          missionProgress: sanitizeMissionProgressMap(p?.missionProgress),
          visitedBodies: sanitizeVisitedBodies(p?.visitedBodies),
          unlockedAchievements: sanitizeAchievements(p?.unlockedAchievements),
        };
      },
    },
  ),
);
