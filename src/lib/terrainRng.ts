/**
 * A simple seeded random number generator for deterministic terrain/rock placement.
 * Matches the implementation used in MarsSurface and MoonSurface.
 */
export const terrainRng = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0xffff_ffff;
  };
};
