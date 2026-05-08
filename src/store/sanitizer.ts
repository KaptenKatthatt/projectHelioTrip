import type { BodyId } from '../lib/bodies';
import type { ConstellationId } from '../lib/constellations';
import type { MissionProgress } from '../lib/missions/types';
import { isMissionId } from '../lib/missions/missionDefinitions';
import { isAchievementId, type AchievementId } from '../lib/missions/achievements';

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const sanitizeMissionProgressEntry = (key: string, value: unknown): MissionProgress | null => {
  if (!isMissionId(key)) return null;
  if (!isObjectRecord(value)) return null;
  const candidate = value as Partial<MissionProgress>;
  if (candidate.missionId !== key) return null;
  if (typeof candidate.startedAtMs !== 'number') return null;
  if (typeof candidate.completed !== 'boolean') return null;
  if (!Array.isArray(candidate.completedStepIds)) return null;

  return {
    missionId: key,
    startedAtMs: candidate.startedAtMs,
    completedStepIds: candidate.completedStepIds.filter(
      (id): id is string => typeof id === 'string',
    ),
    completed: candidate.completed,
    completedAtMs: typeof candidate.completedAtMs === 'number' ? candidate.completedAtMs : null,
  };
};

export const sanitizeMissionProgressMap = (raw: unknown): Record<string, MissionProgress> => {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, MissionProgress> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const sanitized = sanitizeMissionProgressEntry(key, value);
    if (!sanitized) continue;
    out[key] = sanitized;
  }
  return out;
};

export const sanitizeVisitedBodies = (raw: unknown): BodyId[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is BodyId => typeof value === 'string');
};

export const sanitizeAchievements = (raw: unknown): AchievementId[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isAchievementId);
};

export const sanitizeDiscoveredConstellations = (raw: unknown): ConstellationId[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is ConstellationId => typeof value === 'string');
};
