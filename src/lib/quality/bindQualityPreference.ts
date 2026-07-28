import { useStore } from '../../store/useStore';
import { resolveQualitySeed } from './initializeQuality';
import { clampQualityLevel, type GraphicsQualityPreference } from './qualityLevels';
import { setQualityLevel } from './qualityStore';

/**
 * Keeps the live quality level in step with the user's choice.
 *
 * Subscribed with a manual comparison rather than zustand's selector form:
 * that requires the `subscribeWithSelector` middleware, and adding middleware
 * to an already `persist`-wrapped store is a larger change than it looks.
 */
export const applyQualityPreference = (
  preference: GraphicsQualityPreference,
): void => {
  if (preference === 'auto') {
    // Hand control back at whatever boot decided; the controller takes over
    // from there rather than inheriting a level the user pinned.
    setQualityLevel(resolveQualitySeed().level, 'auto');
    return;
  }
  setQualityLevel(clampQualityLevel(preference), 'user');
};

export const bindQualityPreference = (): (() => void) => {
  let previous = useStore.getState().graphicsQuality;
  applyQualityPreference(previous);

  return useStore.subscribe((state) => {
    if (state.graphicsQuality === previous) return;
    previous = state.graphicsQuality;
    applyQualityPreference(previous);
  });
};
