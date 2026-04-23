import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useKeyboardMovement } from '../hooks/useKeyboardMovement';

const BASE_SPEED = 8;
const BOOST_MULTIPLIER = 5;
const WORLD_UP = new Vector3(0, 1, 0);

export const FreeFlightControls = () => {
  const camera = useThree((s) => s.camera);

  const input = useKeyboardMovement(true);

  const velocity = useMemo(() => new Vector3(), []);
  const desired = useMemo(() => new Vector3(), []);
  const forward = useMemo(() => new Vector3(), []);
  const right = useMemo(() => new Vector3(), []);

  /**
   * Safety net: if we unmount while the pointer is locked (e.g. user
   * clicks Autopilot without pressing ESC first), drei's cleanup only
   * calls `controls.disconnect()` and leaves the browser-level lock
   * intact — which would hide the cursor indefinitely.
   */
  useEffect(() => {
    return () => {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    };
  }, []);

  useFrame((_, delta) => {
    if (delta <= 0) return;

    const locked = document.pointerLockElement !== null;

    camera.getWorldDirection(forward);
    right.crossVectors(forward, WORLD_UP).normalize();

    desired.set(0, 0, 0);
    if (locked) {
      const {
        forward: fwd,
        back,
        left,
        right: rgt,
        up,
        down,
        boost,
      } = input.current;

      if (fwd) desired.addScaledVector(forward, 1);
      if (back) desired.addScaledVector(forward, -1);
      if (rgt) desired.addScaledVector(right, 1);
      if (left) desired.addScaledVector(right, -1);
      if (up) desired.addScaledVector(WORLD_UP, 1);
      if (down) desired.addScaledVector(WORLD_UP, -1);

      if (desired.lengthSq() > 0) {
        desired.normalize();
        const speed = BASE_SPEED * (boost ? BOOST_MULTIPLIER : 1);
        desired.multiplyScalar(speed);
      }
    }

    /**
     * Frame-independent damping: ~99.9% of the remaining error is
     * closed each second regardless of frame rate. Gives the smooth
     * acceleration/deceleration feel without a spring dependency.
     */
    const smoothing = 1 - Math.pow(0.001, delta);
    velocity.lerp(desired, smoothing);

    camera.position.addScaledVector(velocity, delta);
  });

  /**
   * Scope drei's auto-lock click listener to the canvas only. Without
   * this, ANY click on the page (including UI buttons) would request
   * pointer lock — which hides the cursor right after clicking e.g.
   * the Autopilot button.
   */
  return <PointerLockControls selector="canvas" />;
};
