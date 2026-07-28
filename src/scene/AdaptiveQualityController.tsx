import { useMemo } from 'react';
import { useAdaptiveQuality } from '../hooks/useAdaptiveQuality';
import { resolveQualitySeed } from '../lib/quality/initializeQuality';

/**
 * Mount point for the adaptive controller, replacing the old one-shot
 * performance probe. Must live inside the Canvas so it can register a frame
 * callback.
 */
export const AdaptiveQualityController = () => {
  // The probe already ran at boot; this only reads back what it found.
  const seed = useMemo(() => resolveQualitySeed(), []);
  useAdaptiveQuality({
    renderer: seed.renderer,
    initialFloorLevel: seed.floorLevel,
  });
  return null;
};
