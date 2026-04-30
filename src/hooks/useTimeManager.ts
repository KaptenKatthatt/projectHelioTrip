import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useStore } from "../store/useStore";
import { PLANETS } from "../lib/planets";
import { MOONS, MOON_AU_SCALE } from "../lib/moons";
import { computeSatelliteOffset, SATELLITES } from "../lib/satellites";
import { propagate } from "../lib/kepler";
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

type SimulationClockState = {
  simulationTime: Date;
  isPlaying: boolean;
  timeScale: number;
  setSimulationTime: (time: Date) => void;
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

export const advanceSimulationClock = (
  state: SimulationClockState,
  delta: number,
): number => {
  const currentMs = state.simulationTime.getTime();
  const nextMs = computeAdvancedSimulationMs(
    currentMs,
    state.isPlaying,
    state.timeScale,
    delta,
  );
  if (nextMs !== currentMs) {
    state.setSimulationTime(new Date(nextMs));
  }
  return nextMs;
};

/**
 * Advances the simulation clock and updates every live position from
 * pre-computed Kepler orbital elements. All motion is analytical –
 * there are no runtime NASA Horizons fetches – so the scene stays
 * smooth at any playback rate from 0.25 d/s up to millions of d/s.
 *
 * Must be called inside a <Canvas> because it registers useFrame.
 */
export const useTimeManager = (): void => {
  const planetScratch = useMemo(() => new Vector3(), []);
  const moonScratch = useMemo(() => new Vector3(), []);
  const satelliteScratch = useMemo(() => new Vector3(), []);
  const lastProcessedMsRef = useRef<number | null>(null);

  useFrame((_state, delta) => {
    const state = useStore.getState();
    const currentMs = advanceSimulationClock(state, delta);
    if (lastProcessedMsRef.current === currentMs) {
      return;
    }
    lastProcessedMsRef.current = currentMs;

    for (const planet of PLANETS) {
      const el = PLANET_ORBITAL_ELEMENTS[planet.id];
      if (!el) continue;
      propagate(el, currentMs, planetScratch, AU_SCALE);
      setLivePosition(
        planet.id,
        planetScratch.x,
        planetScratch.y,
        planetScratch.z,
      );
    }

    for (const moon of MOONS) {
      const el = MOON_ORBITAL_ELEMENTS[moon.id];
      if (!el) continue;
      propagate(el, currentMs, moonScratch, MOON_AU_SCALE);
      setLiveMoonOffset(moon.id, moonScratch.x, moonScratch.y, moonScratch.z);
    }

    for (const sat of SATELLITES) {
      computeSatelliteOffset(sat, currentMs, satelliteScratch);
      setLiveSatelliteOffset(
        sat.id,
        satelliteScratch.x,
        satelliteScratch.y,
        satelliteScratch.z,
      );
    }
  });
};
