import { Vector3 } from "three";
import {
  getBody,
  getBodyParent,
  getBodyWorldPosition,
  type BodyId,
} from "../lib/bodies";
import {
  INITIAL_OVERVIEW_CAMERA_POSITION,
  INITIAL_OVERVIEW_TARGET,
} from "../lib/initialCamera";
import { getLivePosition } from "../lib/positionsBus";
import type { ViewMode } from "../store/useStore";

const AIM_DURATION_MS = 1600;
const FLY_DURATION_MS = 3400;
const CAMERA_TRAVEL_TOTAL_DURATION_MS =
  AIM_DURATION_MS + FLY_DURATION_MS;
export const TOTAL_TRAVEL_DURATION_MS = CAMERA_TRAVEL_TOTAL_DURATION_MS;
export const AIM_FRACTION = AIM_DURATION_MS / TOTAL_TRAVEL_DURATION_MS;

export const ARC_HEIGHT_FACTOR = 0.18;
export const LOOK_AT_DISTANCE = 100;

const PLANET_VIEW_DISTANCE_MULTIPLIER = 6;
const PLANET_VIEW_DISTANCE_MIN = 8;
const MOON_VIEW_DISTANCE_MULTIPLIER = 8;
const MOON_VIEW_DISTANCE_MIN = 2.5;
const NEAR_ANTIPODAL_THRESHOLD = 0.9995;

export const OVERVIEW_POSITION = INITIAL_OVERVIEW_CAMERA_POSITION.clone();
export const OVERVIEW_TARGET = INITIAL_OVERVIEW_TARGET.clone();
export const WORLD_UP = new Vector3(0, 1, 0);

export type CameraTravelStateSnapshot = {
  viewMode: ViewMode;
  activeBody: BodyId | null;
};

type BaseTravel = {
  startPos: Vector3;
  startForward: Vector3;
};

export type BodyTravel = BaseTravel & {
  kind: "body";
  bodyId: BodyId;
  viewDistance: number;
};

export type OverviewTravel = BaseTravel & {
  kind: "overview";
};

export type Travel = BodyTravel | OverviewTravel;

export type Arrived =
  | { kind: "body"; bodyId: BodyId; viewDistance: number }
  | { kind: "overview" };

export const easeInOutSine = (x: number): number =>
  -(Math.cos(Math.PI * x) - 1) / 2;

export const easeInOutQuart = (x: number): number =>
  x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;

export const slerpDirections = (
  a: Vector3,
  b: Vector3,
  t: number,
  out: Vector3,
): Vector3 => {
  const dot = Math.max(-1, Math.min(1, a.dot(b)));
  if (dot > NEAR_ANTIPODAL_THRESHOLD || dot < -NEAR_ANTIPODAL_THRESHOLD) {
    return out.copy(b);
  }
  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);
  const wA = Math.sin((1 - t) * theta) / sinTheta;
  const wB = Math.sin(t * theta) / sinTheta;
  out.copy(a).multiplyScalar(wA).addScaledVector(b, wB);
  return out.normalize();
};

/**
 * How far behind the planet along the radial direction the camera sits (world-space, unitless ratio).
 * Combined with PLANET_SIDE_FACTOR this gives the camera a ~56° approach angle.
 */
const PLANET_BEHIND_FACTOR = 0.5;
/** How far to the side of the planet along the tangent direction. */
const PLANET_SIDE_FACTOR = 0.75;
/**
 * Camera height above the planet's equatorial plane in world-space units, before
 * the vector is scaled to viewDistance. Increase to tilt the camera higher above
 * the planet; decrease to look more level. Affects ALL platforms.
 *
 * For mobile portrait only: the additional 2D viewport shift that pushes the
 * planet higher on screen without moving the camera is in PlanetViewportOffset.tsx
 * (PLANET_VIEWPORT_UPSHIFT_FRACTION).
 */
const PLANET_CAMERA_HEIGHT = 0.45;

const computePlanetEndPos = (
  planetPos: Vector3,
  viewDistance: number,
  out: Vector3,
): void => {
  const dist = Math.hypot(planetPos.x, planetPos.z);
  const dirX = dist > 1e-6 ? planetPos.x / dist : 1;
  const dirZ = dist > 1e-6 ? planetPos.z / dist : 0;

  const tangentX = -dirZ;
  const tangentZ = dirX;

  out.set(
    dirX * -PLANET_BEHIND_FACTOR + tangentX * PLANET_SIDE_FACTOR,
    PLANET_CAMERA_HEIGHT,
    dirZ * -PLANET_BEHIND_FACTOR + tangentZ * PLANET_SIDE_FACTOR,
  );
  out.setLength(viewDistance);
  out.add(planetPos);
};

const computeChildBodyEndPos = (
  childPos: Vector3,
  parentPos: Vector3,
  viewDistance: number,
  out: Vector3,
): void => {
  const dx = childPos.x - parentPos.x;
  const dy = childPos.y - parentPos.y;
  const dz = childPos.z - parentPos.z;
  const len = Math.hypot(dx, dy, dz);

  if (len < 1e-4) {
    out.set(1, 0.3, 0).setLength(viewDistance).add(childPos);
    return;
  }

  const inv = 1 / len;
  out.set(dx * inv, dy * inv, dz * inv);
  out.y += 0.25;
  out.setLength(viewDistance);
  out.add(childPos);
};

export const computeViewDistance = (bodyId: BodyId, radius: number): number => {
  if (getBodyParent(bodyId)) {
    return Math.max(
      MOON_VIEW_DISTANCE_MIN,
      radius * MOON_VIEW_DISTANCE_MULTIPLIER,
    );
  }
  return Math.max(
    PLANET_VIEW_DISTANCE_MIN,
    radius * PLANET_VIEW_DISTANCE_MULTIPLIER,
  );
};

export const createTravelFromState = (
  state: CameraTravelStateSnapshot,
  startPos: Vector3,
  startForward: Vector3,
): Travel | null => {
  if (state.viewMode === "overview") {
    return { kind: "overview", startPos, startForward };
  }
  if (!state.activeBody) return null;

  const body = getBody(state.activeBody);
  if (!body) return null;

  return {
    kind: "body",
    startPos,
    startForward,
    bodyId: state.activeBody,
    viewDistance: computeViewDistance(state.activeBody, body.def.radius),
  };
};

export const resolveTarget = (travel: Travel, out: Vector3): void => {
  if (travel.kind === "overview") {
    out.copy(OVERVIEW_TARGET);
    return;
  }
  getBodyWorldPosition(travel.bodyId, out);
};

export const resolveEndPos = (
  travel: Travel,
  out: Vector3,
  scratch: Vector3,
): void => {
  if (travel.kind === "overview") {
    out.copy(OVERVIEW_POSITION);
    return;
  }

  getBodyWorldPosition(travel.bodyId, scratch);
  const parent = getBodyParent(travel.bodyId);
  if (parent) {
    computeChildBodyEndPos(
      scratch,
      getLivePosition(parent),
      travel.viewDistance,
      out,
    );
    return;
  }
  computePlanetEndPos(scratch, travel.viewDistance, out);
};

export const toArrived = (travel: Travel): Arrived =>
  travel.kind === "body"
    ? { kind: "body", bodyId: travel.bodyId, viewDistance: travel.viewDistance }
    : { kind: "overview" };
