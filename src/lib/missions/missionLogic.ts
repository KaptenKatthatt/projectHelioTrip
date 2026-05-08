import { analytics } from '../analytics';
import { type MissionDomainEvent, type MissionProgress } from './types';
import { getMissionDefinition } from './missionDefinitions';
import { evaluateMissionStep } from './missionEvaluator';
import { type AchievementId, type AchievementTrigger, evaluateAchievements } from './achievements';
import { XP_AWARDS } from '../learning/xp';
import type { BodyId } from '../bodies';
import type { Store } from '../store/useStore';

export const applyMissionEventProgress = (
  state: Store,
  event: MissionDomainEvent,
  nowMs: number,
  setState: (update: Partial<Store>) => void,
  awardXp: (amount: number) => void,
  triggerQuiz: (quizId: string) => void,
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

  setState({
    missionProgress: {
      ...state.missionProgress,
      [mission.id]: result.progress,
    },
  });
  for (const stepId of result.newlyCompletedStepIds) {
    analytics.missionStepCompleted(mission.id, stepId);
    awardXp(XP_AWARDS.missionStepCompleted);
    const stepDef = mission.steps.find((s) => s.id === stepId);
    if (stepDef?.triggersQuizId) {
      triggerQuiz(stepDef.triggersQuizId);
    }
  }
  if (!result.missionJustCompleted) return;
  analytics.missionCompleted(mission.id);
  const isAdventure = mission.id === 'water_hunt' || mission.id === 'gravity_sling';
  awardXp(isAdventure ? XP_AWARDS.adventureMissionCompleted : XP_AWARDS.missionCompleted);
  // Note: unlockAchievements is handled by the coordinator (dispatchDomainEvent)
};

export const resolveAchievementTrigger = (event: MissionDomainEvent): AchievementTrigger | null => {
  if (event.kind === 'body_focused') {
    return { kind: 'body_visited', bodyId: event.bodyId };
  }
  if (event.kind === 'navigation_mode_changed' && event.mode === 'free') {
    return { kind: 'free_flight_activated' };
  }
  if (event.kind === 'constellation_focused') {
    return { kind: 'constellation_focused' };
  }
  return null;
};

export const unlockAchievements = (
  trigger: AchievementTrigger,
  nowMs: number,
  state: Store,
  setState: (update: Partial<Store>) => void,
  awardXp: (amount: number) => void,
): void => {
  const newly = evaluateAchievements(trigger, state.unlockedAchievements);
  if (newly.length === 0) return;
  const latest = newly[newly.length - 1];
  if (!latest) return;
  const merged = [...state.unlockedAchievements, ...newly];
  setState({
    unlockedAchievements: merged,
    recentAchievement: { id: latest, unlockedAtMs: nowMs },
  });
  for (const id of newly) {
    analytics.achievementUnlocked(id);
  }
};

export const recordVisitedBody = (
  id: BodyId,
  state: Store,
  setState: (update: Partial<Store>) => void,
  awardXp: (amount: number) => void,
): void => {
  if (state.visitedBodies.includes(id)) return;
  const next = [...state.visitedBodies, id];
  setState({ visitedBodies: next });
  analytics.checklistProgress(next.length);
  awardXp(XP_AWARDS.bodyVisited);
};
