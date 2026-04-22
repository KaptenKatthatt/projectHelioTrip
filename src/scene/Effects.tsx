import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Vector3 } from 'three';
import { useStore } from '../store/useStore';
import { getPlanet } from '../lib/planets';
import { getLivePosition } from '../lib/positionsBus';

const DEFAULT_FOCUS_RANGE = 200;

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

  const focusRange = useFocusRange();

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        mipmapBlur
        intensity={1.2}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.2}
        radius={0.85}
      />
      <DepthOfField
        target={focusTarget}
        focusRange={focusRange}
        bokehScale={2}
      />
      <Vignette offset={0.35} darkness={0.55} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
};

/**
 * Focus range must be wide enough to contain the active body (its full
 * radius + comfortable margin) in sharp focus. In `focusRange` world units.
 */
const useFocusRange = (): number => {
  const activePlanet = useStore((s) => s.activePlanet);
  const viewMode = useStore((s) => s.viewMode);
  if (viewMode !== 'close' || !activePlanet) return DEFAULT_FOCUS_RANGE;
  const planet = getPlanet(activePlanet);
  if (!planet) return DEFAULT_FOCUS_RANGE;
  return Math.max(planet.radius * 8, 25);
};
