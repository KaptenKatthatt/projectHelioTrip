import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { resolveDesiredSpeed, applyCollisionConstraints } from "./freeFlightCollision";

describe("resolveDesiredSpeed", () => {
  it("returns MIN_SPEED when camera is very close to a body surface", () => {
    const cam = new Vector3(1.5, 0, 0);
    const center = new Vector3();
    const speed = resolveDesiredSpeed(cam, center);
    expect(speed).toBeGreaterThanOrEqual(0.5);
    expect(speed).toBeLessThanOrEqual(500);
  });

  it("returns MAX_SPEED far from all bodies", () => {
    const farAway = new Vector3(1000, 1000, 1000);
    const center = new Vector3();
    const speed = resolveDesiredSpeed(farAway, center);
    expect(speed).toBe(500);
  });
});

describe("applyCollisionConstraints", () => {
  it("does not modify movement when camera is far from all bodies", () => {
    const cam = new Vector3(1000, 1000, 1000);
    const move = new Vector3(1, 0, 0);
    const moveOriginal = move.clone();
    const next = new Vector3();
    const center = new Vector3();
    const normal = new Vector3();
    const radial = new Vector3();
    applyCollisionConstraints(cam, move, next, center, normal, radial);
    expect(move.x).toBeCloseTo(moveOriginal.x);
    expect(move.y).toBeCloseTo(moveOriginal.y);
    expect(move.z).toBeCloseTo(moveOriginal.z);
  });

  it("blocks inward movement when camera would intersect a body", () => {
    const cam = new Vector3(6.5, 0, 0);
    const move = new Vector3(-2, 0, 0);
    const next = new Vector3();
    const center = new Vector3();
    const normal = new Vector3();
    const radial = new Vector3();
    applyCollisionConstraints(cam, move, next, center, normal, radial);
    const finalPos = cam.clone().add(move);
    expect(finalPos.length()).toBeGreaterThanOrEqual(6.3);
  });
});
