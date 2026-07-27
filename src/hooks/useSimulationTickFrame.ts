import { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { getSimulationTimeMs } from '../lib/simulationClock';

export function useSimulationTickFrame(onTick: (simMs: number) => void) {
  const lastSimMsRef = useRef<number | null>(null);
  const onTickRef = useRef(onTick);
  useLayoutEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useFrame(() => {
    const simMs = getSimulationTimeMs();
    if (lastSimMsRef.current === simMs) return;
    lastSimMsRef.current = simMs;
    onTickRef.current(simMs);
  });
}
