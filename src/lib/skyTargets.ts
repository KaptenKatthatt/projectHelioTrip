import { Vector3 } from 'three';
import type { ConstellationId } from './constellations';
import { CONSTELLATION_SHAPES } from './constellationShapes';

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

const getConstellationDirection = (id: ConstellationId): Vector3 => {
  const shape = CONSTELLATION_SHAPES[id];
  const centroid = new Vector3();

  for (const star of shape.stars) {
    centroid.add(
      toDirection({
        rightAscensionHours: star.rightAscensionHours,
        declinationDeg: star.declinationDeg,
      }),
    );
  }

  if (centroid.lengthSq() <= 1e-8) return new Vector3(1, 0, 0);
  return centroid.normalize();
};

export const SKY_TARGET_DIRECTIONS: Record<ConstellationId, Vector3> = {
  orion: getConstellationDirection('orion'),
  ursaMajor: getConstellationDirection('ursaMajor'),
  karlaVagnen: getConstellationDirection('karlaVagnen'),
  ursaMinor: getConstellationDirection('ursaMinor'),
  cassiopeia: getConstellationDirection('cassiopeia'),
  cygnus: getConstellationDirection('cygnus'),
  scorpius: getConstellationDirection('scorpius'),
  leo: getConstellationDirection('leo'),
  taurus: getConstellationDirection('taurus'),
  gemini: getConstellationDirection('gemini'),
  sagittarius: getConstellationDirection('sagittarius'),
  canisMajor: getConstellationDirection('canisMajor'),
  pegasus: getConstellationDirection('pegasus'),
  andromeda: getConstellationDirection('andromeda'),
  aquarius: getConstellationDirection('aquarius'),
  lyra: getConstellationDirection('lyra'),
};

