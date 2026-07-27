import { beforeEach, describe, expect, it, vi } from "vitest";
import { MS_PER_DAY } from "../lib/constants";
import {
  getSimulationTimeMs,
  setSimulationTimeMs,
} from "../lib/simulationClock";
import {
  advanceSimulationClock,
  computeAdvancedSimulationMs,
  syncSimulationTimeToStore,
} from "./useTimeManager";

const START_MS = Date.parse("2026-04-25T12:00:00.000Z");

describe("computeAdvancedSimulationMs", () => {
  it("does not advance simulation time when paused", () => {
    expect(computeAdvancedSimulationMs(START_MS, false, 30, 0.5)).toBe(START_MS);
  });

  it("does not advance simulation time when timeScale is 0", () => {
    expect(computeAdvancedSimulationMs(START_MS, true, 0, 0.5)).toBe(START_MS);
  });

  it("does not advance simulation time when delta is 0", () => {
    expect(computeAdvancedSimulationMs(START_MS, true, 7, 0)).toBe(START_MS);
  });

  it("advances simulation time by delta * timeScale days", () => {
    expect(computeAdvancedSimulationMs(START_MS, true, 7, 2)).toBe(
      START_MS + 2 * 7 * MS_PER_DAY,
    );
  });

  it("rewinds simulation time when timeScale is negative", () => {
    expect(computeAdvancedSimulationMs(START_MS, true, -7, 2)).toBe(
      START_MS + 2 * -7 * MS_PER_DAY,
    );
  });
});

describe("advanceSimulationClock", () => {
  beforeEach(() => {
    setSimulationTimeMs(START_MS);
  });

  it("advances the module-level clock while playing", () => {
    const nextMs = advanceSimulationClock({ isPlaying: true, timeScale: 1 }, 0.25);

    expect(nextMs).toBe(START_MS + 0.25 * MS_PER_DAY);
    expect(getSimulationTimeMs()).toBe(nextMs);
  });

  it("leaves the clock untouched when paused or at zero scale", () => {
    expect(advanceSimulationClock({ isPlaying: false, timeScale: 1 }, 0.25)).toBe(
      START_MS,
    );
    expect(advanceSimulationClock({ isPlaying: true, timeScale: 0 }, 0.25)).toBe(
      START_MS,
    );
    expect(getSimulationTimeMs()).toBe(START_MS);
  });

  it("accumulates across frames without drift", () => {
    for (let frame = 0; frame < 600; frame++) {
      advanceSimulationClock({ isPlaying: true, timeScale: 1 }, 1 / 60);
    }

    expect(getSimulationTimeMs()).toBeCloseTo(START_MS + 10 * MS_PER_DAY, 0);
  });
});

describe("syncSimulationTimeToStore", () => {
  beforeEach(() => {
    setSimulationTimeMs(START_MS);
  });

  it("writes the live clock back when the store copy has drifted", () => {
    const setSimulationTime = vi.fn<(time: Date) => void>();
    setSimulationTimeMs(START_MS + 5_000);

    syncSimulationTimeToStore({
      simulationTime: new Date(START_MS),
      setSimulationTime,
    });

    expect(setSimulationTime).toHaveBeenCalledTimes(1);
    expect(setSimulationTime).toHaveBeenCalledWith(new Date(START_MS + 5_000));
  });

  it("does nothing when the store copy is already current", () => {
    const setSimulationTime = vi.fn<(time: Date) => void>();

    syncSimulationTimeToStore({
      simulationTime: new Date(START_MS),
      setSimulationTime,
    });

    expect(setSimulationTime).not.toHaveBeenCalled();
  });
});
