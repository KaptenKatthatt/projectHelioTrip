import { Vector3 } from 'three';
import { PLANETS, type PlanetId } from './planets';

/**
 * Shared, mutable live positions keyed by PlanetId. Seeded with stub
 * positions from the planet registry so consumers can render before
 * real NASA data arrives.
 *
 * The Map itself is stable (no add/remove at runtime); the Vector3
 * instances are mutated in place by useTimeManager. Consumers should
 * copy the value (`.copy(getLivePosition(id))`) if they need a snapshot.
 */
const positions: Map<PlanetId, Vector3> = new Map(
  PLANETS.map((p) => [p.id, p.position.clone()] as const),
);

export const livePositions: ReadonlyMap<PlanetId, Vector3> = positions;

export const getLivePosition = (id: PlanetId): Vector3 => {
  const pos = positions.get(id);
  if (!pos) {
    throw new Error(`No position registered for planet "${id}"`);
  }
  return pos;
};

export const setLivePosition = (
  id: PlanetId,
  x: number,
  y: number,
  z: number,
): void => {
  const pos = positions.get(id);
  if (!pos) {
    throw new Error(`No position registered for planet "${id}"`);
  }
  pos.set(x, y, z);
};
