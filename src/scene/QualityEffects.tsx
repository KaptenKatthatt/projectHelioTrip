import { useEffect } from 'react';
import { useStore as useR3FStore } from '@react-three/fiber';
import { ACESFilmicToneMapping, NoToneMapping } from 'three';
import {
  getEffectiveDpr,
  getQualityPreset,
  subscribeQuality,
} from '../lib/quality/qualityStore';

/**
 * Applies quality changes that are renderer state rather than scene graph.
 *
 * Deliberately imperative: routing the pixel ratio through the `<Canvas dpr>`
 * prop would re-render `Scene` and the whole `SceneContent` tree every time
 * the controller trimmed resolution, which is the opposite of the point.
 * Nothing here causes a React render.
 *
 * The renderer is read out of R3F's store inside the callback rather than
 * captured from `useThree`, so this reads as what it is — a write to
 * long-lived engine state, not a mutation of a rendered value.
 */
export const QualityEffects = () => {
  const r3fStore = useR3FStore();

  useEffect(() => {
    const apply = () => {
      const { gl, setDpr } = r3fStore.getState();
      const preset = getQualityPreset();
      const devicePixelRatio =
        typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;

      setDpr(getEffectiveDpr(devicePixelRatio));

      /**
       * The post-processing composer owns tone mapping while it is mounted.
       * The lowest level unmounts it entirely, which would otherwise leave the
       * scene flat and blown out — so the renderer has to take the job back.
       */
      gl.toneMapping = preset.postProcessingEnabled
        ? NoToneMapping
        : ACESFilmicToneMapping;
      gl.toneMappingExposure = 1;
    };

    apply();
    return subscribeQuality(apply);
  }, [r3fStore]);

  return null;
};
