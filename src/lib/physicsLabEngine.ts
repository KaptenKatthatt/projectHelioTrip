import { Vector3 } from 'three';
import { G_AU_CUBIC_PER_DAY_SQUARED } from './constants';

/** Standard gravitational parameter for the Sun (approx). */
const MU_SUN = G_AU_CUBIC_PER_DAY_SQUARED * 1.0; // M_sun = 1.0 in this unit

export type PhysicsState = {
  pos: Vector3;
  vel: Vector3;
};

/**
 * Performs one step of Velocity Verlet integration.
 * @param state Current position and velocity (in AU and AU/day).
 * @param sunMassMultiplier Multiplier for the Sun's mass.
 * @param dtDays Time step in days.
 */
const scratchAcc = new Vector3();

export const stepPhysics = (
  state: PhysicsState,
  sunMassMultiplier: number,
  dtDays: number
): void => {
  const mu = MU_SUN * sunMassMultiplier;
  
  // 1. Half-step velocity
  // ⚡ Bolt: Using pre-allocated scratchAcc instead of .clone() to prevent GC pauses
  const r = state.pos.length();
  scratchAcc.copy(state.pos).multiplyScalar(-mu / (r * r * r));
  state.vel.addScaledVector(scratchAcc, 0.5 * dtDays);
  
  // 2. Full-step position
  state.pos.addScaledVector(state.vel, dtDays);
  
  // 3. Half-step velocity again with new position
  const rNext = state.pos.length();
  scratchAcc.copy(state.pos).multiplyScalar(-mu / (rNext * rNext * rNext));
  state.vel.addScaledVector(scratchAcc, 0.5 * dtDays);
};
