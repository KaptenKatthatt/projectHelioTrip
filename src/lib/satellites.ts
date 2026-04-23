import { Vector3 } from 'three';
import type { PlanetId } from './planets';

export type SatelliteId = 'iss';

export type SatelliteDefinition = {
  id: SatelliteId;
  parent: PlanetId;
  /** Scene-unit radius used for rendering bounding/fallback shapes. */
  radius: number;
  color: string;
  /**
   * Orbital radius around parent in scene units. Exaggerated vs. the
   * real ~1.066 Earth-radii value so the station stays legible next to
   * Earth without being swallowed by the sphere.
   */
  orbitRadius: number;
  /**
   * Orbital period expressed in simulation days. We stretch the real
   * ~92-minute period up to something the user can actually watch at
   * the default time scale (1 sim-day per real second).
   */
  periodDays: number;
  /** Orbital inclination from the parent's ecliptic plane, in radians. */
  inclination: number;
  /** Longitude of the ascending node, in radians. */
  ascendingNode: number;
  /** Phase at t=0 (epoch), in radians. */
  phase: number;
};

const DEG = Math.PI / 180;

export const SATELLITES: readonly SatelliteDefinition[] = [
  {
    id: 'iss',
    parent: 'earth',
    radius: 0.08,
    color: '#d8deea',
    orbitRadius: 1.9,
    periodDays: 1,
    inclination: 51.6 * DEG,
    ascendingNode: 0,
    phase: 0,
  },
];

const SATELLITE_MAP: ReadonlyMap<SatelliteId, SatelliteDefinition> = new Map(
  SATELLITES.map((s) => [s.id, s]),
);

export const getSatellite = (
  id: SatelliteId,
): SatelliteDefinition | undefined => SATELLITE_MAP.get(id);

const MS_PER_DAY = 86_400_000;

/**
 * Computes the satellite's offset from its parent in scene units for a
 * given simulation time. Uses a circular Keplerian orbit rotated by the
 * satellite's inclination and ascending node. Writes into `target` when
 * provided to avoid per-frame allocation.
 */
export const computeSatelliteOffset = (
  sat: SatelliteDefinition,
  simulationTimeMs: number,
  target?: Vector3,
): Vector3 => {
  const out = target ?? new Vector3();
  const days = simulationTimeMs / MS_PER_DAY;
  const theta = (days / sat.periodDays) * Math.PI * 2 + sat.phase;

  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const r = sat.orbitRadius;

  const x0 = cosT * r;
  const z0 = sinT * r;

  const cosI = Math.cos(sat.inclination);
  const sinI = Math.sin(sat.inclination);
  const x1 = x0;
  const y1 = sinI * z0;
  const z1 = cosI * z0;

  const cosA = Math.cos(sat.ascendingNode);
  const sinA = Math.sin(sat.ascendingNode);
  out.set(x1 * cosA + z1 * sinA, y1, -x1 * sinA + z1 * cosA);
  return out;
};
