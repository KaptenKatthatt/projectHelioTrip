import { Vector3 } from 'three';
import { AU_SCALE } from './constants';

export type PlanetId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

export type PlanetDefinition = {
  id: PlanetId;
  position: Vector3;
  radius: number;
  color: string;
  /**
   * Sidereal rotation period in hours. Negative = retrograde rotation
   * (Venus, Uranus, Pluto). The Sun uses its equatorial rotation period.
   */
  rotationPeriodHours: number;
};

const au = (distance: number): Vector3 => new Vector3(distance * AU_SCALE, 0, 0);

export const PLANETS: readonly PlanetDefinition[] = [
  { id: 'sun', position: au(0), radius: 6, color: '#fdb813', rotationPeriodHours: 609.12 },
  { id: 'mercury', position: au(0.39), radius: 0.6, color: '#a79681', rotationPeriodHours: 1407.6 },
  { id: 'venus', position: au(0.72), radius: 0.95, color: '#e1b07e', rotationPeriodHours: -5832.5 },
  { id: 'earth', position: au(1), radius: 1, color: '#4e92e0', rotationPeriodHours: 23.9345 },
  { id: 'mars', position: au(1.52), radius: 0.8, color: '#c1440e', rotationPeriodHours: 24.6229 },
  { id: 'jupiter', position: au(5.2), radius: 3.5, color: '#d4a373', rotationPeriodHours: 9.925 },
  { id: 'saturn', position: au(9.54), radius: 3, color: '#e8d6a6', rotationPeriodHours: 10.656 },
  { id: 'uranus', position: au(19.2), radius: 2, color: '#9ec6e0', rotationPeriodHours: -17.24 },
  { id: 'neptune', position: au(30.05), radius: 1.9, color: '#4666ff', rotationPeriodHours: 16.11 },
  { id: 'pluto', position: au(39.48), radius: 0.5, color: '#c9b6a0', rotationPeriodHours: -153.29 },
];

const PLANET_MAP: ReadonlyMap<PlanetId, PlanetDefinition> = new Map(
  PLANETS.map((p) => [p.id, p]),
);

export const getPlanet = (id: PlanetId): PlanetDefinition | undefined =>
  PLANET_MAP.get(id);
