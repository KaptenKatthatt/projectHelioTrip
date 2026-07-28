import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useStore } from "../store/useStore";
import { PLANETS } from "../lib/planets";
import { MOONS, MOON_AU_SCALE } from "../lib/moons";
import { computeSatelliteOffset, SATELLITES } from "../lib/satellites";
import {
  propagate,
  setEclipticAuFromEa,
  solveKeplerEccentricAnomaly,
} from "../lib/kepler";
import {
  MOON_ORBITAL_ELEMENTS,
  PLANET_ORBITAL_ELEMENTS,
} from "../lib/orbitalElements";
import {
  setLiveMoonOffset,
  setLivePosition,
  setLiveSatelliteOffset,
} from "../lib/positionsBus";
import { AU_SCALE, MS_PER_DAY } from "../lib/constants";
import {
  getSimulationTimeMs,
  setSimulationTimeMs,
} from "../lib/simulationClock";
import { type PhysicsState, stepPhysics } from "../lib/physicsLabEngine";

const LAB_VELOCITY_EPS_DAYS = 0.001;

function seedGravityLabBodiesFromOrbitalEphemerides(
  currentMs: number,
  into: Record<string, PhysicsState>,
): void {
  for (const planet of PLANETS) {
    const el = PLANET_ORBITAL_ELEMENTS[planet.id];
    if (!el) continue;

    const pos = new Vector3();
    const vel = new Vector3();

    const dtDays = (currentMs - el.epochMs) / MS_PER_DAY;
    const n = (Math.PI * 2) / el.periodDays;
    const meanAnomaly = el.m0Rad + n * dtDays;
    const ea = solveKeplerEccentricAnomaly(el.e, meanAnomaly);
    setEclipticAuFromEa(el, ea, pos);

    const meanAnomaly2 = meanAnomaly + n * LAB_VELOCITY_EPS_DAYS;
    const ea2 = solveKeplerEccentricAnomaly(el.e, meanAnomaly2);
    const posEps = new Vector3();
    setEclipticAuFromEa(el, ea2, posEps);
    vel.set(
      (posEps.x - pos.x) / LAB_VELOCITY_EPS_DAYS,
      (posEps.y - pos.y) / LAB_VELOCITY_EPS_DAYS,
      (posEps.z - pos.z) / LAB_VELOCITY_EPS_DAYS,
    );

    into[planet.id] = { pos, vel };
  }
}

type SimulationClockState = {
  isPlaying: boolean;
  timeScale: number;
};

export const computeAdvancedSimulationMs = (
  simulationTimeMs: number,
  isPlaying: boolean,
  timeScale: number,
  delta: number,
): number => {
  if (!isPlaying || timeScale === 0) return simulationTimeMs;
  return simulationTimeMs + delta * timeScale * MS_PER_DAY;
};

/**
 * Advances the module-level clock. Deliberately does *not* touch the store:
 * writing it here ran a synchronous `localStorage` write through the `persist`
 * middleware on every frame. `syncSimulationTimeToStore` handles the rare
 * moments when the store copy actually needs to catch up.
 */
export const advanceSimulationClock = (
  state: SimulationClockState,
  delta: number,
): number => {
  const currentMs = getSimulationTimeMs();
  const nextMs = computeAdvancedSimulationMs(
    currentMs,
    state.isPlaying,
    state.timeScale,
    delta,
  );
  if (nextMs !== currentMs) {
    setSimulationTimeMs(nextMs);
  }
  return nextMs;
};

/** Writes the live clock back to the store when it has drifted from it. */
export const syncSimulationTimeToStore = (state: {
  simulationTime: Date;
  setSimulationTime: (time: Date) => void;
}): void => {
  const liveMs = getSimulationTimeMs();
  if (state.simulationTime.getTime() === liveMs) return;
  state.setSimulationTime(new Date(liveMs));
};

/**
 * Advances the simulation clock and updates every live position from
 * pre-computed Kepler orbital elements. 
 * 
 * In 'lab' mode, it switches to dynamic N-body physics integration.
 */
