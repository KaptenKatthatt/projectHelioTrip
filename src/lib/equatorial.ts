import { Vector3 } from 'three';

type EquatorialCoordinates = {
  readonly rightAscensionHours: number;
  readonly declinationDeg: number;
};

export const equatorialToDirection = ({
  rightAscensionHours,
  declinationDeg,
}: EquatorialCoordinates): Vector3 => {
  if (rightAscensionHours < 0 || rightAscensionHours > 24) {
    throw new RangeError(
      `rightAscensionHours must be in [0, 24], got ${rightAscensionHours}`,
    );
  }
  if (declinationDeg < -90 || declinationDeg > 90) {
    throw new RangeError(
      `declinationDeg must be in [-90, 90], got ${declinationDeg}`,
    );
  }

  const raHours = rightAscensionHours === 24 ? 0 : rightAscensionHours;
  const ra = (raHours / 24) * Math.PI * 2;
  const dec = (declinationDeg * Math.PI) / 180;
  const cosDec = Math.cos(dec);
  return new Vector3(
    cosDec * Math.cos(ra),
    cosDec * Math.sin(ra),
    Math.sin(dec),
  ).normalize();
};
