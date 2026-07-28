import {
  getGraphicsTier,
  isTouchLikeDevice,
  qualityLevelForTier,
} from '../graphicsTier';
import { probeGpu, seedLevelForGpu } from './gpuProbe';
import { readQualityProfile, buildGpuKey } from './qualityProfileStorage';
import { setQuality } from './qualityStore';
import type { QualityLevel } from './qualityLevels';

/**
 * Picks the level the app opens at, before a single frame has been measured.
 *
 * Order of preference:
 *   1. What this exact machine settled on last time.
 *   2. What its GPU string suggests.
 *   3. The old pointer/cores/memory heuristic.
 *
 * Kept in its own module so `graphicsTier` and `qualityStore` need not import
 * each other.
 */

let cachedSeed: QualitySeed | null = null;

export type QualitySeed = {
  readonly level: QualityLevel;
  readonly dprStep: 0 | 1 | 2;
  readonly floorLevel: QualityLevel;
  readonly renderer: string | null;
  readonly source: 'profile' | 'gpu' | 'heuristic';
};

const computeQualitySeed = (): QualitySeed => {
  const heuristicLevel = qualityLevelForTier(getGraphicsTier());
  const { renderer, gpuClass } = probeGpu();
  const profile = readQualityProfile(buildGpuKey(renderer));

  if (profile) {
    return {
      level: profile.lastStableLevel,
      dprStep: profile.lastStableDprStep,
      floorLevel: profile.failedLevels.length
        ? (Math.max(...profile.failedLevels) as QualityLevel)
        : 0,
      renderer,
      source: 'profile',
    };
  }

  const seeded = seedLevelForGpu(gpuClass, isTouchLikeDevice(), heuristicLevel);
  return {
    level: seeded.level,
    dprStep: seeded.dprStep,
    floorLevel: 0,
    renderer,
    source: gpuClass === 'unknown' ? 'heuristic' : 'gpu',
  };
};

/**
 * Cached: `probeGpu` creates a throwaway WebGL context, and browsers cap how
 * many can be live at once. Later readers get the same answer without paying
 * for a second one.
 */
export const resolveQualitySeed = (): QualitySeed => {
  cachedSeed ??= computeQualitySeed();
  return cachedSeed;
};

/**
 * Tracked separately from `cachedSeed`, not derived from it. Reading the seed
 * and applying it are different events: the module-level texture tables in
 * `textures.ts` resolve the seed while they are being built, which happens
 * before `main.tsx` runs — so a guard keyed on the seed cache would conclude
 * the work was already done, skip the store write entirely, and leave every
 * machine on the default rung however weak its GPU had just been measured.
 */
let applied = false;

/** Idempotent; safe to call from module scope. */
export const initializeQuality = (): QualitySeed => {
  const seed = resolveQualitySeed();
  if (!applied) {
    applied = true;
    setQuality(seed.level, seed.dprStep, 'boot');
  }
  return seed;
};

/** Test seam — production code never needs this. */
export const resetQualityInitialization = (): void => {
  applied = false;
  cachedSeed = null;
};
