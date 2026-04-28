const TAU = Math.PI * 2;

export const resolveBodySpinY = (
  simulationTimeMs: number,
  periodMs: number,
): number => {
  const phase = (simulationTimeMs / periodMs) % 1;
  return phase * TAU;
};
