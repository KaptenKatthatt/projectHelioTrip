import { describe, expect, it } from "vitest";
import { getMissionDefinition } from "./missionDefinitions";
import { evaluateMissionStep } from "./missionEvaluator";
import { createInitialProgress, type MissionProgress } from "./types";

const NOW = Date.parse("2026-04-25T12:00:00.000Z");

describe("evaluateMissionStep", () => {
  it("completes ordered missions only when steps arrive in sequence", () => {
    const mission = getMissionDefinition("solar_system_start");
    if (!mission) throw new Error("mission missing");
    const start = createInitialProgress(mission.id, NOW);

    const wrongOrder = evaluateMissionStep({
      mission,
      progress: start,
      event: { kind: "body_focused", bodyId: "mars" },
      nowMs: NOW,
    });
    expect(wrongOrder.newlyCompletedStepIds).toEqual([]);
    expect(wrongOrder.progress.completedStepIds).toEqual([]);

    const earthVisit = evaluateMissionStep({
      mission,
      progress: start,
      event: { kind: "body_focused", bodyId: "earth" },
      nowMs: NOW,
    });
    expect(earthVisit.newlyCompletedStepIds).toEqual(["visit_earth"]);
    expect(earthVisit.missionJustCompleted).toBe(false);

    const marsVisit = evaluateMissionStep({
      mission,
      progress: earthVisit.progress,
      event: { kind: "body_focused", bodyId: "mars" },
      nowMs: NOW + 1000,
    });
    expect(marsVisit.newlyCompletedStepIds).toEqual(["visit_mars"]);
    expect(marsVisit.missionJustCompleted).toBe(true);
    expect(marsVisit.progress.completed).toBe(true);
    expect(marsVisit.progress.completedAtMs).toBe(NOW + 1000);
  });

  it("allows unordered missions to complete in any order", () => {
    const mission = getMissionDefinition("jupiter_moons");
    if (!mission) throw new Error("mission missing");
    let progress: MissionProgress = createInitialProgress(mission.id, NOW);

    for (const moon of ["ganymede", "io", "europa"] as const) {
      const result = evaluateMissionStep({
        mission,
        progress,
        event: { kind: "body_focused", bodyId: moon },
        nowMs: NOW,
      });
      progress = result.progress;
    }
    expect(progress.completed).toBe(true);
    expect(progress.completedStepIds).toHaveLength(mission.steps.length);
  });

  it("matches time scale triggers at threshold", () => {
    const mission = getMissionDefinition("time_travel_short");
    if (!mission) throw new Error("mission missing");
    const start = createInitialProgress(mission.id, NOW);

    const tooSlow = evaluateMissionStep({
      mission,
      progress: start,
      event: { kind: "time_scale_changed", daysPerSecond: 7 },
      nowMs: NOW,
    });
    expect(tooSlow.missionJustCompleted).toBe(false);

    const fastEnough = evaluateMissionStep({
      mission,
      progress: start,
      event: { kind: "time_scale_changed", daysPerSecond: 30 },
      nowMs: NOW,
    });
    expect(fastEnough.missionJustCompleted).toBe(true);
  });

  it("does not double-count steps once the mission is complete", () => {
    const mission = getMissionDefinition("iss_hunt");
    if (!mission) throw new Error("mission missing");
    const start = createInitialProgress(mission.id, NOW);
    const first = evaluateMissionStep({
      mission,
      progress: start,
      event: { kind: "body_focused", bodyId: "iss" },
      nowMs: NOW,
    });
    const second = evaluateMissionStep({
      mission,
      progress: first.progress,
      event: { kind: "body_focused", bodyId: "iss" },
      nowMs: NOW + 5000,
    });
    expect(second.newlyCompletedStepIds).toEqual([]);
    expect(second.progress.completedAtMs).toBe(NOW);
  });
});
