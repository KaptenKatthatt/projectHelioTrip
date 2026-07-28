/**
 * Boot-time device detection, and the compatibility surface for the code that
 * still speaks in `high | medium | low`.
 *
 * The presets themselves now live in `quality/qualityLevels.ts` and are chosen
 * at runtime by the adaptive controller. What remains here is the first guess
 * made before any frame has been measured, plus the tier vocabulary that
 * `texturePreload.ts` and the existing tests use.
 */

import {
  QUALITY_PRESETS,
  type QualityLevel,
  type QualityPreset,
} from './quality/qualityLevels';
import { getQualityLevel } from './quality/qualityStore';

export type GraphicsTier = 'high' | 'medium' | 'low';

export type { MilkyWayQualityPreset } from './quality/qualityLevels';

type RuntimeDeviceBucket =
  | 'desktop'
  | 'mobile-high'
  | 'mobile-medium'
  | 'mobile-low';

let cachedTier: GraphicsTier | null = null;
let cachedBucket: RuntimeDeviceBucket | null = null;

const detectRuntimeDeviceBucket = (): RuntimeDeviceBucket => {
  if (typeof window === 'undefined') return 'desktop';

  const mobileLike =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(max-width: 768px)').matches;

  if (!mobileLike) return 'desktop';

  const cores =
    typeof navigator.hardwareConcurrency === 'number'
      ? navigator.hardwareConcurrency
      : 4;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 4;

  if (cores >= 8 && memory >= 6) return 'mobile-high';
  if (cores >= 6 && memory >= 4) return 'mobile-medium';
  return 'mobile-low';
};

const detectTier = (): GraphicsTier => {
  if (typeof window === 'undefined') return 'high';

  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData === true) return 'low';

  const bucket = getRuntimeDeviceBucket();
  if (bucket === 'desktop') return 'high';
  if (bucket === 'mobile-high') return 'medium';
  return 'low';
};

export const getRuntimeDeviceBucket = (): RuntimeDeviceBucket => {
  if (cachedBucket !== null) return cachedBucket;
  cachedBucket = detectRuntimeDeviceBucket();
  return cachedBucket;
};

/**
 * The device heuristic, unchanged. It is now only a starting guess: it cannot
 * tell a weak desktop GPU from a strong one, which is why the runtime
 * controller exists. Left intact so `texturePreload` and existing tests keep
 * working.
 */
export const getGraphicsTier = (): GraphicsTier => {
  if (cachedTier !== null) return cachedTier;
  cachedTier = detectTier();
  return cachedTier;
};

/** Where each legacy tier sits on the ladder. */
export const qualityLevelForTier = (tier: GraphicsTier): QualityLevel =>
  tier === 'high' ? 0 : tier === 'medium' ? 2 : 3;

export const isTouchLikeDevice = (): boolean =>
  getRuntimeDeviceBucket() !== 'desktop';

/** Caps devicePixelRatio for the tier. Superseded at runtime by the ladder. */
export const getCanvasDprCap = (tier: GraphicsTier): number => {
  if (typeof window === 'undefined') return 2;
  const raw = window.devicePixelRatio || 1;
  return Math.min(raw, QUALITY_PRESETS[qualityLevelForTier(tier)].dprCap);
};

/**
 * The live preset. Reads the runtime level, so unlike before it can change
 * during a session — callers must not freeze the result in a module constant.
 */
export const getGraphicsPreset = (): QualityPreset =>
  QUALITY_PRESETS[getQualityLevel()];
