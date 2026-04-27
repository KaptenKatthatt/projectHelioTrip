import type { ConstellationId } from './constellations';

/**
 * Extra roll around the sky radial (same axis as user rotate buttons), radians.
 * Applied before {@link useStore}'s `constellationUserSpinRad`.
 */
const VIEW_SPIN_OFFSET_RAD: Partial<Record<ConstellationId, number>> = {
  /**
   * Default “standing” Orion: feet line ~horizontal, belt sloping down L→R (~30°),
   * club up-right, bow out left. Tuned against the automated optimal roll.
   */
  orion: (30 * Math.PI) / 4,
};

export const getConstellationViewSpinOffsetRad = (id: ConstellationId): number =>
  VIEW_SPIN_OFFSET_RAD[id] ?? 0;
