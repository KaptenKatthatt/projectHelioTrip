import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BodyId } from '../lib/bodies';
import type { ConstellationId } from '../lib/constellations';
import { isLocale } from '../i18n/translations';
import type { Locale } from '../i18n/translations';
import { analytics } from '../lib/analytics';
import { dateKeyFromLocalDate, daysBetweenDateKeys, todayDateKey } from '../lib/dateUtils';
import {
  sanitizeAchievements,
  sanitizeDiscoveredConstellations,
  sanitizeMissionProgressMap,
  sanitizeVisitedBodies,
} from './sanitizer';
import {
  applyMissionEventProgress,
  recordVisitedBody,
  resolveAchievementTrigger,
  unlockAchievements,
} from '../lib/missions/missionLogic';
import type { Store, PersistedState } from './types';
import {
  type GameMode,
  type MissionDomainEvent,
  type MissionProgress,
  createInitialProgress,
  isGameMode,
} from '../lib/missions/types';
import { getMissionDefinition, isMissionId } from '../lib/missions/missionDefinitions';
import { evaluateMissionStep } from '../lib/missions/missionEvaluator';
import {
  type AchievementId,
  type AchievementTrigger,
  evaluateAchievements,
  isAchievementId,
} from '../lib/missions/achievements';
import { inferShareLinkContextType, type ShareLinkState } from '../lib/shareLink';
import { TIME_SPEED_PRESETS } from '../lib/timePlayback';
import type { FactCardLevel } from '../lib/learning/bodyContent';
import { XP_AWARDS, resolveTitle } from '../lib/learning/xp';
import { createSimulationSlice, type SimulationSlice } from './slices/createSimulationSlice';
import { createGameSlice, type GameSlice } from './slices/createGameSlice';

const completedMissionIdsList = (
  missionProgress: Readonly<Record<string, MissionProgress>>,
): string[] =>
  Object.entries(missionProgress)
    .filter(([, p]) => p.completed)
    .map(([id]) => id);

const dispatchDomainEvent = (event: MissionDomainEvent): void => {
  const state = useStore.getState();
  const nowMs = Date.now();

  applyMissionEventProgress(
    state,
    event,
    nowMs,
    useStore.setState,
    useStore.getState().awardXp,
    useStore.getState().triggerQuiz,
  );

  const achievementTrigger = resolveAchievementTrigger(event);
  if (!achievementTrigger) return;

  unlockAchievements(
    achievementTrigger,
    nowMs,
    state,
    useStore.setState,
    useStore.getState().awardXp,
  );
};

const buildShareLinkPartialState = (snapshot: ShareLinkState, state: Store): Partial<Store> => {
  const partial: Partial<Store> = {};

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
    partial.viewMode = 'close';
    partial.travelId = state.travelId + 1;
    partial.selectedConstellation = null;
    partial.constellationUserSpinRad = 0;
  }
  if (snapshot.missionId !== null) {
    partial.activeMissionId = snapshot.missionId;
    const existing = state.missionProgress[snapshot.missionId];
    partial.missionProgress = {
      ...state.missionProgress,
      [snapshot.missionId]: existing ?? createInitialProgress(snapshot.missionId, Date.now()),
    };
  }

  return partial;
};

