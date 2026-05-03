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
import { type PhysicsState, stepPhysics } from "../lib/physicsLabEngine";

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

  useFrame((_state, delta) => {
    const store = useStore.getState();
    const isLab = store.gameMode === "lab";
    const currentMs = advanceSimulationClock(store, delta);
    
    // Reset or Initialize physics when entering lab mode OR when trigger increments
    const needsReset = (isLab && lastLabModeRef.current !== "lab") || 
                       (isLab && lastLabResetRef.current !== store.gravityLabResetTrigger);

    if (needsReset) {
      for (const planet of PLANETS) {
        const el = PLANET_ORBITAL_ELEMENTS[planet.id];
        if (!el) continue;
        
        // We need PURE ecliptic coordinates for the physics engine
        // Propagate with scale 1.0 but WITHOUT the three.js axis swap
        const pos = new Vector3();
        const vel = new Vector3();
        
        // Manual propagation to get pure ecliptic X, Y, Z
        const dtDays = (currentMs - el.epochMs) / MS_PER_DAY;
        const n = (Math.PI * 2) / el.periodDays;
        const m = el.m0Rad + n * dtDays;
        let ea = m;
        for (let k = 0; k < 6; k++) {
          ea -= (ea - el.e * Math.sin(ea) - m) / (1 - el.e * Math.cos(ea));
        }
        const xPf = el.a * (Math.cos(ea) - el.e);
        const yPf = el.a * Math.sqrt(Math.max(0, 1 - el.e * el.e)) * Math.sin(ea);
        
        const cosI = Math.cos(el.iRad);
        const sinI = Math.sin(el.iRad);
        const cosO = Math.cos(el.omegaRad);
        const sinO = Math.sin(el.omegaRad);
        const cosW = Math.cos(el.wRad);
        const sinW = Math.sin(el.wRad);

        const xEc = (cosO * cosW - sinO * sinW * cosI) * xPf + (-cosO * sinW - sinO * cosW * cosI) * yPf;
        const yEc = (sinO * cosW + cosO * sinW * cosI) * xPf + (-sinO * sinW + cosO * cosW * cosI) * yPf;
        const zEc = sinW * sinI * xPf + cosW * sinI * yPf;
        
        pos.set(xEc, yEc, zEc);
        
        // Velocity (approx via finite difference in ecliptic space)
        const eps = 0.001; // days
        const m2 = m + n * eps;
        let ea2 = m2;
        for (let k = 0; k < 6; k++) {
          ea2 -= (ea2 - el.e * Math.sin(ea2) - m2) / (1 - el.e * Math.cos(ea2));
        }
        const xPf2 = el.a * (Math.cos(ea2) - el.e);
        const yPf2 = el.a * Math.sqrt(Math.max(0, 1 - el.e * el.e)) * Math.sin(ea2);
        const xEc2 = (cosO * cosW - sinO * sinW * cosI) * xPf2 + (-cosO * sinW - sinO * cosW * cosI) * yPf2;
        const yEc2 = (sinO * cosW + cosO * sinW * cosI) * xPf2 + (-sinO * sinW + cosO * cosW * cosI) * yPf2;
        const zEc2 = sinW * sinI * xPf2 + cosW * sinI * yPf2;
        
        vel.set((xEc2 - xEc) / eps, (yEc2 - yEc) / eps, (zEc2 - zEc) / eps);
        
        physicsStatesRef.current[planet.id] = { pos, vel };
      }
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
    } else {
      // Standard Keplerian Path
      // Only skip if time is identical AND we are not in lab mode
      if (lastProcessedMsRef.current !== currentMs) {
        lastProcessedMsRef.current = currentMs;
        for (const planet of PLANETS) {
          const el = PLANET_ORBITAL_ELEMENTS[planet.id];
          if (!el) continue;
          propagate(el, currentMs, planetScratch, AU_SCALE);
          setLivePosition(planet.id, planetScratch.x, planetScratch.y, planetScratch.z);
        }
      }
    }

    // Moons and Satellites always update (to avoid stutter if time steps are small)
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
