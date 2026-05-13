import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { stepPhysics, type PhysicsState } from "./physicsLabEngine";
import { G_AU_CUBIC_PER_DAY_SQUARED } from "./constants";

describe("stepPhysics", () => {
  it("should update position linearly when sunMassMultiplier is 0 (no gravity)", () => {
    const state: PhysicsState = {
      pos: new Vector3(1, 0, 0),
      vel: new Vector3(0, 1, 0),
    };

    // With 0 mass, acceleration is 0, so velocity doesn't change, and pos = pos + vel * dt
    stepPhysics(state, 0, 2);

    expect(state.pos.x).toBeCloseTo(1);
    expect(state.pos.y).toBeCloseTo(2);
    expect(state.pos.z).toBeCloseTo(0);

    expect(state.vel.x).toBeCloseTo(0);
    expect(state.vel.y).toBeCloseTo(1);
    expect(state.vel.z).toBeCloseTo(0);
  });

  it("should calculate correct freefall integration over a step", () => {
    // 1D freefall towards origin along x-axis
    // initial position x = 1, v = 0
    // dt = 1
    // mu = G_AU_CUBIC_PER_DAY_SQUARED * 1
    const state: PhysicsState = {
      pos: new Vector3(1, 0, 0),
      vel: new Vector3(0, 0, 0),
    };

    const mu = G_AU_CUBIC_PER_DAY_SQUARED * 1.0;
    const dt = 1.0;

    // Manual simulation of Velocity Verlet
    // 1. Half-step velocity
    // r = 1, acc = -mu / r^2 = -mu
    // v_half = v + acc * (dt / 2) = 0 + (-mu) * 0.5 = -0.5 * mu
    const expectedVelHalf = -0.5 * mu;

    // 2. Full-step position
    // p_next = p + v_half * dt = 1 + (-0.5 * mu) * 1 = 1 - 0.5 * mu
    const expectedPosNext = 1 - 0.5 * mu;

    // 3. Half-step velocity again with new position
    // r_next = p_next, acc_next = -mu / (r_next^2)
    const expectedAccNext = -mu / (expectedPosNext * expectedPosNext);
    // v_next = v_half + acc_next * (dt / 2)
    const expectedVelNext = expectedVelHalf + expectedAccNext * 0.5;

    stepPhysics(state, 1, dt);

    expect(state.pos.x).toBeCloseTo(expectedPosNext, 10);
    expect(state.pos.y).toBeCloseTo(0);
    expect(state.pos.z).toBeCloseTo(0);

    expect(state.vel.x).toBeCloseTo(expectedVelNext, 10);
    expect(state.vel.y).toBeCloseTo(0);
    expect(state.vel.z).toBeCloseTo(0);
  });
});
