import { createStore } from 'zustand/vanilla';
import {
  clampQualityLevel,
  QUALITY_PRESETS,
  type QualityLevel,
  type QualityPreset,
} from './qualityLevels';

/**
 * The live graphics quality, held in its own vanilla store.
 *
 * Deliberately *not* part of the app store: that one is wrapped in `persist`,
 * which writes to localStorage on every `set()`, and this value changes far
 * too often to earn a disk write. Only the user's Auto/High/Low *preference*
 * belongs in the persisted store. React Context is out by project rule
 * (`.cursor/rules/project.mdc`), so a subscribable module-level store is the
 * remaining way to let both `useFrame` callbacks and render code read this.
 */

export type QualitySource = 'boot' | 'auto' | 'user';

/**
 * Resolution is trimmed within a level before the level itself drops: changing
 * the pixel ratio is a renderer call with no geometry rebuild and no visible
 * hitch, while a level change rebuilds spheres and instance buffers.
 */
export type DprStep = 0 | 1 | 2;

const DPR_STEP_SCALE: Record<DprStep, number> = { 0: 1, 1: 0.85, 2: 0.72 };

export type QualityState = {
  readonly level: QualityLevel;
  readonly dprStep: DprStep;
  readonly source: QualitySource;
  /** Bumped on every level change, so consumers can key rebuilds off it. */
  readonly epoch: number;
};

const initialState: QualityState = {
  level: 0,
  dprStep: 0,
  source: 'boot',
  epoch: 0,
};

export const qualityStore = createStore<QualityState>(() => initialState);

/** Imperative reads, safe inside `useFrame` — no React work at all. */
export const getQualityLevel = (): QualityLevel => qualityStore.getState().level;

export const getQualityPreset = (): QualityPreset =>
  QUALITY_PRESETS[qualityStore.getState().level];

export const getQualityDprStep = (): DprStep => qualityStore.getState().dprStep;

/** `user` means someone pinned a level by hand; the controller stands down. */
export const getQualitySource = (): QualitySource => qualityStore.getState().source;

/** The pixel ratio to render at: the level's cap, trimmed by the step. */
export const getEffectiveDpr = (devicePixelRatio: number): number => {
  const { level, dprStep } = qualityStore.getState();
  /**
   * The step scales the resolution we would *actually* have rendered at, not
   * the cap. Applying it to the cap first made the axis a no-op on any 1x
   * display — which is most desktops, and precisely where the weak GPUs are.
   */
  const capped = Math.min(devicePixelRatio, QUALITY_PRESETS[level].dprCap);
  const cap = capped * DPR_STEP_SCALE[dprStep];
  /**
   * A 1x display at 0.6 is unacceptably soft, and weak 1x desktops are exactly
   * the machines this exists for — so the floor is higher there than on a
   * display with pixels to spare.
   */
  const floor = devicePixelRatio <= 1 ? 0.6 : 0.5;
  return Math.max(floor, cap);
};

export const setQualityLevel = (level: QualityLevel, source: QualitySource): void => {
  const current = qualityStore.getState();
  if (current.level === level && current.source === source) return;
  qualityStore.setState({
    level,
    dprStep: current.level === level ? current.dprStep : 0,
    source,
    epoch: current.level === level ? current.epoch : current.epoch + 1,
  });
};

/** Does not bump `epoch`: nothing needs rebuilding for a resolution change. */
export const setQualityDprStep = (dprStep: DprStep): void => {
  if (qualityStore.getState().dprStep === dprStep) return;
  qualityStore.setState({ dprStep });
};

export const setQuality = (
  level: QualityLevel,
  dprStep: DprStep,
  source: QualitySource,
): void => {
  const current = qualityStore.getState();
  const levelChanged = current.level !== level;
  if (!levelChanged && current.dprStep === dprStep && current.source === source) return;
  qualityStore.setState({
    level,
    dprStep,
    source,
    epoch: levelChanged ? current.epoch + 1 : current.epoch,
  });
};

export const applyQualityPreference = (
  preference: 'auto' | QualityLevel,
  fallbackLevel: QualityLevel,
): void => {
  if (preference === 'auto') {
    setQualityLevel(fallbackLevel, 'auto');
    return;
  }
  setQualityLevel(clampQualityLevel(preference), 'user');
};

export const subscribeQuality = qualityStore.subscribe;
