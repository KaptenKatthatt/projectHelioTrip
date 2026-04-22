export type PlanetId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune';

export const HORIZONS_COMMAND_IDS: Record<PlanetId, number> = {
  sun: 10,
  mercury: 199,
  venus: 299,
  earth: 399,
  mars: 499,
  jupiter: 599,
  saturn: 699,
  uranus: 799,
  neptune: 899,
};

export const PLANET_IDS = Object.keys(HORIZONS_COMMAND_IDS) as readonly PlanetId[];

export const isPlanetId = (value: string): value is PlanetId =>
  Object.prototype.hasOwnProperty.call(HORIZONS_COMMAND_IDS, value);
