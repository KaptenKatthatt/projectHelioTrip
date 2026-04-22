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
};

const au = (distance: number): Vector3 => new Vector3(distance * AU_SCALE, 0, 0);

export const PLANETS: readonly PlanetDefinition[] = [
  { id: 'sun', position: au(0), radius: 6, color: '#fdb813' },
  { id: 'mercury', position: au(0.39), radius: 0.6, color: '#a79681' },
  { id: 'venus', position: au(0.72), radius: 0.95, color: '#e1b07e' },
  { id: 'earth', position: au(1), radius: 1, color: '#4e92e0' },
  { id: 'mars', position: au(1.52), radius: 0.8, color: '#c1440e' },
  { id: 'jupiter', position: au(5.2), radius: 3.5, color: '#d4a373' },
  { id: 'saturn', position: au(9.54), radius: 3, color: '#e8d6a6' },
  { id: 'uranus', position: au(19.2), radius: 2, color: '#9ec6e0' },
  { id: 'neptune', position: au(30.05), radius: 1.9, color: '#4666ff' },
  { id: 'pluto', position: au(39.48), radius: 0.5, color: '#c9b6a0' },
];

const PLANET_MAP: ReadonlyMap<PlanetId, PlanetDefinition> = new Map(
  PLANETS.map((p) => [p.id, p]),
);

export const getPlanet = (id: PlanetId): PlanetDefinition | undefined =>
  PLANET_MAP.get(id);

export const getPlanetPosition = (
  id: PlanetId,
  target?: Vector3,
): Vector3 | null => {
  const planet = PLANET_MAP.get(id);
  if (!planet) return null;
  return (target ?? new Vector3()).copy(planet.position);
};
