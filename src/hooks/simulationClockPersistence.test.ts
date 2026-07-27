// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { MS_PER_DAY } from "../lib/constants";

/**
 * The zustand store is wrapped in `persist`, which calls `setItem` on every
 * `set()` with no diffing. Advancing the simulation clock through the store
 * therefore ran `partialize` (six object and array clones), `JSON.stringify`
 * and a *synchronous* `localStorage.setItem` on every animation frame.
 *
 * This asserts the property that actually matters — storage stays untouched
 * while the simulation plays — rather than the shape of the code that
 * currently satisfies it.
 */
describe("simulation playback and persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  const loadModules = async () => {
    const { useStore } = await import("../store/useStore");
    const { advanceSimulationClock, syncSimulationTimeToStore } = await import(
      "./useTimeManager"
    );
    const { getSimulationTimeMs, setSimulationTimeMs } = await import(
      "../lib/simulationClock"
    );
    return {
      useStore,
      advanceSimulationClock,
      syncSimulationTimeToStore,
      getSimulationTimeMs,
      setSimulationTimeMs,
    };
  };

  /**
   * Establishes the cost the tests below are guarding against, and proves the
   * spy and subscription are wired correctly — without it, the two assertions
   * that follow could pass for the wrong reason.
   */
  it("pays a synchronous storage write for every single store write", async () => {
    const { useStore } = await loadModules();
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const listener = vi.fn();
    const unsubscribe = useStore.subscribe(listener);

    useStore.getState().setSimulationTime(new Date(12_345));

    expect(setItem).toHaveBeenCalled();
    expect(listener).toHaveBeenCalled();
    unsubscribe();
    setItem.mockRestore();
  });

  it("writes nothing to localStorage across 600 playing frames", async () => {
    const { advanceSimulationClock } = await loadModules();
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    for (let frame = 0; frame < 600; frame++) {
      advanceSimulationClock({ isPlaying: true, timeScale: 1 }, 1 / 60);
    }

    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  it("notifies no store subscriber while the clock advances", async () => {
    const { useStore, advanceSimulationClock } = await loadModules();
    const listener = vi.fn();
    const unsubscribe = useStore.subscribe(listener);

    for (let frame = 0; frame < 600; frame++) {
      advanceSimulationClock({ isPlaying: true, timeScale: 1 }, 1 / 60);
    }

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("still exposes the advanced time on the store once playback stops", async () => {
    const { useStore, advanceSimulationClock, syncSimulationTimeToStore } =
      await loadModules();

    const startMs = useStore.getState().simulationTime.getTime();
    for (let frame = 0; frame < 60; frame++) {
      advanceSimulationClock({ isPlaying: true, timeScale: 1 }, 1 / 60);
    }
    syncSimulationTimeToStore(useStore.getState());

    const syncedMs = useStore.getState().simulationTime.getTime();
    expect(syncedMs).toBeCloseTo(startMs + MS_PER_DAY, 0);
  });

  it("keeps the clock and the store aligned when time is set externally", async () => {
    const { useStore, getSimulationTimeMs } = await loadModules();
    const target = new Date("2030-01-01T00:00:00.000Z");

    useStore.getState().setSimulationTime(target);

    expect(getSimulationTimeMs()).toBe(target.getTime());
    expect(useStore.getState().simulationTime).toEqual(target);
  });
});
