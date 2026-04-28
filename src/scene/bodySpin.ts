import type { Group } from 'three';
import type { RefObject } from 'react';

const TAU = Math.PI * 2;

const resolveBodySpinY = (
  simulationTimeMs: number,
  periodMs: number,
): number => {
  const phase = (simulationTimeMs / periodMs) % 1;
  return phase * TAU;
};

export const applyBodySpinFromTime = (
  spinRef: RefObject<Group | null>,
  simulationTimeMs: number,
  periodMs: number,
): void => {
  const spin = spinRef.current;
  if (!spin) return;
  spin.rotation.y = resolveBodySpinY(simulationTimeMs, periodMs);
};
