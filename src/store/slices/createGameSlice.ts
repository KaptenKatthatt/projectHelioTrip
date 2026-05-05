/**
 * Game and Progression State Slice
 * 
 * Handles game modes, mission progress, achievements, XP, and learning 
 * features like quizzes and streaks.
 * 
 * Key Variables:
 * - gameMode: 'explore', 'learn', or 'challenge'.
 * - xp: Total experience points earned.
 * - missionProgress: Status of all started or completed missions.
 * - gravityLabActive: Toggle for the Phase 4 Gravity Lab sandbox.
 */
import type { StateCreator } from 'zustand';
import type { BodyId } from '../../lib/bodies';
import type { ConstellationId } from '../../lib/constellations';
import type { GameMode, MissionProgress } from '../../lib/missions/types';
import type { AchievementId } from '../../lib/missions/achievements';
import type { TitleId } from '../../lib/learning/xp';
import type { FactCardLevel } from '../../lib/learning/bodyContent';

export interface RecentAchievement {
  readonly id: AchievementId;
  readonly unlockedAtMs: number;
}

export interface GameState {
  gameMode: GameMode;
  activeMissionId: string | null;
  missionProgress: Readonly<Record<string, MissionProgress>>;
  visitedBodies: ReadonlyArray<BodyId>;
  unlockedAchievements: ReadonlyArray<AchievementId>;
  recentAchievement: RecentAchievement | null;
  learningLevel: FactCardLevel;
  xp: number;
  title: TitleId;
  completedQuizzes: Readonly<Record<string, number>>;
  pendingQuizId: string | null;
  recentXpGain: number | null;
  patienceRewardedOnByBody: Readonly<Partial<Record<BodyId, string>>>;
  quizStreakDays: number;
  lastQuizCompletedOn: string | null;
  discoveredConstellations: ReadonlyArray<ConstellationId>;
  gravityLabActive: boolean;
  sunMassMultiplier: number;
  gravityLabResetTrigger: number;
}

export interface GameActions {
  setGameMode: (mode: GameMode) => void;
  startMission: (missionId: string) => void;
  abandonMission: () => void;
  acknowledgeAchievement: () => void;
  setLearningLevel: (level: FactCardLevel) => void;
  awardXp: (amount: number) => void;
  recordQuizResult: (quizId: string, stars: number) => void;
  triggerQuiz: (quizId: string) => void;
  dismissQuiz: () => void;
  acknowledgeXpGain: () => void;
  claimPatienceReward: (bodyId: BodyId) => boolean;
  setGravityLabActive: (active: boolean) => void;
  setSunMassMultiplier: (multiplier: number) => void;
  triggerGravityLabReset: () => void;
}

export type GameSlice = GameState & GameActions;

export const createGameSlice: StateCreator<GameSlice, [], [], GameSlice> = (set) => ({
  gameMode: 'explore',
  activeMissionId: null,
  missionProgress: {},
  visitedBodies: [],
  unlockedAchievements: [],
  recentAchievement: null,
  learningLevel: 'middle',
  xp: 0,
  title: 'rookie',
  completedQuizzes: {},
  pendingQuizId: null,
  recentXpGain: null,
  patienceRewardedOnByBody: {},
  quizStreakDays: 0,
  lastQuizCompletedOn: null,
  discoveredConstellations: [],
  gravityLabActive: false,
  sunMassMultiplier: 1.0,
  gravityLabResetTrigger: 0,

  setGameMode: (mode) => set((state) => ({ gameMode: mode, activeMissionId: mode === 'explore' ? null : state.activeMissionId })),
  startMission: (_missionId) => {}, // Placeholder, will be implemented in store.ts
  abandonMission: () => set({ activeMissionId: null }),
  acknowledgeAchievement: () => set({ recentAchievement: null }),
  setLearningLevel: (level) => set({ learningLevel: level }),
  awardXp: (_amount) => {}, // Placeholder
  recordQuizResult: (_quizId, _stars) => {}, // Placeholder
  triggerQuiz: (quizId) => set({ pendingQuizId: quizId }),
  dismissQuiz: () => set({ pendingQuizId: null }),
  acknowledgeXpGain: () => set({ recentXpGain: null }),
  claimPatienceReward: (_bodyId) => false, // Placeholder
  setGravityLabActive: (active) => set({ gravityLabActive: active }),
  setSunMassMultiplier: (multiplier) => set({ sunMassMultiplier: multiplier }),
  triggerGravityLabReset: () => set((state) => ({ gravityLabResetTrigger: state.gravityLabResetTrigger + 1, sunMassMultiplier: 1.0 })),
});
