import { useStore as useZustandStore } from 'zustand';
import { QUALITY_PRESETS, type QualityPreset } from '../lib/quality/qualityLevels';
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
