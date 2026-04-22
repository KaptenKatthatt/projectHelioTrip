import { Vector3 } from 'three';
import type { PlanetId } from './planets';

export type EphemerisResponse = {
  id: string;
  date: string;
  frame: string;
  center: string;
  units: 'AU';
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  distance: number;
  lightTimeDays: number;
};

const cache = new Map<string, Promise<Vector3>>();

/**
 * Fetch a planet's heliocentric ecliptic position from the Horizons proxy.
 * Returns an unscaled Vector3 in AU using the three.js convention
 * (Y-up). NASA ecliptic J2000 (X, Y, Z) maps to three.js (X, Z, -Y).
 */
export const fetchPlanetPositionAu = (
  id: PlanetId,
  isoDate: string,
): Promise<Vector3> => {
  const key = `${id}:${isoDate}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const promise = (async (): Promise<Vector3> => {
    const res = await fetch(`/api/planets/${id}?date=${isoDate}`);
    if (!res.ok) {
      throw new Error(`Ephemeris fetch failed: HTTP ${res.status}`);
    }
    const body = (await res.json()) as EphemerisResponse;
    return new Vector3(body.position.x, body.position.z, -body.position.y);
  })();

  cache.set(key, promise);
  promise.catch(() => {
    cache.delete(key);
  });
  return promise;
};
