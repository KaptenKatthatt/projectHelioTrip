import {
  MAX_QUALITY_LEVEL,
  MIN_QUALITY_LEVEL,
  type QualityLevel,
} from './qualityLevels';
import type { DprStep } from './qualityStore';

/**
 * The policy that decides when to trade picture for frame rate.
 *
 * Pure: no React, no three, no `window`. Every rule below is therefore
 * testable by feeding it scripted windows in vitest's node environment, which
 * matters more here than usual — the failure modes (oscillating forever,
 * never recovering) take minutes of real time to observe by hand.
 */

/** One window's worth of frame timings, already reduced. */
export type FrameWindowStats = {
  readonly sampleCount: number;
  readonly p50FrameMs: number;
  readonly p90FrameMs: number;
  /**
   * The display's own frame interval, learned from the fastest frames seen.
   * Thresholds are expressed as multiples of this rather than absolute
   * milliseconds: under vsync a healthy app sits at exactly the refresh
   * interval, so an absolute "below 50fps" rule can neither detect headroom on
   * a 60Hz panel nor avoid condemning a 144Hz one.
   */
  readonly nativeFrameMs: number;
};

export type AdaptiveState = {
  readonly level: QualityLevel;
  readonly dprStep: DprStep;
  readonly badWindows: number;
  readonly goodWindows: number;
  readonly cooldownWindows: number;
  readonly probationWindows: number;
  /** Best level still allowed. Raised permanently when an upgrade fails. */
  readonly floorLevel: QualityLevel;
  readonly upgradeAttempts: Readonly<Partial<Record<QualityLevel, number>>>;
};

export type AdaptiveDecision =
  | { readonly kind: 'hold' }
  | { readonly kind: 'dpr'; readonly dprStep: DprStep; readonly reason: 'slow' | 'headroom' }
  | {
      readonly kind: 'level';
      readonly level: QualityLevel;
      readonly reason: 'slow' | 'panic' | 'headroom' | 'probation-revert';
    };

/**
 * Two, not dozens. The window is a fixed span of *time*, so on a machine
 * managing two frames a second it closes with two samples — and that scarcity
 * is the strongest evidence of trouble there is, not a reason to withhold
 * judgement. Earlier drafts required 45 and then 8, and both fell silent on
 * precisely the hardware this controller exists to rescue. The percentile is
 * coarse at this size; the conclusion is not in doubt.
 */
export const MIN_SAMPLES = 2;
export const BAD_RATIO = 1.35;
export const GOOD_RATIO = 1.08;
export const PANIC_RATIO = 3;
export const BAD_WINDOWS_TO_ACT = 2;
export const GOOD_WINDOWS_TO_ACT = 15;
export const COOLDOWN_WINDOWS = 4;
export const PROBATION_WINDOWS = 10;
export const MAX_UPGRADE_ATTEMPTS_PER_LEVEL = 1;
export const MAX_DPR_STEP: DprStep = 2;

export const createAdaptiveState = (
  level: QualityLevel,
  dprStep: DprStep = 0,
  floorLevel: QualityLevel = MIN_QUALITY_LEVEL,
): AdaptiveState => ({
  level,
  dprStep,
  badWindows: 0,
  goodWindows: 0,
  cooldownWindows: 0,
  probationWindows: 0,
  floorLevel,
  upgradeAttempts: {},
});

const stepDown = (step: DprStep): DprStep => Math.min(MAX_DPR_STEP, step + 1) as DprStep;
const stepUp = (step: DprStep): DprStep => Math.max(0, step - 1) as DprStep;
const worseLevel = (level: QualityLevel): QualityLevel =>
  Math.min(MAX_QUALITY_LEVEL, level + 1) as QualityLevel;
const betterLevel = (level: QualityLevel): QualityLevel =>
  Math.max(MIN_QUALITY_LEVEL, level - 1) as QualityLevel;

/** Applied after every change, so the rebuild hitch is never itself measured. */
const withCooldown = (state: AdaptiveState): AdaptiveState => ({
  ...state,
  badWindows: 0,
  goodWindows: 0,
  cooldownWindows: COOLDOWN_WINDOWS,
});

