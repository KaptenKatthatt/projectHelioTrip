/**
 * Gravity Lab data: surface gravity values (NASA Planetary Fact Sheets)
 * and droppable object definitions for the drop experiment.
 */

export type GravityPlanetId =
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'moon'
  | 'pluto';

export type GravityPlanetInfo = {
  readonly id: GravityPlanetId;
  /** Surface gravity in m/s² (NASA Planetary Fact Sheets). */
  readonly surfaceGravity: number;
  readonly emoji: string;
  readonly color: string;
};

export const GRAVITY_PLANETS: readonly GravityPlanetInfo[] = [
  { id: 'mercury', surfaceGravity: 3.7, emoji: '☿️', color: '#a79681' },
  { id: 'venus', surfaceGravity: 8.87, emoji: '♀️', color: '#e1b07e' },
  { id: 'earth', surfaceGravity: 9.81, emoji: '🌍', color: '#4e92e0' },
  { id: 'moon', surfaceGravity: 1.62, emoji: '🌙', color: '#c8c8c8' },
  { id: 'mars', surfaceGravity: 3.72, emoji: '🔴', color: '#c1440e' },
  { id: 'jupiter', surfaceGravity: 24.79, emoji: '🟠', color: '#d4a373' },
  { id: 'saturn', surfaceGravity: 10.44, emoji: '🪐', color: '#e8d6a6' },
  { id: 'uranus', surfaceGravity: 8.87, emoji: '🔵', color: '#9ec6e0' },
  { id: 'neptune', surfaceGravity: 11.15, emoji: '💙', color: '#4666ff' },
  { id: 'pluto', surfaceGravity: 0.62, emoji: '⚫', color: '#c9b6a0' },
];

export const getGravityPlanet = (id: GravityPlanetId): GravityPlanetInfo | undefined =>
  GRAVITY_PLANETS.find((p) => p.id === id);

// -- Droppable objects --

export type ImpactType = 'splat' | 'crash' | 'thud';

export type DroppableObjectId = 'apple' | 'car' | 'elephant';

export type DroppableObject = {
  readonly id: DroppableObjectId;
  /** Mass in kilograms (for display only — does NOT affect fall speed). */
  readonly mass: number;
  readonly emoji: string;
  readonly impactType: ImpactType;
};

export const DROPPABLE_OBJECTS: readonly DroppableObject[] = [
  { id: 'apple', mass: 0.2, emoji: '🍎', impactType: 'splat' },
  { id: 'car', mass: 1500, emoji: '🚗', impactType: 'crash' },
  { id: 'elephant', mass: 5000, emoji: '🐘', impactType: 'thud' },
];

export const getDroppableObject = (id: DroppableObjectId): DroppableObject | undefined =>
  DROPPABLE_OBJECTS.find((o) => o.id === id);

/** Drop height in metres (constant for all experiments). ~5-storey building. */
export const DROP_HEIGHT_METERS = 20;
