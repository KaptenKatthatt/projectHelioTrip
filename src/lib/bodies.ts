import { Vector3 } from 'three';
import { getPlanet, type PlanetDefinition, type PlanetId } from './planets';
import { getMoon, type MoonDefinition, type MoonId } from './moons';
import {
  getSatellite,
  type SatelliteDefinition,
  type SatelliteId,
} from './satellites';
import {
  getLiveMoonOffset,
  getLivePosition,
  getLiveSatelliteOffset,
} from './positionsBus';

export type BodyId = PlanetId | MoonId | SatelliteId;

export type BodyDefinition =
  | { kind: 'planet'; def: PlanetDefinition }
  | { kind: 'moon'; def: MoonDefinition }
  | { kind: 'satellite'; def: SatelliteDefinition };

export const getBody = (id: BodyId): BodyDefinition | undefined => {
  const planet = getPlanet(id as PlanetId);
  if (planet) return { kind: 'planet', def: planet };
  const moon = getMoon(id as MoonId);
  if (moon) return { kind: 'moon', def: moon };
  const satellite = getSatellite(id as SatelliteId);
  if (satellite) return { kind: 'satellite', def: satellite };
  return undefined;
};

export const isMoonId = (id: BodyId): id is MoonId =>
  getMoon(id as MoonId) !== undefined;

export const isSatelliteId = (id: BodyId): id is SatelliteId =>
  getSatellite(id as SatelliteId) !== undefined;

/**
 * Returns the parent planet for bodies that orbit one (moons,
 * satellites). Planets return `null`.
 */
export const getBodyParent = (id: BodyId): PlanetId | null => {
  const moon = getMoon(id as MoonId);
  if (moon) return moon.parent;
  const satellite = getSatellite(id as SatelliteId);
  if (satellite) return satellite.parent;
  return null;
};

/**
 * Computes the body's world position. For planets this is just the
 * live heliocentric position; for moons and satellites it's parent +
 * relative offset. Writes into `target` when provided to avoid
 * allocation in hot paths.
 */
export const getBodyWorldPosition = (
  id: BodyId,
  target?: Vector3,
): Vector3 => {
  const out = target ?? new Vector3();
  const moon = getMoon(id as MoonId);
  if (moon) {
    const parent = getLivePosition(moon.parent);
    const offset = getLiveMoonOffset(moon.id);
    return out.set(
      parent.x + offset.x,
      parent.y + offset.y,
      parent.z + offset.z,
    );
  }
  const satellite = getSatellite(id as SatelliteId);
  if (satellite) {
    const parent = getLivePosition(satellite.parent);
    const offset = getLiveSatelliteOffset(satellite.id);
    return out.set(
      parent.x + offset.x,
      parent.y + offset.y,
      parent.z + offset.z,
    );
  }
  return out.copy(getLivePosition(id as PlanetId));
};

export const getBodyRadius = (id: BodyId): number | null => {
  const body = getBody(id);
  if (!body) return null;
  return body.def.radius;
};

export const getBodyColor = (id: BodyId): string | null => {
  const body = getBody(id);
  if (!body) return null;
  return body.def.color;
};