export const useTimeManager = (): void => {
  const planetScratch = useMemo(() => new Vector3(), []);
  const moonScratch = useMemo(() => new Vector3(), []);
  const satelliteScratch = useMemo(() => new Vector3(), []);
  const lastProcessedMsRef = useRef<number | null>(null);

  // Physics Lab state (stored in Ecliptic coordinates: X, Y, Z)
  const physicsStatesRef = useRef<Record<string, PhysicsState>>({});
  const lastLabModeRef = useRef<string>("explore");
  const lastLabResetRef = useRef<number>(0);
  const wasAdvancingRef = useRef(false);

  useFrame((_state, delta) => {
    const store = useStore.getState();
    const isLab = store.gameMode === "lab";
    /**
     * Lab mode drives planets from the N-body integrator, so their positions
     * no longer match the Keplerian ephemerides for `currentMs`. Leaving it
     * has to force one Keplerian pass even if the clock is paused, or the
     * planets stay parked wherever the physics left them.
     */
    const leftLabMode = !isLab && lastLabModeRef.current === "lab";
    const currentMs = advanceSimulationClock(store, delta);

    /**
     * Resynchronise the store copy the moment playback stops, so anything
     * reading `simulationTime` off the store sees the time the user is
     * actually looking at. One write per pause, not one per frame.
     */
    const isAdvancing = store.isPlaying && store.timeScale !== 0;
    if (wasAdvancingRef.current && !isAdvancing) {
      syncSimulationTimeToStore(store);
    }
    wasAdvancingRef.current = isAdvancing;

    const timeChanged = lastProcessedMsRef.current !== currentMs;
    if (timeChanged) lastProcessedMsRef.current = currentMs;

    // Reset or Initialize physics when entering lab mode OR when trigger increments
    const needsReset = (isLab && lastLabModeRef.current !== "lab") || 
                       (isLab && lastLabResetRef.current !== store.gravityLabResetTrigger);

    if (needsReset) {
      seedGravityLabBodiesFromOrbitalEphemerides(
        currentMs,
        physicsStatesRef.current,
      );
      lastLabResetRef.current = store.gravityLabResetTrigger;
    }
    lastLabModeRef.current = store.gameMode;

    if (isLab) {
      const dtDays = store.isPlaying ? delta * store.timeScale : 0;
      for (const planet of PLANETS) {
        const pState = physicsStatesRef.current[planet.id];
        if (!pState) continue;
        if (dtDays !== 0) {
          stepPhysics(pState, store.sunMassMultiplier, dtDays);
        }
        // Apply three.js coordinate swap: (X, Z, -Y)
        setLivePosition(
          planet.id,
          pState.pos.x * AU_SCALE,
          pState.pos.z * AU_SCALE,
          -pState.pos.y * AU_SCALE,
        );
      }
    } else if (timeChanged || leftLabMode) {
      // Standard Keplerian path; positions only change when time does.
      for (const planet of PLANETS) {
        const el = PLANET_ORBITAL_ELEMENTS[planet.id];
        if (!el) continue;
        propagate(el, currentMs, planetScratch, AU_SCALE);
        setLivePosition(planet.id, planetScratch.x, planetScratch.y, planetScratch.z);
      }
    }

    /**
     * Moons and satellites are pure functions of simulation time, so
     * recomputing them while the clock is frozen produces identical values.
     * Nineteen Kepler solves per frame were being thrown away whenever the
     * simulation was paused.
     */
    if (!timeChanged && !leftLabMode) return;

    for (const moon of MOONS) {
      const el = MOON_ORBITAL_ELEMENTS[moon.id];
      if (!el) continue;
      propagate(el, currentMs, moonScratch, MOON_AU_SCALE);
      setLiveMoonOffset(moon.id, moonScratch.x, moonScratch.y, moonScratch.z);
    }

    for (const sat of SATELLITES) {
      computeSatelliteOffset(sat, currentMs, satelliteScratch);
      setLiveSatelliteOffset(sat.id, satelliteScratch.x, satelliteScratch.y, satelliteScratch.z);
    }
  });
};
