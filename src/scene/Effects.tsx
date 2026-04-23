import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { DepthOfFieldEffect, ToneMappingMode } from 'postprocessing';
import { Vector3 } from 'three';
import { useStore } from '../store/useStore';
import { getBody, getBodyWorldPosition } from '../lib/bodies';
import { getStarWarsBody } from '../lib/starWarsSystems';

const DEFAULT_FOCUS_RANGE = 400;
const CLOSE_FOCUS_RANGE_MIN = 60;
const CLOSE_FOCUS_RANGE_PER_RADIUS = 12;

export const Effects = () => {
  const focusTarget = useMemo(() => new Vector3(), []);
  const dofRef = useRef<DepthOfFieldEffect>(null);

  /**
   * R3F applies the `target` prop via `effect.target.copy(value)`, which
   * snapshots the vector at render time. Without writing back each frame,
   * the DoF would focus on a stale position (initially the origin) and
   * blur every body we navigate to. Mutating `effect.target` directly
   * keeps `DepthOfFieldEffect.update()` in sync with the live body.
   */
  useFrame(() => {
    const { activeBody, selectedUniversePreset, selectedStarWarsBody, viewMode } =
      useStore.getState();
    if (viewMode === 'close' && selectedUniversePreset === 'starWars' && selectedStarWarsBody) {
      const body = getStarWarsBody(selectedStarWarsBody);
      if (body) focusTarget.set(...body.position);
      else focusTarget.set(0, 0, 0);
    } else if (viewMode === 'close' && activeBody) {
      getBodyWorldPosition(activeBody, focusTarget);
    } else {
      focusTarget.set(0, 0, 0);
    }
    const dof = dofRef.current;
    if (dof?.target) dof.target.copy(focusTarget);
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
        ref={dofRef}
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
  const selectedUniversePreset = useStore((s) => s.selectedUniversePreset);
  const selectedStarWarsBody = useStore((s) => s.selectedStarWarsBody);
  const viewMode = useStore((s) => s.viewMode);
  if (viewMode !== 'close') return DEFAULT_FOCUS_RANGE;
  if (selectedUniversePreset === 'starWars' && selectedStarWarsBody) {
    const starWarsBody = getStarWarsBody(selectedStarWarsBody);
    if (!starWarsBody) return DEFAULT_FOCUS_RANGE;
    return Math.max(
      starWarsBody.radius * CLOSE_FOCUS_RANGE_PER_RADIUS,
      CLOSE_FOCUS_RANGE_MIN,
    );
  }
  if (!activeBody) return DEFAULT_FOCUS_RANGE;
  const body = getBody(activeBody);
  if (!body) return DEFAULT_FOCUS_RANGE;
  return Math.max(
    body.def.radius * CLOSE_FOCUS_RANGE_PER_RADIUS,
    CLOSE_FOCUS_RANGE_MIN,
  );
};
