import { Vector3 } from 'three';

/**
 * Default overview framing — must match the first frame after load (Canvas in Scene).
 * Start / overview travel should end here so the view matches a fresh session.
 */
export const INITIAL_OVERVIEW_CAMERA_POSITION = new Vector3(0, 20, 80);
export const INITIAL_OVERVIEW_TARGET = new Vector3(0, 0, 0);
export const INITIAL_OVERVIEW_FOV = 55;
