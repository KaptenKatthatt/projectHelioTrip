import { Vector3 } from 'three';
import type { ConstellationId } from './constellations';
import { CONSTELLATION_SHAPES } from './constellationShapes';
import { equatorialToDirection } from './equatorial';

const getConstellationDirection = (id: ConstellationId): Vector3 => {
  const shape = CONSTELLATION_SHAPES[id];
  const centroid = new Vector3();

  for (const star of shape.stars) {
    centroid.add(
      equatorialToDirection({
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

