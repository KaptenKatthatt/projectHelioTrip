import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing';
import { Vector3 } from 'three';
import { useStore } from '../store/useStore';
import { getLivePosition } from '../lib/positionsBus';

export const Effects = () => {
  const focusTarget = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const { activePlanet, viewMode } = useStore.getState();
    if (viewMode === 'close' && activePlanet) {
      focusTarget.copy(getLivePosition(activePlanet));
    } else {
      focusTarget.set(0, 0, 0);
    }
  });

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        mipmapBlur
        intensity={1.4}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.25}
        radius={0.8}
      />
      <DepthOfField
        target={focusTarget}
        focalLength={0.035}
        bokehScale={3}
        focusRange={0.012}
      />
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>
  );
};
