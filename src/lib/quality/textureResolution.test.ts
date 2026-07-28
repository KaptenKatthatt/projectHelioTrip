import { describe, expect, it } from 'vitest';
import { resolveTextureUrl } from './textureResolution';
import { TEXTURE_VARIANTS } from './textureVariants.generated';
import { QUALITY_LEVELS, QUALITY_PRESETS } from './qualityLevels';

const SOURCES = Object.keys(TEXTURE_VARIANTS);
const OVERSIZED = '/textures/europa/diffuse.webp'; // native 4096
const MODEST = '/textures/earth/clouds.webp'; // native 1024

describe('resolveTextureUrl', () => {
  /**
   * The promise the whole ladder rests on. `native` exists in the manifest
   * precisely so this case cannot regress: without it the top rung picks the
   * largest *downscaled* copy, and every machine quietly loses resolution.
   */
  it('leaves every texture at its source on the top rung', () => {
    const cap = QUALITY_PRESETS[0].textureMaxSize;
    for (const url of SOURCES) {
      expect(resolveTextureUrl(url, cap), url).toBe(url);
    }
  });

  it('downshifts a texture that exceeds the cap', () => {
    expect(resolveTextureUrl(OVERSIZED, 2048)).toBe(
      '/textures/europa/diffuse-2048.webp',
    );
    expect(resolveTextureUrl(OVERSIZED, 1024)).toBe(
      '/textures/europa/diffuse-1024.webp',
    );
    expect(resolveTextureUrl(OVERSIZED, 512)).toBe(
      '/textures/europa/diffuse-512.webp',
    );
  });

  it('leaves a texture alone when the source already fits', () => {
    expect(resolveTextureUrl(MODEST, 2048)).toBe(MODEST);
    expect(resolveTextureUrl(MODEST, 1024)).toBe(MODEST);
  });

  it('falls back to the source for a url with no variants', () => {
    expect(resolveTextureUrl('/textures/nothing/here.webp', 512)).toBe(
      '/textures/nothing/here.webp',
    );
  });

  /**
   * A cap below every generated variant must still resolve to a real file.
   * Returning a URL for a variant that was never written would 404 and leave
   * the body untextured.
   */
  it('never names a variant that was not generated', () => {
    for (const url of SOURCES) {
      for (const cap of [4096, 2048, 1024, 512, 256]) {
        const resolved = resolveTextureUrl(url, cap);
        if (resolved === url) continue;
        const size = Number(/-(\d+)\.webp$/.exec(resolved)?.[1]);
        expect(TEXTURE_VARIANTS[url]?.sizes, `${url} @ ${cap}`).toContain(size);
      }
    }
  });

  it('picks a smaller or equal copy at every step down the ladder', () => {
    for (const url of SOURCES) {
      let previous = Infinity;
      for (const level of QUALITY_LEVELS) {
        const cap = QUALITY_PRESETS[level].textureMaxSize;
        const resolved = resolveTextureUrl(url, cap);
        const size =
          Number(/-(\d+)\.webp$/.exec(resolved)?.[1]) ||
          (TEXTURE_VARIANTS[url]?.native ?? 0);
        expect(size, `${url} at level ${level}`).toBeLessThanOrEqual(previous);
        previous = size;
      }
    }
  });
});

describe('the ladder and the generator agree', () => {
  /**
   * Every cap below the top rung has to correspond to a size the generator
   * actually emits, or the app asks for files that were never written.
   */
  it('uses only caps the generator emits, or one above every source', () => {
    const generated = new Set([2048, 1024, 512]);
    const largestNative = Math.max(
      ...Object.values(TEXTURE_VARIANTS).map((entry) => entry.native),
    );

    for (const level of QUALITY_LEVELS) {
      const cap = QUALITY_PRESETS[level].textureMaxSize;
      expect(
        generated.has(cap) || cap >= largestNative,
        `level ${level} cap ${cap}`,
      ).toBe(true);
    }
  });
});
