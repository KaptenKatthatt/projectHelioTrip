import { useStore as useZustandStore } from 'zustand';
import {
  QUALITY_PRESETS,
  type QualityLevel,
  type QualityPreset,
} from '../lib/quality/qualityLevels';
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

/**
 * The current rung, for the rare case where an object cannot be reconfigured
 * in place and has to be rebuilt. `ShaderMaterial` is the example: three
 * compiles its program once and caches the uniform list against it, so neither
 * a new `fragmentShader` string nor a replaced `uniforms` object reaches the
 * GPU until the material is recreated. Using this as a `key` is what makes a
 * downgrade of the sky actually take effect.
 */
export const useQualityLevel = (): QualityLevel =>
  useZustandStore(qualityStore, (state) => state.level);
