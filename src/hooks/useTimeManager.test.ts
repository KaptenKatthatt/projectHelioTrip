import { describe, expect, it, vi } from "vitest";
import { MS_PER_DAY } from "../lib/constants";
import {
  advanceSimulationClock,
  computeAdvancedSimulationMs,
} from "./useTimeManager";

describe("useTimeManager clock helpers", () => {
  it("does not advance simulation time when paused", () => {
    const nowMs = Date.parse("2026-04-25T12:00:00.000Z");

    const next = computeAdvancedSimulationMs(nowMs, false, 30, 0.5);

    expect(next).toBe(nowMs);
  });

  it("does not advance simulation time when timeScale is 0", () => {
    const nowMs = Date.parse("2026-04-25T12:00:00.000Z");
    const next = computeAdvancedSimulationMs(nowMs, true, 0, 0.5);
    expect(next).toBe(nowMs);
  });

  it("rewinds simulation time when timeScale is negative", () => {
    const nowMs = Date.parse("2026-04-25T12:00:00.000Z");
    const next = computeAdvancedSimulationMs(nowMs, true, -7, 2);
    expect(next).toBe(nowMs + 2 * -7 * MS_PER_DAY);
  });

  it("does not advance simulation time when delta is 0", () => {
    const nowMs = Date.parse("2026-04-25T12:00:00.000Z");
    const next = computeAdvancedSimulationMs(nowMs, true, 7, 0);
    expect(next).toBe(nowMs);
  });

  it("advances simulation time by delta * timeScale days", () => {
    const nowMs = Date.parse("2026-04-25T12:00:00.000Z");

    const next = computeAdvancedSimulationMs(nowMs, true, 7, 2);

    expect(next).toBe(nowMs + 2 * 7 * MS_PER_DAY);
  });

  it("calls setSimulationTime only when time changed", () => {
    const setSimulationTime = vi.fn<(time: Date) => void>();

    const current = new Date("2026-04-25T12:00:00.000Z");
    const nextMs = advanceSimulationClock(
      {
        simulationTime: current,
        isPlaying: true,
        timeScale: 1,
        setSimulationTime,
      },
      0.25,
    );

    expect(nextMs).toBe(current.getTime() + 0.25 * MS_PER_DAY);
    expect(setSimulationTime).toHaveBeenCalledTimes(1);

    setSimulationTime.mockClear();
    const pausedMs = advanceSimulationClock(
      {
        simulationTime: current,
        isPlaying: false,
        timeScale: 1,
        setSimulationTime,
      },
      0.25,
    );

    expect(pausedMs).toBe(current.getTime());
    expect(setSimulationTime).not.toHaveBeenCalled();

    setSimulationTime.mockClear();
    const zeroScaleMs = advanceSimulationClock(
      {
        simulationTime: current,
        isPlaying: true,
        timeScale: 0,
        setSimulationTime,
      },
      0.25,
    );

    expect(zeroScaleMs).toBe(current.getTime());
    expect(setSimulationTime).not.toHaveBeenCalled();

    setSimulationTime.mockClear();
    const rewindMs = advanceSimulationClock(
      {
        simulationTime: current,
        isPlaying: true,
        timeScale: -1,
        setSimulationTime,
      },
      0.25,
    );

    const expectedRewindMs = current.getTime() + 0.25 * -1 * MS_PER_DAY;
    expect(rewindMs).toBe(expectedRewindMs);
    expect(setSimulationTime).toHaveBeenCalledTimes(1);
    expect(setSimulationTime).toHaveBeenCalledWith(new Date(expectedRewindMs));
  });
});
