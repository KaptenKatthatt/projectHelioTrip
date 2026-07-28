import { useRef } from 'react';
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
import { getBody, getBodyWorldPosition } from '../lib/bodies';
import { useQualityPreset } from '../hooks/useQualityPreset';
import { useStore } from '../store/useStore';

const DEFAULT_FOCUS_RANGE = 400;
const CLOSE_FOCUS_RANGE_MIN = 60;
const CLOSE_FOCUS_RANGE_PER_RADIUS = 12;

/** Shared with `EffectsFull` so mobile (reduced) matches desktop sun / HDR look. */
const BLOOM_PROPS = {
  mipmapBlur: true,
  intensity: 1.2,
  luminanceThreshold: 0.7,
  luminanceSmoothing: 0.2,
  radius: 0.85,
} as const;

const VIGNETTE_PROPS = { offset: 0.35, darkness: 0.55 } as const;

export const Effects = () => {
  const postProcessingEnabled = useQualityPreset((p) => p.postProcessingEnabled);
  const depthOfField = useQualityPreset((p) => p.depthOfField);
  const bloom = useQualityPreset((p) => p.bloom);
  const effectComposerMsaa = useQualityPreset((p) => p.effectComposerMsaa);
  const viewMode = useStore((s) => s.viewMode);
  const isTraveling = useStore((s) => s.isTraveling);

  /**
   * The lowest level drops the composer entirely. `QualityEffects` hands tone
   * mapping back to the renderer when that happens, so the scene does not go
   * flat and blown out.
   */
  if (!postProcessingEnabled) return null;
  /**
   * DoF uses Kawase blur at reduced resolution; with viewMode already "close"
   * while the camera is still in overview, the whole frame reads as a sudden
   * "resolution drop" and stays mushy until the fly-in finishes. Keep close-up
   * DoF only after cinematic travel settles.
   */
  const shouldUseDof = depthOfField && viewMode === 'close' && !isTraveling;

  if (!shouldUseDof) {
    return (
      <EffectComposer multisampling={effectComposerMsaa}>
        {bloom ? <Bloom {...BLOOM_PROPS} /> : <></>}
        <Vignette {...VIGNETTE_PROPS} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    );
  }

  return <EffectsFullClose />;
};

const tmpFocusTarget = new Vector3();

const EffectsFullClose = () => {
  const dofRef = useRef<DepthOfFieldEffect>(null);
  const effectComposerMsaa = useQualityPreset((p) => p.effectComposerMsaa);
  const bloom = useQualityPreset((p) => p.bloom);

  /**
   * R3F applies the `target` prop via `effect.target.copy(value)`, which
   * snapshots the vector at render time. Without writing back each frame,
   * the DoF would focus on a stale position (initially the origin) and
   * blur every body we navigate to. Mutating `effect.target` directly
   * keeps `DepthOfFieldEffect.update()` in sync with the live body.
   */
  useFrame(() => {
    const { activeBody, viewMode } = useStore.getState();
    if (viewMode === 'close' && activeBody) {
      getBodyWorldPosition(activeBody, tmpFocusTarget);
    } else {
      tmpFocusTarget.set(0, 0, 0);
    }
    const dof = dofRef.current;
    if (dof?.target) dof.target.copy(tmpFocusTarget);
  });

  const focusRange = useFocusRange();

  return (
    <EffectComposer multisampling={effectComposerMsaa}>
      {bloom ? <Bloom {...BLOOM_PROPS} /> : <></>}
      <DepthOfField
        ref={dofRef}
        target={tmpFocusTarget}
        focusRange={focusRange}
        bokehScale={1.2}
      />
      <Vignette {...VIGNETTE_PROPS} />
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
