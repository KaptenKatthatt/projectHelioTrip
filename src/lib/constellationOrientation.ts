import { Quaternion, Vector3 } from 'three';
import type { ConstellationId } from './constellations';
import {
  CONSTELLATION_SHAPES,
  type ConstellationShape,
} from './constellationShapes';
import { equatorialToDirection } from './equatorial';
import { getConstellationViewSpinOffsetRad } from './constellationViewSpinOffset';

const CANONICAL_FORWARD = new Vector3(0, 0, -1);
const ROLL_AXIS = new Vector3(0, 0, 1);
const ROLL_STEPS = 72;
/** Extra margin so lines, point sprites, and mobile HUD insets stay inside the frustum. */
const FOV_MARGIN = 1.52;

const calculateMaxTanHalf = (
  aligned: readonly Vector3[],
  safeAspect: number,
  rollQuat: Quaternion,
): number => {
  const tmp = new Vector3();
  let maxTan = 0;
  for (const direction of aligned) {
    tmp.copy(direction).applyQuaternion(rollQuat);
    if (tmp.z >= -1e-5) continue;
    const ty = Math.abs(tmp.y) / -tmp.z;
    const tx = Math.abs(tmp.x) / -tmp.z;
    maxTan = Math.max(maxTan, ty, tx / safeAspect);
  }
  return maxTan;
};

const maxHalfTanForRollPhi = (
  aligned: readonly Vector3[],
  safeAspect: number,
  phi: number,
): number => {
  const rollQuat = new Quaternion().setFromAxisAngle(ROLL_AXIS, phi);
  let maxTan = calculateMaxTanHalf(aligned, safeAspect, rollQuat);
  if (maxTan < 1e-6) {
    console.warn('constellationOrientation: degenerate figure (all stars behind camera), using fallback FOV');
    maxTan = Math.tan((18 * Math.PI) / 180);
  }
  if (!Number.isFinite(maxTan) || maxTan < 1e-4) {
    console.warn('constellationOrientation: non-finite maxTan, using fallback FOV');
    maxTan = Math.tan((24 * Math.PI) / 180);
  }
  return maxTan;
};

type OrientationPrep = {
  readonly aligned: Vector3[];
  readonly safeAspect: number;
  readonly bestPhi: number;
  readonly baseAlign: Quaternion;
};

const prepareOrientation = (shape: ConstellationShape, aspect: number): OrientationPrep => {
  const safeAspect = Math.max(0.25, Math.min(4, aspect));
  const dirs: Vector3[] = shape.stars.map((s) =>
    equatorialToDirection({
      rightAscensionHours: s.rightAscensionHours,
      declinationDeg: s.declinationDeg,
    }),
  );

  const centroid = new Vector3();
  for (const d of dirs) centroid.add(d);
  if (centroid.lengthSq() <= 1e-8) centroid.copy(CANONICAL_FORWARD);
  else centroid.normalize();

  const baseAlign = new Quaternion().setFromUnitVectors(centroid, CANONICAL_FORWARD);
  const aligned: Vector3[] = dirs.map((d) => d.clone().applyQuaternion(baseAlign));

  const rollQuat = new Quaternion();
  let bestPhi = 0;
  let bestTanHalf = Number.POSITIVE_INFINITY;

  for (let i = 0; i < ROLL_STEPS; i++) {
    const phi = ((i + 0.5) / ROLL_STEPS) * Math.PI * 2;
    rollQuat.setFromAxisAngle(ROLL_AXIS, phi);
    let maxTan = calculateMaxTanHalf(aligned, safeAspect, rollQuat);
    if (maxTan < 1e-6) {
      maxTan = Math.tan((18 * Math.PI) / 180);
    }
    if (maxTan < bestTanHalf) {
      bestTanHalf = maxTan;
      bestPhi = phi;
    }
  }

  return { aligned, safeAspect, bestPhi, baseAlign };
};

/**
 * Aligns the constellation barycenter to −Z, then rolls around the line of sight
 * so the figure needs the smallest vertical FOV for the current aspect ratio.
 */
export const computeConstellationOrientation = (
  shape: ConstellationShape,
  aspect: number,
): { quaternion: Quaternion; minFullFovDegrees: number } => {
  const prep = prepareOrientation(shape, aspect);
  const rollQuat = new Quaternion().setFromAxisAngle(ROLL_AXIS, prep.bestPhi);
  const quaternion = new Quaternion().copy(rollQuat).multiply(prep.baseAlign);

  const bestTanHalf = maxHalfTanForRollPhi(
    prep.aligned,
    prep.safeAspect,
    prep.bestPhi,
  );
  const minFullFovDegrees =
    (2 * Math.atan(bestTanHalf * FOV_MARGIN) * 180) / Math.PI;

  return { quaternion, minFullFovDegrees };
};

export const getConstellationMinFovDegrees = (
  id: ConstellationId,
  aspect: number,
): number => {
  const prep = prepareOrientation(CONSTELLATION_SHAPES[id], aspect);
  const viewSpin = getConstellationViewSpinOffsetRad(id);
  const tanHalf = maxHalfTanForRollPhi(
    prep.aligned,
    prep.safeAspect,
    prep.bestPhi + viewSpin,
  );
  return (2 * Math.atan(tanHalf * FOV_MARGIN) * 180) / Math.PI;
};
