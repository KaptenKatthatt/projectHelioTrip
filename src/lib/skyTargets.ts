import { Vector3 } from 'three';
import type { ConstellationMenuId } from './constellations';

type EquatorialTarget = {
  readonly rightAscensionHours: number;
  readonly declinationDeg: number;
};

const toDirection = ({
  rightAscensionHours,
  declinationDeg,
}: EquatorialTarget): Vector3 => {
  const ra = (rightAscensionHours / 24) * Math.PI * 2;
  const dec = (declinationDeg * Math.PI) / 180;
  const cosDec = Math.cos(dec);
  return new Vector3(
    cosDec * Math.cos(ra),
    Math.sin(dec),
    cosDec * Math.sin(ra),
  ).normalize();
};

const SKY_TARGET_COORDINATES: Record<ConstellationMenuId, EquatorialTarget> = {
  orion: { rightAscensionHours: 5.6, declinationDeg: 2.0 },
  ursaMajor: { rightAscensionHours: 11.2, declinationDeg: 55.0 },
  ursaMinor: { rightAscensionHours: 15.0, declinationDeg: 77.0 },
  cassiopeia: { rightAscensionHours: 1.0, declinationDeg: 60.0 },
  cygnus: { rightAscensionHours: 20.6, declinationDeg: 42.0 },
  scorpius: { rightAscensionHours: 16.9, declinationDeg: -30.0 },
  leo: { rightAscensionHours: 10.7, declinationDeg: 15.0 },
  taurus: { rightAscensionHours: 4.7, declinationDeg: 19.0 },
  gemini: { rightAscensionHours: 7.1, declinationDeg: 22.0 },
  sagittarius: { rightAscensionHours: 19.0, declinationDeg: -28.0 },
  crux: { rightAscensionHours: 12.5, declinationDeg: -60.0 },
  canisMajor: { rightAscensionHours: 6.9, declinationDeg: -22.0 },
  pegasus: { rightAscensionHours: 23.1, declinationDeg: 21.0 },
  andromeda: { rightAscensionHours: 0.8, declinationDeg: 37.0 },
  aquarius: { rightAscensionHours: 22.5, declinationDeg: -12.0 },
  polaris: { rightAscensionHours: 2.53, declinationDeg: 89.26 },
};

export const SKY_TARGET_DIRECTIONS: Record<ConstellationMenuId, Vector3> =
  Object.fromEntries(
    Object.entries(SKY_TARGET_COORDINATES).map(([id, target]) => [
      id,
      toDirection(target),
    ]),
  ) as Record<ConstellationMenuId, Vector3>;

