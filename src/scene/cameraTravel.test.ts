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
} from "./cameraTravel";

describe("cameraTravel helpers", () => {
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

  it("computes longer view distances for planets than moons", () => {
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
