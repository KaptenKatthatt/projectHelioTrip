import type { ConstellationId } from './constellations';
export type { ConstellationId };

/**
 * PER-CONSTELLATION VIEW SETTINGS
 * ================================
 * This is the single file for tuning how each constellation looks when selected.
 * No other files need to be changed — just edit the values here and reload.
 *
 * ─── SPIN_DEG ────────────────────────────────────────────────────────────────
 * Rotation around the line of sight, in degrees. Added on top of the automatic
 * "best fit" roll that the orientation algorithm computes.
 *
 *   0   = accept the auto-fit orientation
 *   90  = rotate 90° clockwise
 *  -90  = rotate 90° counter-clockwise
 *  180  = flip upside-down
 *
 * The user's in-session spin (rotate buttons) stacks on top of this value.
 * When the user switches to a different constellation, this value is re-applied
 * and their interactive spin is reset to zero.
 *
 * ─── TARGET_FOV_DEG ──────────────────────────────────────────────────────────
 * Field-of-view in degrees when this constellation becomes visible.
 * A smaller value = zoomed in (figure appears larger on screen).
 * A larger value  = zoomed out (more surrounding sky is visible).
 *
 * Range: 15° (very tight) to 92° (very wide).
 * The value is applied directly — small values will crop the figure edges,
 * large values will show more surrounding sky. Start with ~40° for a tight
 * but full view and adjust from there. If not set, the camera automatically
 * zooms to show the full figure with a comfortable margin.
 *
 * ─── X_OFFSET / Y_OFFSET ─────────────────────────────────────────────────────
 * Shift the constellation away from screen center, as a fraction of canvas size.
 *
 *   X_OFFSET  +0.1 = 10% to the right    -0.1 = 10% to the left
 *   Y_OFFSET  +0.1 = 10% upward          -0.1 = 10% downward
 *
 * Use these to avoid UI overlap or to give the figure more breathing room.
 * If not set (or 0), the constellation appears centered.
 *
 * ─── HOW TO TUNE ─────────────────────────────────────────────────────────────
 * 1. Find the constellation ID in the tables below.
 * 2. Edit any of the four parameters:
 *    SPIN_DEG       — rotate the figure
 *    TARGET_FOV_DEG — zoom level
 *    X_OFFSET       — horizontal position (fraction of canvas width)
 *    Y_OFFSET       — vertical position   (fraction of canvas height)
 * 3. Reload — no other files need to be edited.
 */

// ─── Spin offsets (degrees) ───────────────────────────────────────────────────

const CONSTELLATION_SPIN_DEG: Partial<Record<ConstellationId, number>> = {
  // Year-round
  // ursaMajor:    0,
  // karlaVagnen:  0,
  // ursaMinor:    0,
  // cassiopeia:   0,

  // Winter
  orion: 270, // Standing pose: belt horizontal, club up-right, bow out left
  // taurus:       0,
  // gemini:       0,
  // canisMajor:   0,

  // Spring
  // leo:          0,

  // Summer
  // cygnus:       0,
  // scorpius:     0,
  // sagittarius:  0,
  // lyra:         0,

  // Autumn
  // aquarius:     0,
  // pegasus:      0,
  // andromeda:    0,
};

// ─── Target FOV (degrees) ────────────────────────────────────────────────────

const CONSTELLATION_TARGET_FOV_DEG: Partial<Record<ConstellationId, number>> = {
  // Year-round
  // ursaMajor:    45,
  // karlaVagnen:  40,
  // ursaMinor:    50,
  // cassiopeia:   35,

  // Winter
  orion: 50,
  taurus: 70,
  // gemini:       45,
  // canisMajor:   50,

  // Spring
  // leo:          45,

  // Summer
  // cygnus:       45,
  // scorpius:     50,
  // sagittarius:  55,
  // lyra:         35,

  // Autumn
  // aquarius:     55,
  // pegasus:      55,
  // andromeda:    50,
};

// ─── Horizontal position offset (fraction of canvas width) ───────────────────

const CONSTELLATION_X_OFFSET: Partial<Record<ConstellationId, number>> = {
  // orion:       0,    // positive = right, negative = left
  // cassiopeia:  0,
  // karlaVagnen: 0,
};

// ─── Vertical position offset (fraction of canvas height) ────────────────────

const CONSTELLATION_Y_OFFSET: Partial<Record<ConstellationId, number>> = {
  // orion:       0,    // positive = up, negative = down
  // cassiopeia:  0,
  // karlaVagnen: 0,
};

// ─── Exports ─────────────────────────────────────────────────────────────────

/** Returns the spin offset for a constellation in radians (used by rendering pipeline). */
export const getConstellationSpinOffsetRad = (id: ConstellationId): number => {
  const deg = CONSTELLATION_SPIN_DEG[id] ?? 0;
  return (deg * Math.PI) / 180;
};

/**
 * Returns the configured initial FOV in degrees when selecting this constellation,
 * or null if no override is set (camera keeps its current FOV).
 */
export const getConstellationTargetFovDeg = (id: ConstellationId): number | null =>
  CONSTELLATION_TARGET_FOV_DEG[id] ?? null;

/**
 * Returns the viewport position offset for a constellation.
 * x: fraction of canvas width  (+= right, -= left).
 * y: fraction of canvas height (+= up,    -= down).
 */
export const getConstellationViewportOffset = (id: ConstellationId): { x: number; y: number } => ({
  x: CONSTELLATION_X_OFFSET[id] ?? 0,
  y: CONSTELLATION_Y_OFFSET[id] ?? 0,
});
