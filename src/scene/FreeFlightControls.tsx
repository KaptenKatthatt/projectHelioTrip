import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Vector3 } from "three";
import { useIsMobileLayout } from "../hooks/useIsMobileLayout";
import { useKeyboardMovement } from "../hooks/useKeyboardMovement";
import {
  freeFlightTouchBus,
  resetFreeFlightTouch,
} from "../lib/freeFlightTouchBus";
import { PLANETS } from "../lib/planets";
import { MOONS } from "../lib/moons";
import { getLiveMoonOffset, getLivePosition } from "../lib/positionsBus";
import { useStore } from "../store/useStore";
import { StdlibPointerLockControls } from "./controls/StdlibPointerLockControls";

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
const BASE_SPEED = 8;
const BOOST_MULTIPLIER = 5;
const REFERENCE_DISTANCE = 10;
const SPEED_EXPONENT = 1.0;
const MIN_SPEED = 0.5;
const MAX_SPEED = 500;
const MIN_SURFACE_DISTANCE = 0.1;
const WORLD_UP = new Vector3(0, 1, 0);
const CAMERA_COLLISION_MARGIN = 0.3;
/**
 * Soft-push zone thickness as a multiple of the body's collision
 * radius. Inside this zone the inward component of motion is damped
 * smoothly so approaching a surface feels like a gentle cushion
 * rather than hitting an invisible wall.
 */
const SOFT_ZONE_RADIUS_FACTOR = 0.6;
const SOFT_ZONE_RADIUS_MIN = 1.5;

const MOVE_TOUCH_DEADZONE = 0.12;
const LOOK_TOUCH_DEADZONE = 0.14;
const LOOK_YAW_SPEED = 0.7;
const LOOK_PITCH_SPEED = 0.7;
const PI_2 = Math.PI / 2;

type CollisionBody =
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