export const decideQualityChange = (
  state: AdaptiveState,
  stats: FrameWindowStats,
): { readonly decision: AdaptiveDecision; readonly next: AdaptiveState } => {
  const hold = (next: AdaptiveState) => ({ decision: { kind: 'hold' } as const, next });

  // Too few frames to say anything; discard rather than guess.
  if (stats.sampleCount < MIN_SAMPLES) return hold(state);

  if (state.cooldownWindows > 0) {
    return hold({ ...state, cooldownWindows: state.cooldownWindows - 1 });
  }

  const badThreshold = stats.nativeFrameMs * BAD_RATIO;
  const goodThreshold = stats.nativeFrameMs * GOOD_RATIO;
  const isBad = stats.p90FrameMs > badThreshold;
  const isGood = stats.p90FrameMs <= goodThreshold;
  const isPanic = stats.p90FrameMs > stats.nativeFrameMs * PANIC_RATIO;

  // A bad window during probation means the upgrade we just tried does not
  // hold. Revert it and bar that rung for the rest of the session — this is
  // what stops the classic flip-flop between two levels.
  if (state.probationWindows > 0 && isBad) {
    const reverted = worseLevel(state.level);
    return {
      decision: { kind: 'level', level: reverted, reason: 'probation-revert' },
      next: withCooldown({
        ...state,
        level: reverted,
        dprStep: 0,
        floorLevel: reverted,
        probationWindows: 0,
      }),
    };
  }

  const probationWindows = Math.max(0, state.probationWindows - 1);
  const badWindows = isBad ? state.badWindows + 1 : 0;
  const goodWindows = isGood ? state.goodWindows + 1 : 0;
  const counted: AdaptiveState = { ...state, badWindows, goodWindows, probationWindows };

  if (isPanic) {
    if (state.dprStep < MAX_DPR_STEP) {
      const dprStep = stepDown(state.dprStep);
      return {
        decision: { kind: 'dpr', dprStep, reason: 'slow' },
        next: withCooldown({ ...counted, dprStep }),
      };
    }
    if (state.level < MAX_QUALITY_LEVEL) {
      const level = worseLevel(state.level);
      return {
        decision: { kind: 'level', level, reason: 'panic' },
        next: withCooldown({ ...counted, level, dprStep: 0 }),
      };
    }
    return hold(counted);
  }

  if (badWindows >= BAD_WINDOWS_TO_ACT) {
    // Resolution first: it is a renderer call, not a rebuild.
    if (state.dprStep < MAX_DPR_STEP) {
      const dprStep = stepDown(state.dprStep);
      return {
        decision: { kind: 'dpr', dprStep, reason: 'slow' },
        next: withCooldown({ ...counted, dprStep }),
      };
    }
    if (state.level < MAX_QUALITY_LEVEL) {
      const level = worseLevel(state.level);
      return {
        decision: { kind: 'level', level, reason: 'slow' },
        next: withCooldown({ ...counted, level, dprStep: 0 }),
      };
    }
    return hold(counted);
  }

  if (goodWindows >= GOOD_WINDOWS_TO_ACT) {
    // Resolution comes back first — cheap and reversible without a hitch.
    if (state.dprStep > 0) {
      const dprStep = stepUp(state.dprStep);
      return {
        decision: { kind: 'dpr', dprStep, reason: 'headroom' },
        next: withCooldown({ ...counted, dprStep }),
      };
    }

    const target = betterLevel(state.level);
    const attempts = state.upgradeAttempts[target] ?? 0;
    /**
     * Under vsync a comfortable frame time looks the same whether the GPU is
     * at 10% or 95%, so there is no way to read spare capacity — an upgrade is
     * always a guess. It is therefore attempted at most once per rung and
     * watched for a probation period afterwards.
     */
    if (
      target < state.level &&
      target >= state.floorLevel &&
      attempts < MAX_UPGRADE_ATTEMPTS_PER_LEVEL
    ) {
      return {
        decision: { kind: 'level', level: target, reason: 'headroom' },
        next: {
          ...withCooldown({ ...counted, level: target, dprStep: 0 }),
          probationWindows: PROBATION_WINDOWS,
          upgradeAttempts: { ...state.upgradeAttempts, [target]: attempts + 1 },
        },
      };
    }
    return hold({ ...counted, goodWindows: 0 });
  }

  return hold(counted);
};
