/**
 * Moon Surface Camera and Animation Settings
 *
 * This file contains central configuration for the Moon landing sequence.
 * Adjust FLY_IN_START/END to change the camera's path and final framing.
 * Ensure LOOK_AT_TARGET matches OrbitControls target to prevent jumping.
 */
import * as THREE from 'three';

export const CAMERA_SETTINGS = {
  // Initial position when the landing sequence starts
  FLY_IN_START: new THREE.Vector3(15, 60, 40),
  // Final position after landing to match the reference framing
  FLY_IN_END: new THREE.Vector3(18, 12, 36),
  // Keep the lander centered with Earth in the upper-right corner
  LOOK_AT_TARGET: new THREE.Vector3(0, 2, 0),
  // Duration of the landing animation in milliseconds (controls "panning speed")
  FLY_IN_DURATION: 6500,
  // Delay before the landing animation starts
  FLY_IN_DELAY: 500,

  // Animation when leaving the Moon surface
  TAKE_OFF_DURATION: 3500,
  TAKE_OFF_HEIGHT_MIN: 40,
  TAKE_OFF_DISTANCE_MULT: 6,
};
