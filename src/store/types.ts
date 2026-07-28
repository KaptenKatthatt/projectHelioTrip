import type { BodyId } from '../lib/bodies';
import type { ConstellationId } from '../lib/constellations';
import type { Locale } from '../i18n/translations';
import type { GameMode, MissionProgress } from '../lib/missions/types';
import type { AchievementId } from '../lib/missions/achievements';
import type { FactCardLevel } from '../lib/learning/bodyContent';
import type { SimulationSlice } from './slices/createSimulationSlice';
import type { GameSlice } from './slices/createGameSlice';
import type { ShareLinkState } from '../lib/shareLink';
import type { GraphicsQualityPreference } from '../lib/quality/qualityLevels';

export type Store = SimulationSlice &
  GameSlice & {
    travelTo: (id: BodyId) => void;
    travelToOverview: () => void;
    resetSolarSystemStart: () => void;
    focusSkyTarget: (id: ConstellationId) => void;
    recordPhotoTaken: (targetBodyId: BodyId | null) => void;
    restoreFromShareLink: (state: ShareLinkState) => void;
  };

export type PersistedState = {
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
  graphicsQuality: GraphicsQualityPreference;
};
