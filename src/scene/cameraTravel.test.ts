import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import {
  OVERVIEW_POSITION,
  OVERVIEW_TARGET,
  computeViewDistance,
  createTravelFromState,
  resolveEndPos,
  resolveTarget,
  slerpDirections,
  easeInOutSine,
  easeInOutQuart,
  toArrived,
} from "./cameraTravel";

describe("cameraTravel helpers", () => {
  it("computeViewDistance scales radius correctly for a planet", () => {
    // Planet view distance: max(8, radius * 6)
    // Small radius -> bounded by MIN (8)
    expect(computeViewDistance("earth", 1)).toBe(8);
    // Large radius -> scales by multiplier (6)
    expect(computeViewDistance("earth", 10)).toBe(60);
  });

  it("computeViewDistance scales radius correctly for a moon/satellite", () => {
    // Moon view distance: max(2.5, radius * 8)
    // Small radius -> bounded by MIN (2.5)
    expect(computeViewDistance("moon", 0.1)).toBe(2.5);
    // Large radius -> scales by multiplier (8)
    expect(computeViewDistance("moon", 1)).toBe(8);
  });

  it("createTravelFromState handles activeBody not having a corresponding getBody", () => {
    const startPos = new Vector3(0, 0, 10);
    const startForward = new Vector3(0, 0, -1);

    // Pass a valid type, but an ID that isn't found
    const travel = createTravelFromState(
      { viewMode: "close", activeBody: "madeupbodyid" as unknown as import("../lib/bodies").BodyId },
      startPos,
      startForward,
    );
    expect(travel).toBeNull();
  });

  it("createTravelFromState returns null for non-existent body", () => {
    const startPos = new Vector3(0, 0, 10);
    const startForward = new Vector3(0, 0, -1);

    // Test with activeBody not found
    const travel = createTravelFromState(
      { viewMode: "close", activeBody: "nonexistent" as unknown as import("../lib/bodies").BodyId },
      startPos,
      startForward,
    );
    expect(travel).toBeNull();

    // Test with activeBody null
    const travelNull = createTravelFromState(
      { viewMode: "close", activeBody: null },
      startPos,
      startForward,
    );
    expect(travelNull).toBeNull();
  });

  it("resolveEndPos calculates correct position for a planet", () => {
    const startPos = new Vector3(0, 0, 10);
    const startForward = new Vector3(0, 0, -1);
    const travel = createTravelFromState(
      { viewMode: "close", activeBody: "earth" },
      startPos,
      startForward,
    );
    if (!travel) throw new Error("Expected body travel");

    const endOut = new Vector3();
    const scratch = new Vector3();
    resolveEndPos(travel, endOut, scratch);

    expect(endOut.length()).toBeGreaterThan(0);
    // PLANET_CAMERA_HEIGHT is 0.45, viewDistance should be scaled accordingly.
    // Ensure height is positive.
    expect(endOut.y).toBeGreaterThan(0);
  });

  it("resolveEndPos calculates correct position for a moon (child body)", () => {
    const startPos = new Vector3(0, 0, 10);
    const startForward = new Vector3(0, 0, -1);
    const travel = createTravelFromState(
      { viewMode: "close", activeBody: "moon" },
      startPos,
      startForward,
    );
    if (!travel) throw new Error("Expected body travel");

    const endOut = new Vector3();
    const scratch = new Vector3();
    resolveEndPos(travel, endOut, scratch);

    expect(endOut.length()).toBeGreaterThan(0);
  });

  it("toArrived correctly maps body and overview travels to arrived types", () => {
    const startPos = new Vector3(0, 0, 10);
    const startForward = new Vector3(0, 0, -1);

    const bodyTravel = createTravelFromState(
      { viewMode: "close", activeBody: "earth" },
      startPos,
      startForward,
    );
    if (!bodyTravel) throw new Error("Expected body travel");

    const arrivedBody = toArrived(bodyTravel);
    expect(arrivedBody.kind).toBe("body");
    if (arrivedBody.kind === "body") {
      expect(arrivedBody.bodyId).toBe("earth");
      expect(arrivedBody.viewDistance).toBeGreaterThan(0);
    }

    const overviewTravel = createTravelFromState(
      { viewMode: "overview", activeBody: null },
      startPos,
      startForward,
    );
    if (!overviewTravel) throw new Error("Expected overview travel");

    const arrivedOverview = toArrived(overviewTravel);
    expect(arrivedOverview.kind).toBe("overview");
  });

  it("easeInOutSine calculates correctly", () => {
    expect(easeInOutSine(0)).toBe(-0);
    expect(easeInOutSine(0.5)).toBeCloseTo(0.5);
    expect(easeInOutSine(1)).toBe(1);
  });

  it("easeInOutQuart calculates correctly", () => {
    expect(easeInOutQuart(0)).toBe(0);
    expect(easeInOutQuart(0.25)).toBeCloseTo(0.03125); // 8 * 0.25^4
    expect(easeInOutQuart(0.5)).toBeCloseTo(0.5);
    expect(easeInOutQuart(0.75)).toBeCloseTo(0.96875);
    expect(easeInOutQuart(1)).toBe(1);
  });

  it("slerpDirections handles antipodal and near-identical vectors", () => {
    const a = new Vector3(0, 0, -1);
    const b = new Vector3(0, 0, -1); // identical
    const out = new Vector3();
    slerpDirections(a, b, 0.5, out);
    expect(out.equals(b)).toBe(true);

    const c = new Vector3(0, 0, 1); // antipodal
    slerpDirections(a, c, 0.5, out);
    expect(out.equals(c)).toBe(true);
  });

  it("creates overview travel from overview mode", () => {
    const startPos = new Vector3(1, 2, 3);
    const startForward = new Vector3(0, 0, -1);

    const travel = createTravelFromState(
      { viewMode: "overview", activeBody: null },
      startPos,
      startForward,
    );

    expect(travel?.kind).toBe("overview");
    expect(travel?.startPos).toBe(startPos);
    expect(travel?.startForward).toBe(startForward);
  });

  it("creates body travel for known bodies in close mode", () => {
    const startPos = new Vector3(0, 0, 10);
    const startForward = new Vector3(0, 0, -1);

    const travel = createTravelFromState(
      { viewMode: "close", activeBody: "earth" },
      startPos,
      startForward,
    );

    expect(travel?.kind).toBe("body");
    if (!travel || travel.kind !== "body") {
      throw new Error("Expected body travel");
    }
    expect(travel.bodyId).toBe("earth");
    expect(travel.viewDistance).toBeGreaterThanOrEqual(8);
  });

  it("resolves overview target and end position to initial overview vectors", () => {
    const startPos = new Vector3(4, 5, 6);
    const startForward = new Vector3(0, 0, -1);
    const travel = createTravelFromState(
      { viewMode: "overview", activeBody: null },
      startPos,
      startForward,
    );
    if (!travel) {
      throw new Error("Expected overview travel");
    }

    const targetOut = new Vector3();
    const endOut = new Vector3();
    resolveTarget(travel, targetOut);
    resolveEndPos(travel, endOut, new Vector3());

    expect(targetOut.equals(OVERVIEW_TARGET)).toBe(true);
    expect(endOut.equals(OVERVIEW_POSITION)).toBe(true);
  });

  it("computes non-shorter view distances for planets than moons", () => {
    const planetDistance = computeViewDistance("earth", 1);
    const moonDistance = computeViewDistance("moon", 1);

    expect(planetDistance).toBeGreaterThanOrEqual(moonDistance);
  });

  it("slerpDirections keeps normalized output", () => {
    const a = new Vector3(0, 0, -1);
    const b = new Vector3(1, 0, 0).normalize();
    const out = new Vector3();

    slerpDirections(a, b, 0.5, out);

    expect(Math.abs(out.length() - 1)).toBeLessThan(0.000001);
    expect(out.z).toBeLessThan(0);
    expect(out.x).toBeGreaterThan(0);
  });
});
