import { getEffectiveDpr, getQualityPreset } from './qualityStore';

export type SurfaceCanvasQuality = {
  readonly shadowsEnabled: boolean;
  readonly shadowMapSize: number;
  readonly dpr: number;
};

/**
 * The quality settings for a surface scene, resolved once when it mounts.
 *
 * The Mars and Moon scenes each own a separate `<Canvas>`, and both of those
 * settings are fixed at context creation or close enough to it that changing
 * them mid-scene would mean tearing the canvas down. That is safe to read once
 * because the adaptive controller freezes itself for the whole duration of a
 * landing, so the level cannot move while a surface scene is on screen — the
 * value read at mount is still the right one when the user takes off again.
 *
 * Until this existed the surface scenes ignored the ladder completely: they
 * asked for `dpr={[1, 2]}` and a 1024 shadow map no matter what the machine
 * had shown itself capable of, which meant the heaviest scenes in the app were
 * also the only ones the whole feature could not reach.
 */
export const readSurfaceCanvasQuality = (): SurfaceCanvasQuality => {
  const shadowMapSize = getQualityPreset().surfaceShadowMapSize;
  const devicePixelRatio =
    typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;

  return {
    shadowsEnabled: shadowMapSize > 0,
    shadowMapSize,
    dpr: getEffectiveDpr(devicePixelRatio),
  };
};
