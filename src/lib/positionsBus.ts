import { Vector3 } from 'three';
import { PLANETS, type PlanetId } from './planets';
import { getFallbackMoonOffset, MOONS, type MoonId } from './moons';
import {
  computeSatelliteOffset,
  SATELLITES,
  type SatelliteId,
} from './satellites';

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

/**
 * Moon offsets are stored *relative* to their parent planet in scene
 * units. World position = parent live position + relative offset.
 * Seeded with a spread fallback circle per parent so moons don't stack
 * on top of each other before the first ephemeris tick.
 */
const moonOffsets: Map<MoonId, Vector3> = (() => {
  const map = new Map<MoonId, Vector3>();
  const byParent = new Map<PlanetId, typeof MOONS[number][]>();
  for (const moon of MOONS) {
    const list = byParent.get(moon.parent) ?? [];
    list.push(moon);
    byParent.set(moon.parent, list);
  }
  for (const siblings of byParent.values()) {
    siblings.forEach((moon, i) => {
      map.set(moon.id, getFallbackMoonOffset(moon, i, siblings.length));
    });
  }
  return map;
})();

export const liveMoonOffsets: ReadonlyMap<MoonId, Vector3> = moonOffsets;

export const getLiveMoonOffset = (id: MoonId): Vector3 => {
  const pos = moonOffsets.get(id);
  if (!pos) {
    throw new Error(`No offset registered for moon "${id}"`);
  }
  return pos;
};

export const setLiveMoonOffset = (
  id: MoonId,
  x: number,
  y: number,
  z: number,
): void => {
  const pos = moonOffsets.get(id);
  if (!pos) {
    throw new Error(`No offset registered for moon "${id}"`);
  }
  pos.set(x, y, z);
};

/**
 * Satellite offsets are computed analytically from simulation time (no
 * ephemeris API involved), but we still cache the latest world offset
 * here so consumers can read it synchronously like the moon bus.
 */
const satelliteOffsets: Map<SatelliteId, Vector3> = (() => {
  const map = new Map<SatelliteId, Vector3>();
  const now = Date.now();
  for (const sat of SATELLITES) {
    map.set(sat.id, computeSatelliteOffset(sat, now));
  }
  return map;
})();

export const liveSatelliteOffsets: ReadonlyMap<SatelliteId, Vector3> =
  satelliteOffsets;

export const getLiveSatelliteOffset = (id: SatelliteId): Vector3 => {
  const pos = satelliteOffsets.get(id);
  if (!pos) {
    throw new Error(`No offset registered for satellite "${id}"`);
  }
  return pos;
};

export const setLiveSatelliteOffset = (
  id: SatelliteId,
  x: number,
  y: number,
  z: number,
): void => {
  const pos = satelliteOffsets.get(id);
  if (!pos) {
    throw new Error(`No offset registered for satellite "${id}"`);
  }
  pos.set(x, y, z);
};
