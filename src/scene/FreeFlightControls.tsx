import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Vector3, type Camera } from "three";
import { useIsMobileLayout } from "../hooks/useIsMobileLayout";
import { useKeyboardMovement } from "../hooks/useKeyboardMovement";
import { useEventListener } from "../hooks/useEventListener";
import {
  freeFlightTouchBus,
  resetFreeFlightTouch,
} from "../lib/freeFlightTouchBus";
import {
  applyCollisionConstraints,
  resolveDesiredSpeed,
} from "../lib/freeFlightCollision";
import { useStore } from "../store/useStore";
import { StdlibPointerLockControls } from "./controls/StdlibPointerLockControls";

const BOOST_MULTIPLIER = 5;
const WORLD_UP = new Vector3(0, 1, 0);

const MOVE_TOUCH_DEADZONE = 0.12;
const LOOK_TOUCH_DEADZONE = 0.14;
const LOOK_YAW_SPEED = 0.4;
const LOOK_PITCH_SPEED = 0.4;
const PI_2 = Math.PI / 2;

const addMobileMoveInput = (
  desired: Vector3,
  forward: Vector3,
): void => {
  const { y: ty } = freeFlightTouchBus.move;
  const abs = Math.abs(ty);
  if (abs < MOVE_TOUCH_DEADZONE) return;
  const direction = ty < 0 ? -1 : 1;
  const mag = Math.min(1, (abs - MOVE_TOUCH_DEADZONE) / (1 - MOVE_TOUCH_DEADZONE));
  desired.addScaledVector(forward, direction * mag);
};

const addKeyboardMoveInput = (
  desired: Vector3,
  forward: Vector3,
  right: Vector3,
  keyboard: {
    forward: boolean;
    back: boolean;
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
  },
): void => {
  if (keyboard.forward) desired.addScaledVector(forward, 1);
  if (keyboard.back) desired.addScaledVector(forward, -1);
  if (keyboard.right) desired.addScaledVector(right, 1);
  if (keyboard.left) desired.addScaledVector(right, -1);
  if (keyboard.up) desired.addScaledVector(WORLD_UP, 1);
  if (keyboard.down) desired.addScaledVector(WORLD_UP, -1);
};

const tmpLookEuler = new Euler();
const applyMobileLook = (camera: Camera, delta: number): void => {
  const { x: lx, y: ly } = freeFlightTouchBus.look;
  const length = Math.hypot(lx, ly);
  if (length < LOOK_TOUCH_DEADZONE) return;
  const inv = 1 / length;
  const nx = lx * inv;
  const ny = ly * inv;
  const mag = Math.min(1, (length - LOOK_TOUCH_DEADZONE) / (1 - LOOK_TOUCH_DEADZONE));
  // Exponential curve for smoother fine control at small stick deflections
  const smoothMag = mag * mag;
  tmpLookEuler.setFromQuaternion(camera.quaternion, "YXZ");
  tmpLookEuler.y -= nx * smoothMag * LOOK_YAW_SPEED * delta;
  tmpLookEuler.x -= ny * smoothMag * LOOK_PITCH_SPEED * delta;
  tmpLookEuler.x = Math.max(-PI_2, Math.min(PI_2, tmpLookEuler.x));
  camera.quaternion.setFromEuler(tmpLookEuler);
};

const usePointerLockNavigation = () => {
  const activeBody = useStore((s) => s.activeBody);
  const travelTo = useStore((s) => s.travelTo);
  const setNavigationMode = useStore((s) => s.setNavigationMode);

  const wasLockedRef = useRef(false);

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
   * ESC → Autopilot: when the pointer lock is released, switch back
   * to cinematic mode after at least one successful lock session.
   */
  useEventListener(
    document,
    "pointerlockchange",
    () => {
      const locked = document.pointerLockElement !== null;
      if (locked) {
        wasLockedRef.current = true;
        return;
      }
      if (!wasLockedRef.current) return;
      if (activeBody) {
        travelTo(activeBody);
        return;
      }
      setNavigationMode("cinematic");
    },
    undefined,
    true,
  );
};

const tmpDesired = new Vector3();
const tmpForward = new Vector3();
const tmpRight = new Vector3();
const tmpNextPosition = new Vector3();
const tmpMoveDelta = new Vector3();
const tmpCenter = new Vector3();
const tmpNormal = new Vector3();
const tmpRadial = new Vector3();

const useFreeFlightMovement = (
  isMobile: boolean,
  input: React.MutableRefObject<{
    forward: boolean;
    back: boolean;
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    boost: boolean;
  }>,
) => {
  const camera = useThree((s) => s.camera);
  const velocityRef = useRef(new Vector3());

  useFrame((_, delta) => {
    if (delta <= 0) return;
    const velocity = velocityRef.current;

    const locked = document.pointerLockElement !== null;
    const pointerDrivingDesktop = locked && !isMobile;
    const allowKeyboardMove = pointerDrivingDesktop || isMobile;

    camera.getWorldDirection(tmpForward);
    tmpRight.crossVectors(tmpForward, WORLD_UP).normalize();

    tmpDesired.set(0, 0, 0);
    if (allowKeyboardMove) {
      addKeyboardMoveInput(tmpDesired, tmpForward, tmpRight, input.current);
    }

    if (isMobile) addMobileMoveInput(tmpDesired, tmpForward);

    if (tmpDesired.lengthSq() > 0) {
      const { boost } = input.current;
      const dynamicSpeed = resolveDesiredSpeed(camera.position, tmpCenter);
      const speed = dynamicSpeed * (boost ? BOOST_MULTIPLIER : 1);
      tmpDesired.normalize().multiplyScalar(speed);
    }

    /**
     * Frame-independent damping: ~99.9% of the remaining error is
     * closed each second regardless of frame rate. Gives the smooth
     * acceleration/deceleration feel without a spring dependency.
     */
    const smoothing = 1 - Math.pow(0.001, delta);
    velocity.lerp(tmpDesired, smoothing);

    tmpMoveDelta.copy(velocity).multiplyScalar(delta);
    applyCollisionConstraints(
      camera.position,
      tmpMoveDelta,
      tmpNextPosition,
      tmpCenter,
      tmpNormal,
      tmpRadial,
    );

    camera.position.copy(tmpNextPosition);

    if (isMobile) applyMobileLook(camera, delta);
  });
};

export const FreeFlightControls = () => {
  const isMobile = useIsMobileLayout();
  const input = useKeyboardMovement(true);

  usePointerLockNavigation();
  useFreeFlightMovement(isMobile, input);

  /**
   * Scope the auto-lock click listener to the canvas only. Without this,
   * ANY click on the page (including UI buttons) would request pointer
   * lock — which hides the cursor right after clicking e.g. the Autopilot
   * button.
   */
  return <StdlibPointerLockControls selector="canvas" enabled={!isMobile} />;
};