const trackShareLinkRestoreAnalytics = (snapshot: ShareLinkState, state: Store): void => {
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

        setTimeScale: (scale) =>
          set((state) => {
            if (state.timeScale !== scale) {
              dispatchDomainEvent({
                kind: 'time_scale_changed',
                daysPerSecond: scale,
              });
            }
            return { timeScale: scale };
          }),

        setNavigationMode: (mode) =>
          set((state) => {
            if (state.navigationMode !== mode) {
              dispatchDomainEvent({
                kind: 'navigation_mode_changed',
                mode,
              });
            }
            return { navigationMode: mode };
          }),

        setGameMode: (mode) =>
          set((state) => {
            if (state.gameMode !== mode) {
              analytics.modeChanged(mode);
            }
            return {
              gameMode: mode,
              activeMissionId: mode === 'explore' ? null : state.activeMissionId,
            };
          }),

        togglePlay: () =>
          set((state) => {
            analytics.playbackToggled(state.isPlaying);
            return { isPlaying: !state.isPlaying };
          }),

        travelTo: (id) => {
          analytics.planetSelected(id);
          const currentState = get();
          const targetSpeed =
            id === 'sun' ? (TIME_SPEED_PRESETS[2] ?? 7) : (TIME_SPEED_PRESETS[0] ?? 0.25);
          const shouldChangeSpeed = currentState.timeScale !== targetSpeed;

          set((state) => ({
            activeBody: id,
            isTraveling: true,
            viewMode: 'close',
            travelId: state.travelId + 1,
            navigationMode: 'cinematic',
            selectedConstellation: null,
            constellationUserSpinRad: 0,
            ...(shouldChangeSpeed ? { timeScale: targetSpeed } : {}),
          }));
          recordVisitedBody(id, currentState, set, currentState.awardXp);
          dispatchDomainEvent({ kind: 'body_focused', bodyId: id });
          if (shouldChangeSpeed) {
            dispatchDomainEvent({
              kind: 'time_scale_changed',
              daysPerSecond: targetSpeed,
            });
          }
        },

        travelToOverview: () => {
          const targetSpeed = TIME_SPEED_PRESETS[2] ?? 7;
          const shouldChangeSpeed = get().timeScale !== targetSpeed;

          set((state) => ({
            isTraveling: true,
            viewMode: 'overview',
            travelId: state.travelId + 1,
            navigationMode: 'cinematic',
            ...(shouldChangeSpeed ? { timeScale: targetSpeed } : {}),
          }));

          if (shouldChangeSpeed) {
            dispatchDomainEvent({
              kind: 'time_scale_changed',
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
            viewMode: 'overview',
            travelId: state.travelId + 1,
            navigationMode: 'cinematic',
            overviewCameraResetId: state.overviewCameraResetId + 1,
            ...(shouldChangeSpeed ? { timeScale: targetSpeed } : {}),
          }));

          if (shouldChangeSpeed) {
            dispatchDomainEvent({
              kind: 'time_scale_changed',
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
              constellationUserSpinRad: keepPose ? state.constellationUserSpinRad : 0,
              isPlaying: false,
              isTraveling: !keepPose,
              viewMode: 'overview',
              travelId: state.travelId,
              navigationMode: 'cinematic',
              skyFocusId: keepPose ? state.skyFocusId : state.skyFocusId + 1,
            };
          });
          dispatchDomainEvent({
            kind: 'constellation_focused',
            constellationId: id,
          });
        },

        awardXp: (amount) =>
          set((state) => {
            if (state.gameMode === 'explore') return state;
            const nextXp = state.xp + amount;
            const nextTitle = resolveTitle(nextXp, completedMissionIdsList(state.missionProgress));
            return { xp: nextXp, title: nextTitle, recentXpGain: amount };
          }),

        startMission: (missionId) => {
          if (!isMissionId(missionId)) return;
          const state = get();
          const existing = state.missionProgress[missionId];
          const nowMs = Date.now();
          const nextProgress: MissionProgress =
            existing && !existing.completed ? existing : createInitialProgress(missionId, nowMs);
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
            const nextTitle = resolveTitle(nextXp, completedMissionIdsList(state.missionProgress));
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
          dispatchDomainEvent({ kind: 'quiz_completed', quizId });
        },

        claimPatienceReward: (bodyId) => {
          const state = get();
          if (state.gameMode === 'explore') return false;
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
          dispatchDomainEvent({ kind: 'photo_taken', targetBodyId });
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
      name: 'heliotrip-preferences',
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
        const sanitizedXp = typeof p?.xp === 'number' && p.xp >= 0 ? p.xp : 0;
        const sanitizedLevel =
          p?.learningLevel === 'middle' ||
          p?.learningLevel === 'upper' ||
          p?.learningLevel === 'both'
            ? p.learningLevel
            : 'middle';
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
            typeof p?.completedQuizzes === 'object' && p?.completedQuizzes !== null
              ? (p?.completedQuizzes as Record<string, number>)
              : {},
          leftRailOpen: typeof p?.leftRailOpen === 'boolean' ? p?.leftRailOpen : true,
          patienceRewardedOnByBody:
            typeof p?.patienceRewardedOnByBody === 'object' && p?.patienceRewardedOnByBody !== null
              ? (p?.patienceRewardedOnByBody as Partial<Record<BodyId, string>>)
              : {},
          quizStreakDays: typeof p?.quizStreakDays === 'number' ? p?.quizStreakDays : 0,
          lastQuizCompletedOn:
            typeof p?.lastQuizCompletedOn === 'string' ? p?.lastQuizCompletedOn : null,
          discoveredConstellations: sanitizeDiscoveredConstellations(p?.discoveredConstellations),
        };
      },
    },
  ),
);
