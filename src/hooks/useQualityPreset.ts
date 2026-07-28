import { useStore as useZustandStore } from 'zustand';
import { QUALITY_PRESETS, type QualityLevel, type QualityPreset } from '../lib/quality/qualityLevels';
import { qualityStore } from '../lib/quality/qualityStore';

/**
 * Render-time access to the current quality preset.
 *
 * Aliased away from the app's own `useStore` on purpose — both names are in
 * scope across the scene files and confusing them is easy.
 *
 * Always pass a selector that narrows to the fields a component actually uses,
 * so a level change only re-renders what it must. Frame loops should call
 * `getQualityPreset()` instead and skip React entirely.
 */
export const useQualityPreset = <T,>(select: (preset: QualityPreset) => T): T =>
  useZustandStore(qualityStore, (state) => select(QUALITY_PRESETS[state.level]));

export const useQualityLevel = (): QualityLevel =>
  useZustandStore(qualityStore, (state) => state.level);

/**
 * Increments on every level change. Use it as a `key` where an object cannot
 * be reconfigured in place and has to be rebuilt.
 */
export const useQualityEpoch = (): number =>
  useZustandStore(qualityStore, (state) => state.epoch);
