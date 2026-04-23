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
import { getBody, getBodyWorldPosition } from '../lib/bodies';

const DEFAULT_FOCUS_RANGE = 400;
const CLOSE_FOCUS_RANGE_MIN = 60;
const CLOSE_FOCUS_RANGE_PER_RADIUS = 12;

export const Effects = () => {
  const focusTarget = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const { activeBody, viewMode } = useStore.getState();
    if (viewMode === 'close' && activeBody) {
      getBodyWorldPosition(activeBody, focusTarget);
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
        bokehScale={1.2}
      />
      <Vignette offset={0.35} darkness={0.55} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
};

/**
 * Focus range (world units) must comfortably contain the active body plus
 * its rings/clouds. Small bodies historically fell just outside the
 * in-focus zone due to the Kawase-blur + bokeh being sampled at half
 * resolution, so we keep a generous floor.
 */
const useFocusRange = (): number => {
  const activeBody = useStore((s) => s.activeBody);
  const viewMode = useStore((s) => s.viewMode);
  if (viewMode !== 'close' || !activeBody) return DEFAULT_FOCUS_RANGE;
  const body = getBody(activeBody);
  if (!body) return DEFAULT_FOCUS_RANGE;
  return Math.max(
    body.def.radius * CLOSE_FOCUS_RANGE_PER_RADIUS,
    CLOSE_FOCUS_RANGE_MIN,
  );
};
