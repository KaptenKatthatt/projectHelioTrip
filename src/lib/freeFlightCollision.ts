import { Vector3 } from "three";
import { PLANETS } from "./planets";
import { MOONS } from "./moons";
import { getLiveMoonOffset, getLivePosition } from "./positionsBus";

const BASE_SPEED = 8;
const REFERENCE_DISTANCE = 10;
const SPEED_EXPONENT = 1.0;
const MIN_SPEED = 0.5;
const MAX_SPEED = 500;
const MIN_SURFACE_DISTANCE = 0.1;
const CAMERA_COLLISION_MARGIN = 0.3;
/**
 * Soft-push zone thickness as a multiple of the body's collision
 * radius. Inside this zone the inward component of motion is damped
 * smoothly so approaching a surface feels like a gentle cushion
 * rather than hitting an invisible wall.
 */
const SOFT_ZONE_RADIUS_FACTOR = 0.6;
const SOFT_ZONE_RADIUS_MIN = 1.5;

export type CollisionBody =
  | { kind: "planet"; id: (typeof PLANETS)[number]["id"]; radius: number }
  | {
      kind: "moon";
      id: (typeof MOONS)[number]["id"];
      parent: (typeof PLANETS)[number]["id"];
      radius: number;
    };

const COLLISION_BODIES: readonly CollisionBody[] = [
  ...PLANETS.map((planet) => ({
    kind: "planet" as const,
    id: planet.id,
    radius: planet.radius,
  })),
  ...MOONS.map((moon) => ({
    kind: "moon" as const,
    id: moon.id,
    parent: moon.parent,
    radius: moon.radius,
  })),
];

const setBodyCenter = (body: CollisionBody, target: Vector3): Vector3 => {
  if (body.kind === "planet") {
    return target.copy(getLivePosition(body.id));
  }
  return target.copy(getLivePosition(body.parent)).add(getLiveMoonOffset(body.id));
};

/**
 * WASD speed scales with distance to the nearest body's surface so the
 * camera feels responsive both near a planet and out in deep space.
 *
 *   speed = clamp(BASE_SPEED * (d / REFERENCE_DISTANCE) ^ SPEED_EXPONENT,
 *                 MIN_SPEED, MAX_SPEED)
 *
 * Tuned so that ~1u from a surface → ~0.8 u/s, 10u → BASE_SPEED, and
 * far from any body → MAX_SPEED. Raise SPEED_EXPONENT for a more
 * aggressive exponential feel.
 */
export const resolveDesiredSpeed = (cameraPosition: Vector3, center: Vector3): number => {
  let nearestSurface = Infinity;
  for (const body of COLLISION_BODIES) {
    setBodyCenter(body, center);

    // Skip sqrt when dist(center) >= nearestSurface + radius (cannot beat current nearest).
    const distSq = center.distanceToSquared(cameraPosition);
    if (nearestSurface !== Infinity) {
      const threshold = nearestSurface + body.radius;
      if (threshold < 0 || distSq >= threshold * threshold) {
        continue;
      }
    }

    const surfaceDist = Math.sqrt(distSq) - body.radius;
    if (surfaceDist < nearestSurface) nearestSurface = surfaceDist;
  }
  if (!Number.isFinite(nearestSurface)) nearestSurface = REFERENCE_DISTANCE;
  nearestSurface = Math.max(nearestSurface, MIN_SURFACE_DISTANCE);
  return Math.min(
    MAX_SPEED,
    Math.max(
      MIN_SPEED,
      BASE_SPEED * Math.pow(nearestSurface / REFERENCE_DISTANCE, SPEED_EXPONENT),
    ),
  );
};

export const applyCollisionConstraints = (
  cameraPosition: Vector3,
  moveDelta: Vector3,
  nextPosition: Vector3,
  center: Vector3,
  normal: Vector3,
  radial: Vector3,
): void => {
  nextPosition.copy(cameraPosition).add(moveDelta);

  for (const body of COLLISION_BODIES) {
    const limit = body.radius + CAMERA_COLLISION_MARGIN;
    const limitSq = limit * limit;
    const softZone = Math.max(
      SOFT_ZONE_RADIUS_MIN,
      body.radius * SOFT_ZONE_RADIUS_FACTOR,
    );
    const softLimit = limit + softZone;

    setBodyCenter(body, center);
    normal.copy(cameraPosition).sub(center);
    const currentDistSq = normal.lengthSq();
    radial.copy(nextPosition).sub(center);
    let nextDistSq = radial.lengthSq();
    const softLimitSq = softLimit * softLimit;

    // Bolt optimization: using lengthSq for threshold rejection to avoid expensive Math.sqrt() in useFrame
    if (currentDistSq >= softLimitSq && nextDistSq >= limitSq) {
      continue;
    }

    const currentDist = Math.sqrt(currentDistSq);

    if (currentDist <= 1e-4) {
      normal.set(1, 0, 0);
    } else {
      normal.multiplyScalar(1 / currentDist);
    }

    if (currentDistSq < softLimitSq) {
      const inward = moveDelta.dot(normal);
      if (inward < 0) {
        const depth =
          softZone > 1e-6
            ? Math.min(1, Math.max(0, (softLimit - currentDist) / softZone))
            : 1;
        const damping = depth * depth * (3 - 2 * depth);
        moveDelta.addScaledVector(normal, -inward * damping);
        nextPosition.copy(cameraPosition).add(moveDelta);
        // update radial and nextDistSq after changing nextPosition
        radial.copy(nextPosition).sub(center);
        nextDistSq = radial.lengthSq();
      }
    }

    const inwardSpeed = moveDelta.dot(normal);

    if (inwardSpeed < 0 && nextDistSq < limitSq) {
      moveDelta.addScaledVector(normal, -inwardSpeed);
      nextPosition.copy(cameraPosition).add(moveDelta);
      radial.copy(nextPosition).sub(center);
      nextDistSq = radial.lengthSq();
    }

    if (nextDistSq < limitSq) {
      if (nextDistSq <= 1e-8) {
        radial.set(1, 0, 0);
      } else {
        radial.multiplyScalar(1 / Math.sqrt(nextDistSq));
      }
      nextPosition.copy(center).addScaledVector(radial, limit);
    }
  }
};
