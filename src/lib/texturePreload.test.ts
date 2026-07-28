import { describe, expect, it } from 'vitest';
import { shouldPreloadUrlForTier } from './texturePreload';
import { resolveTextureUrl } from './quality/textureResolution';
import { QUALITY_LEVELS, QUALITY_PRESETS } from './quality/qualityLevels';

/**
 * A filter that silently stops filtering is the worst shape a bug can take:
 * nothing errors, nothing looks different, and the only symptom is that the
 * weakest devices eagerly download maps they were meant to skip. That is what
 * happened when the quality ladder began appending a `-1024` suffix to
 * texture URLs and these patterns still expected a bare `normal.webp`.
 */
describe('shouldPreloadUrlForTier', () => {
  const DIFFUSE = '/textures/earth/diffuse.webp';
  const NORMAL = '/textures/earth/normal.webp';
  const ROUGHNESS = '/textures/earth/roughness.webp';

  it('always preloads colour maps', () => {
    for (const tier of ['high', 'medium', 'low'] as const) {
      expect(shouldPreloadUrlForTier(DIFFUSE, tier)).toBe(true);
    }
  });

  it('skips data maps below the top tier', () => {
    expect(shouldPreloadUrlForTier(NORMAL, 'high')).toBe(true);
    expect(shouldPreloadUrlForTier(NORMAL, 'medium')).toBe(true);
    expect(shouldPreloadUrlForTier(NORMAL, 'low')).toBe(false);

    expect(shouldPreloadUrlForTier(ROUGHNESS, 'medium')).toBe(false);
    expect(shouldPreloadUrlForTier(ROUGHNESS, 'low')).toBe(false);
  });

  /**
   * The regression. Every one of these URLs is what the resolver actually
   * hands the preloader on a machine that booted below the top rung — which
   * is the only situation where the filter matters at all.
   */
  it('still recognises data maps once the ladder has resized them', () => {
    for (const level of QUALITY_LEVELS) {
      const cap = QUALITY_PRESETS[level].textureMaxSize;
      const normal = resolveTextureUrl(NORMAL, cap);
      const roughness = resolveTextureUrl(ROUGHNESS, cap);

      expect(shouldPreloadUrlForTier(normal, 'low'), normal).toBe(false);
      expect(shouldPreloadUrlForTier(roughness, 'medium'), roughness).toBe(false);
      expect(shouldPreloadUrlForTier(roughness, 'low'), roughness).toBe(false);
    }
  });

  it('does not mistake a resized colour map for a data map', () => {
    const diffuse = resolveTextureUrl(DIFFUSE, 512);
    expect(diffuse).toContain('-512');
    expect(shouldPreloadUrlForTier(diffuse, 'low')).toBe(true);
  });
});
