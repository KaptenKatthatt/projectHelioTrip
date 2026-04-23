import { Vector3 } from 'three';
import type { PlanetId } from './planets';

export type MoonId =
  | 'moon'
  | 'io'
  | 'europa'
  | 'ganymede'
  | 'callisto'
  | 'titan'
  | 'triton';

export type MoonDefinition = {
  id: MoonId;
  parent: PlanetId;
  radius: number;
  color: string;
  /** Mean orbital radius (AU), used for the fallback circle before NASA data lands. */
  fallbackDistanceAu: number;
  /**
   * Sidereal rotation period in hours. All listed moons are tidally
   * locked, so this equals the orbital period. Negative = retrograde.
   */
  rotationPeriodHours: number;
};

/**
 * Distance multiplier applied to moon positions (AU -> scene units).
 * Uses a larger scale than AU_SCALE so sub-AU orbits remain legible
 * next to the parent planet without visually overlapping the body.
 */
export const MOON_AU_SCALE = 1500;

export const MOONS: readonly MoonDefinition[] = [
  {
    id: 'moon',
    parent: 'earth',
    radius: 0.27,
    color: '#c9c9c4',
    fallbackDistanceAu: 0.00257,
    rotationPeriodHours: 655.72,
  },
  {
    id: 'io',
    parent: 'jupiter',
    radius: 0.45,
    color: '#e7d264',
    fallbackDistanceAu: 0.00282,
    rotationPeriodHours: 42.46,
  },
  {
    id: 'europa',
    parent: 'jupiter',
    radius: 0.4,
    color: '#d9c7a1',
    fallbackDistanceAu: 0.00449,
    rotationPeriodHours: 85.23,
  },
  {
    id: 'ganymede',
    parent: 'jupiter',
    radius: 0.65,
    color: '#9a8f7d',
    fallbackDistanceAu: 0.00716,
    rotationPeriodHours: 171.71,
  },
  {
    id: 'callisto',
    parent: 'jupiter',
    radius: 0.6,
    color: '#6a665c',
    fallbackDistanceAu: 0.01259,
    rotationPeriodHours: 400.54,
  },
  {
    id: 'titan',
    parent: 'saturn',
    radius: 0.6,
    color: '#d6a867',
    fallbackDistanceAu: 0.00817,
    rotationPeriodHours: 382.68,
  },
  {
    id: 'triton',
    parent: 'neptune',
    radius: 0.4,
    color: '#c8d3de',
    fallbackDistanceAu: 0.00237,
    rotationPeriodHours: -141.05,
  },
];

const MOON_MAP: ReadonlyMap<MoonId, MoonDefinition> = new Map(
  MOONS.map((m) => [m.id, m]),
);

export const getMoon = (id: MoonId): MoonDefinition | undefined =>
  MOON_MAP.get(id);

/**
 * Returns the seed offset from the parent planet (in scene units) used
 * before the first NASA ephemeris tick resolves. Distributes moons
 * around the orbit so they don't all overlap at the same point.
 */
export const getFallbackMoonOffset = (
  moon: MoonDefinition,
  index: number,
  total: number,
  target?: Vector3,
): Vector3 => {
  const out = target ?? new Vector3();
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  const r = moon.fallbackDistanceAu * MOON_AU_SCALE;
  out.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
  return out;
};
