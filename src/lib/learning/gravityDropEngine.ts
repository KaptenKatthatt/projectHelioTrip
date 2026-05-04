/**
 * Simple kinematic engine for the Gravity Drop Lab.
 *
 * All objects fall identically under uniform gravity (no air resistance).
 * Uses standard equations of motion:
 *   y(t) = ½ · g · t²
 *   v(t) = g · t
 */

export type DropFrame = {
  /** Current vertical displacement in metres (0 = top). */
  y: number;
  /** Current velocity in m/s. */
  velocity: number;
  /** Elapsed time in seconds since drop. */
  elapsed: number;
  /** Progress from 0 (top) to 1 (ground). */
  progress: number;
  /** Whether the object has reached the ground. */
  hasLanded: boolean;
};

export type ImpactResult = {
  /** Velocity at the moment of impact in m/s. */
  impactVelocity: number;
  /** Total fall duration in seconds. */
  fallDuration: number;
};

/**
 * Computes the fall state at a given elapsed time.
 *
 * @param surfaceGravity Surface gravity in m/s².
 * @param dropHeight Drop height in metres.
 * @param elapsedSeconds Time elapsed since the drop in seconds.
 */
export const computeDropFrame = (
  surfaceGravity: number,
  dropHeight: number,
  elapsedSeconds: number,
): DropFrame => {
  if (
    !Number.isFinite(surfaceGravity) ||
    surfaceGravity <= 0
  ) {
    throw new Error(
      `computeDropFrame: surfaceGravity must be a finite number > 0, got ${surfaceGravity}`,
    );
  }
  if (!Number.isFinite(dropHeight) || dropHeight < 0) {
    throw new Error(
      `computeDropFrame: dropHeight must be a finite number >= 0, got ${dropHeight}`,
    );
  }
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
    throw new Error(
      `computeDropFrame: elapsedSeconds must be a finite number >= 0, got ${elapsedSeconds}`,
    );
  }

  const y = 0.5 * surfaceGravity * elapsedSeconds * elapsedSeconds;
  const velocity = surfaceGravity * elapsedSeconds;

  if (y >= dropHeight) {
    // Clamp to ground level
    const landTime = Math.sqrt((2 * dropHeight) / surfaceGravity);
    const landVelocity = surfaceGravity * landTime;
    return {
      y: dropHeight,
      velocity: landVelocity,
      elapsed: landTime,
      progress: 1,
      hasLanded: true,
    };
  }

  return {
    y,
    velocity,
    elapsed: elapsedSeconds,
    progress: y / dropHeight,
    hasLanded: false,
  };
};

/**
 * Pre-computes the impact result for a given planet and drop height.
 * Useful for showing the result card without running the animation.
 */
export const computeImpactResult = (
  surfaceGravity: number,
  dropHeight: number,
): ImpactResult => {
  if (
    !Number.isFinite(surfaceGravity) ||
    surfaceGravity <= 0
  ) {
    throw new Error(
      `computeImpactResult: surfaceGravity must be a finite number > 0, got ${surfaceGravity}`,
    );
  }
  if (!Number.isFinite(dropHeight) || dropHeight < 0) {
    throw new Error(
      `computeImpactResult: dropHeight must be a finite number >= 0, got ${dropHeight}`,
    );
  }

  const fallDuration = Math.sqrt((2 * dropHeight) / surfaceGravity);
  const impactVelocity = surfaceGravity * fallDuration;
  return { impactVelocity, fallDuration };
};
