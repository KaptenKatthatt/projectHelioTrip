import { useEffect } from 'react';
import { useStore as useR3FStore } from '@react-three/fiber';
import { ACESFilmicToneMapping, NoToneMapping } from 'three';
import { getEffectiveDpr, subscribeQuality } from '../lib/quality/qualityStore';
import { useQualityPreset } from '../hooks/useQualityPreset';

/**
 * Applies quality changes that are renderer state rather than scene graph.
 *
 * The pixel ratio is applied imperatively: routing it through the `<Canvas dpr>`
 * prop would re-render `Scene` and the whole `SceneContent` tree every time the
 * controller trimmed resolution, which is the opposite of the point. Only tone
 * mapping subscribes reactively, and only this component — which renders null —
 * re-renders when it changes.
 *
 * The renderer is read out of R3F's store inside the callback rather than
 * captured from `useThree`, so this reads as what it is — a write to
 * long-lived engine state, not a mutation of a rendered value.
 */
export const QualityEffects = () => {
  const r3fStore = useR3FStore();
  const postProcessingEnabled = useQualityPreset((p) => p.postProcessingEnabled);

  useEffect(() => {
    const apply = () => {
      const { viewport, setDpr } = r3fStore.getState();
      const devicePixelRatio =
        typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
      const wanted = getEffectiveDpr(devicePixelRatio);
      if (viewport.dpr !== wanted) setDpr(wanted);
    };

    apply();
    const stopFollowingQuality = subscribeQuality(apply);
    /**
     * `<Canvas>` re-runs `configure()` on every render of its own component —
     * the layout effect that does so has no dependency array — and `configure`
     * writes the `dpr` prop straight back over `viewport.dpr`. Without
     * re-asserting here, any re-render of `Scene` (landing, taking off, a
     * parent render) silently throws away the resolution the controller
     * trimmed. `apply` is a no-op once the value already matches, so following
     * R3F's own store cannot loop.
     */
    const stopFollowingR3F = r3fStore.subscribe(apply);

    return () => {
      stopFollowingQuality();
      stopFollowingR3F();
    };
  }, [r3fStore]);

  /**
   * Tone mapping is deliberately *not* driven from the subscription above.
   * The post-processing composer owns tone mapping while it is mounted and
   * restores the value it captured at mount when it unmounts — so setting it
   * synchronously from the store subscription would be undone moments later by
   * the very commit that removes the composer. Reacting to the rendered value
   * instead puts this write in the passive-effect phase, which React runs
   * *after* every unmount cleanup in the same commit.
   */
  useEffect(() => {
    const { gl } = r3fStore.getState();
    gl.toneMapping = postProcessingEnabled
      ? NoToneMapping
      : ACESFilmicToneMapping;
    gl.toneMappingExposure = 1;
  }, [postProcessingEnabled, r3fStore]);

  return null;
};
