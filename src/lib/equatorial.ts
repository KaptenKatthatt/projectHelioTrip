import { Vector3 } from 'three';

type EquatorialCoordinates = {
  readonly rightAscensionHours: number;
  readonly declinationDeg: number;
};

export const equatorialToDirection = ({
  rightAscensionHours,
  declinationDeg,
}: EquatorialCoordinates): Vector3 => {
  const ra = (rightAscensionHours / 24) * Math.PI * 2;
  const dec = (declinationDeg * Math.PI) / 180;
  const cosDec = Math.cos(dec);
  return new Vector3(
    cosDec * Math.cos(ra),
    Math.sin(dec),
    cosDec * Math.sin(ra),
  ).normalize();
};
