import { QUALITY_PRESETS, isQualityLevel, type QualityLevel } from './qualityLevels';
import { TEXTURE_VARIANTS } from './textureVariants.generated';
import { resolveQualitySeed } from './initializeQuality';
import { readPersistedPreference } from '../../store/persistKey';

/**
 * Picks which copy of a texture to load.
 *
 * Resolved **once, from the level the app boots at**, and deliberately not
 * reactive. Every other rung of the ladder can be turned down mid-session
 * because it costs nothing to apply, but a texture is different: changing the
 * URL re-suspends the component, re-downloads the file and re-uploads it to
 * the GPU. Doing that at the moment the controller decides the machine is
 * struggling would stall it precisely when it is least able to absorb one —
 * the same reasoning that keeps anisotropy off already-loaded textures.
 *
 * The practical consequence is that the memory saving lands for anyone whose
 * machine is recognised as weak at startup — from the remembered profile or
 * the GPU string — and a session that degrades later keeps the textures it
 * already paid for. That is the right trade: the download is already spent by
 * then, and re-fetching would only add to the stall.
 */

let cachedMaxSize: number | null = null;

/** Test seam — production code never needs this. */
export const resetTextureResolution = (): void => {
  cachedMaxSize = null;
};

/**
 * The level the user pinned by hand, straight from storage.
 *
 * Read here rather than from the store because this runs while module-level
 * texture tables are being built, which is before the store exists. Without
 * it the seed alone would decide, and someone who had explicitly chosen High
 * on a machine the probe judged weak would keep being served 512px textures
 * — the one setting in the app whose whole purpose is to overrule that
 * judgement, silently ignored for the thing it costs the most. The raw
 * storage shape is parsed by `readPersistedPreference`, next to the persist
 * key, so there is exactly one place that knows it.
 */
const readPinnedLevel = (): QualityLevel | null => {
  const preference = readPersistedPreference('graphicsQuality');
  return isQualityLevel(preference) ? preference : null;
};

export const getTextureMaxSize = (): number => {
  cachedMaxSize ??=
    QUALITY_PRESETS[readPinnedLevel() ?? resolveQualitySeed().level]
      .textureMaxSize;
  return cachedMaxSize;
};

/**
 * Maps a source URL to the largest variant that fits within `maxSize`.
 *
 * A texture whose source is already small enough has no variant generated for
 * that cap, so falling through to the source is correct rather than a miss.
 */
export const resolveTextureUrl = (url: string, maxSize: number): string => {
  const entry = TEXTURE_VARIANTS[url];
  if (!entry) return url;
  // The source already fits. Checking this first is what keeps the top rung
  // on the original file rather than the largest downscaled copy.
  if (entry.native <= maxSize) return url;

  let best: number | null = null;
  for (const size of entry.sizes) {
    if (size <= maxSize && (best === null || size > best)) best = size;
  }
  return best === null ? url : url.replace(/\.webp$/, `-${best}.webp`);
};

/** The URL this session should load for `url`. */
export const textureUrl = (url: string): string =>
  resolveTextureUrl(url, getTextureMaxSize());
