/**
 * Authoritative simulation time, held outside React.
 *
 * This mirrors `positionsBus.ts`: per-frame state that every consumer reads
 * imperatively has no business living in the zustand store. The store is
 * wrapped in `persist`, which calls `setItem` on *every* `set()` without
 * diffing — so writing the clock at 60 Hz meant `partialize` (six object and
 * array clones), `JSON.stringify`, and a synchronous `localStorage.setItem`
 * sixty times a second, plus notifying all ~159 selectors. Nothing subscribed
 * to the value reactively; every reader already used `getState()`.
 *
 * `simulationTime` remains on the store as a seed and snapshot for external
 * writes (share-link restore, reset) and is resynchronised when playback
 * pauses. Anything that needs the live value should call `getSimulationTimeMs`.
 */

let simulationTimeMs = Date.now();

export const getSimulationTimeMs = (): number => simulationTimeMs;

export const setSimulationTimeMs = (ms: number): void => {
  simulationTimeMs = ms;
};