export const FreeFlightControls = () => {
  const camera = useThree((s) => s.camera);
  const activeBody = useStore((s) => s.activeBody);
  const travelTo = useStore((s) => s.travelTo);
  const setNavigationMode = useStore((s) => s.setNavigationMode);
  const isMobile = useIsMobileLayout();

  const input = useKeyboardMovement(true);
  const wasLockedRef = useRef(false);

  const velocity = useMemo(() => new Vector3(), []);
  const desired = useMemo(() => new Vector3(), []);
  const forward = useMemo(() => new Vector3(), []);
  const right = useMemo(() => new Vector3(), []);
  const nextPosition = useMemo(() => new Vector3(), []);
  const moveDelta = useMemo(() => new Vector3(), []);
  const center = useMemo(() => new Vector3(), []);
  const normal = useMemo(() => new Vector3(), []);
  const radial = useMemo(() => new Vector3(), []);
  const eulerScratch = useMemo(() => new Euler(0, 0, 0, "YXZ"), []);

  /**
   * Safety net: if we unmount while the pointer is locked (e.g. user
   * clicks Autopilot without pressing ESC first), disconnecting the
   * controls can leave the browser-level lock intact — which would hide
   * the cursor indefinitely.
   */
  useEffect(() => {
    resetFreeFlightTouch();
    return () => {
      resetFreeFlightTouch();
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    };
  }, []);

  /**
   * ESC → Autopilot: when the pointer has been locked and then
   * released (via ESC or `document.exitPointerLock()`), switch back
   * to cinematic mode automatically so the user doesn't have to
   * click Autopilot manually. We wait for the first lock event
   * before reacting to unlocks — otherwise the initial "not yet
   * locked" state on mount would immediately flip us back.
   */
  useEffect(() => {
    const onPointerLockChange = (): void => {
      const locked = document.pointerLockElement !== null;
      if (locked) {
        wasLockedRef.current = true;
        return;
      }
      if (wasLockedRef.current) {
        if (activeBody) {
          travelTo(activeBody);
          return;
        }
        setNavigationMode("cinematic");
      }
    };

    document.addEventListener("pointerlockchange", onPointerLockChange);
    return () => {
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, [activeBody, setNavigationMode, travelTo]);

  useFrame((_, delta) => {
    if (delta <= 0) return;

    const locked = document.pointerLockElement !== null;
    const pointerDrivingDesktop = locked && !isMobile;
    const allowKeyboardMove = pointerDrivingDesktop || isMobile;

    camera.getWorldDirection(forward);
    right.crossVectors(forward, WORLD_UP).normalize();

    desired.set(0, 0, 0);
    if (allowKeyboardMove) {
      const { forward: fwd, back, left, right: rgt, up, down } = input.current;

      if (fwd) desired.addScaledVector(forward, 1);
      if (back) desired.addScaledVector(forward, -1);
      if (rgt) desired.addScaledVector(right, 1);
      if (left) desired.addScaledVector(right, -1);
      if (up) desired.addScaledVector(WORLD_UP, 1);
      if (down) desired.addScaledVector(WORLD_UP, -1);
    }

    if (isMobile) {
      const { x: tx, y: ty } = freeFlightTouchBus.move;
      const tlen = Math.hypot(tx, ty);
      if (tlen >= MOVE_TOUCH_DEADZONE) {
        const inv = 1 / tlen;
        const nx = tx * inv;
        const ny = ty * inv;
        const mag = Math.min(
          1,
          (tlen - MOVE_TOUCH_DEADZONE) / (1 - MOVE_TOUCH_DEADZONE),
        );
        desired.addScaledVector(right, nx * mag);
        desired.addScaledVector(forward, ny * mag);
      }
    }

    if (desired.lengthSq() > 0) {
      const { boost } = input.current;
      let nearestSurface = Infinity;
      for (const body of COLLISION_BODIES) {
        if (body.kind === "planet") {
          center.copy(getLivePosition(body.id));
        } else {
          center
            .copy(getLivePosition(body.parent))
            .add(getLiveMoonOffset(body.id));
        }
        const surfaceDist = center.distanceTo(camera.position) - body.radius;
        if (surfaceDist < nearestSurface) nearestSurface = surfaceDist;
      }
      if (!Number.isFinite(nearestSurface)) nearestSurface = REFERENCE_DISTANCE;
      nearestSurface = Math.max(nearestSurface, MIN_SURFACE_DISTANCE);

      const dynamicSpeed = Math.min(
        MAX_SPEED,
        Math.max(
          MIN_SPEED,
          BASE_SPEED *
            Math.pow(nearestSurface / REFERENCE_DISTANCE, SPEED_EXPONENT),
        ),
      );
      const speed = dynamicSpeed * (boost ? BOOST_MULTIPLIER : 1);
      desired.normalize().multiplyScalar(speed);
    }

    /**
     * Frame-independent damping: ~99.9% of the remaining error is
     * closed each second regardless of frame rate. Gives the smooth
     * acceleration/deceleration feel without a spring dependency.
     */
    const smoothing = 1 - Math.pow(0.001, delta);
    velocity.lerp(desired, smoothing);

    moveDelta.copy(velocity).multiplyScalar(delta);
    nextPosition.copy(camera.position).add(moveDelta);

    for (const body of COLLISION_BODIES) {
      const limit = body.radius + CAMERA_COLLISION_MARGIN;
      const limitSq = limit * limit;
      const softZone = Math.max(
        SOFT_ZONE_RADIUS_MIN,
        body.radius * SOFT_ZONE_RADIUS_FACTOR,
      );
      const softLimit = limit + softZone;

      if (body.kind === "planet") {
        center.copy(getLivePosition(body.id));
      } else {
        center
          .copy(getLivePosition(body.parent))
          .add(getLiveMoonOffset(body.id));
      }

      normal.copy(camera.position).sub(center);
      const currentDist = normal.length();
      if (currentDist <= 1e-4) {
        normal.set(1, 0, 0);
      } else {
        normal.multiplyScalar(1 / currentDist);
      }

      /**
       * Soft cushion: damp the inward component of motion as we enter
       * the outer zone. Falloff is 0 at softLimit and 1 at the hard
       * limit, so the camera eases to a stop before the rigid clamp
       * ever engages. Smoothstep keeps the onset gentle.
       */
      if (currentDist < softLimit) {
        const inward = moveDelta.dot(normal);
        if (inward < 0) {
          const depth =
            softZone > 1e-6
              ? Math.min(1, Math.max(0, (softLimit - currentDist) / softZone))
              : 1;
          const damping = depth * depth * (3 - 2 * depth);
          moveDelta.addScaledVector(normal, -inward * damping);
          nextPosition.copy(camera.position).add(moveDelta);
        }
      }

      radial.copy(nextPosition).sub(center);
      const nextDistSq = radial.lengthSq();
      const inwardSpeed = moveDelta.dot(normal);

      if (inwardSpeed < 0 && nextDistSq < limitSq) {
        moveDelta.addScaledVector(normal, -inwardSpeed);
        nextPosition.copy(camera.position).add(moveDelta);
        radial.copy(nextPosition).sub(center);
      }

      const correctedDistSq = radial.lengthSq();
      if (correctedDistSq < limitSq) {
        if (correctedDistSq <= 1e-8) {
          radial.set(1, 0, 0);
        } else {
          radial.multiplyScalar(1 / Math.sqrt(correctedDistSq));
        }
        nextPosition.copy(center).addScaledVector(radial, limit);
      }
    }

    camera.position.copy(nextPosition);

    if (isMobile) {
      const { x: lx, y: ly } = freeFlightTouchBus.look;
      const llen = Math.hypot(lx, ly);
      if (llen >= LOOK_TOUCH_DEADZONE) {
        const inv = 1 / llen;
        const nx = lx * inv;
        const ny = ly * inv;
        const mag = Math.min(
          1,
          (llen - LOOK_TOUCH_DEADZONE) / (1 - LOOK_TOUCH_DEADZONE),
        );
        eulerScratch.setFromQuaternion(camera.quaternion);
        eulerScratch.y -= nx * mag * LOOK_YAW_SPEED * delta;
        eulerScratch.x -= ny * mag * LOOK_PITCH_SPEED * delta;
        eulerScratch.x = Math.max(-PI_2, Math.min(PI_2, eulerScratch.x));
        camera.quaternion.setFromEuler(eulerScratch);
      }
    }
  });

  /**
   * Scope the auto-lock click listener to the canvas only. Without this,
   * ANY click on the page (including UI buttons) would request pointer
   * lock — which hides the cursor right after clicking e.g. the Autopilot
   * button.
   */
  return <StdlibPointerLockControls selector="canvas" enabled={!isMobile} />;
};
