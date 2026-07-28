import { isQualityLevel, type QualityLevel } from './qualityLevels';
import type { DprStep } from './qualityStore';

/**
 * Remembers what this machine settled on, so the second visit opens at the
 * right level instead of spending its first half-minute finding it again.
 *
 * Deliberately outside the app's `persist` store: this is a fact about the
 * hardware, not a user preference, and the persisted state is conceptually
 * shareable through `restoreFromShareLink`.
 */

const STORAGE_KEY = 'heliotrip-quality-profile';
const VERSION = 1;
const FAILED_LEVEL_TTL_MS = 30 * 24 * 3600 * 1000;
const PROFILE_TTL_MS = 90 * 24 * 3600 * 1000;

export type StoredQualityProfile = {
  readonly v: number;
  readonly gpuKey: string;
  readonly lastStableLevel: QualityLevel;
  readonly lastStableDprStep: DprStep;
  readonly failedLevels: readonly QualityLevel[];
  readonly updatedAtMs: number;
};

/**
 * Screen size is part of the key on purpose: the same laptop docked to a 4K
 * monitor has to render four times the pixels, and the answer changes.
 */
export const buildGpuKey = (renderer: string | null): string => {
  if (typeof window === 'undefined') return 'ssr';
  const width = window.screen?.width ?? 0;
  const height = window.screen?.height ?? 0;
  const dpr = window.devicePixelRatio || 1;
  return `${renderer ?? 'unknown'}|${width}x${height}|${dpr}`;
};

const isDprStep = (value: unknown): value is DprStep =>
  value === 0 || value === 1 || value === 2;

export const readQualityProfile = (gpuKey: string): StoredQualityProfile | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredQualityProfile>;
    if (parsed?.v !== VERSION) return null;
    if (parsed.gpuKey !== gpuKey) return null;
    if (!isQualityLevel(parsed.lastStableLevel)) return null;
    if (!isDprStep(parsed.lastStableDprStep)) return null;
    if (typeof parsed.updatedAtMs !== 'number') return null;

    const age = Date.now() - parsed.updatedAtMs;
    if (age > PROFILE_TTL_MS || age < 0) return null;

    // Driver and browser updates change what a machine can do, so a level that
    // failed once should not be barred forever.
    const failedLevels =
      age > FAILED_LEVEL_TTL_MS || !Array.isArray(parsed.failedLevels)
        ? []
        : parsed.failedLevels.filter(isQualityLevel);

    return {
      v: VERSION,
      gpuKey,
      lastStableLevel: parsed.lastStableLevel,
      lastStableDprStep: parsed.lastStableDprStep,
      failedLevels,
      updatedAtMs: parsed.updatedAtMs,
    };
  } catch {
    return null;
  }
};

export const writeQualityProfile = (
  profile: Omit<StoredQualityProfile, 'v' | 'updatedAtMs'>,
): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...profile, v: VERSION, updatedAtMs: Date.now() }),
    );
  } catch {
    // Safari private mode throws on setItem, and quota errors are real.
    // Losing the hint is harmless; the controller just re-derives it.
  }
};
