// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockMatchMedia } from '../../test/mockMatchMedia';

/**
 * Boot seeding is the only thing standing between a weak machine and a first
 * few seconds at full quality, and it is applied exactly once, from module
 * scope, with nothing watching it. That makes it unusually easy to break
 * silently — which is what these cover.
 */
describe('initializeQuality', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    mockMatchMedia(false);
  });

  const load = async () => {
    const module = await import('./initializeQuality');
    module.resetQualityInitialization();
    return { ...module, quality: await import('./qualityStore') };
  };

  /** Pins the boot level by planting a remembered profile for this machine. */
  const rememberLevel = async (level: number) => {
    const { buildGpuKey } = await import('./qualityProfileStorage');
    localStorage.setItem(
      'heliotrip-quality-profile',
      JSON.stringify({
        v: 1,
        gpuKey: buildGpuKey(null),
        lastStableLevel: level,
        lastStableDprStep: 0,
        failedLevels: [],
        updatedAtMs: Date.now(),
      }),
    );
  };

  it('writes the seeded level to the quality store', async () => {
    await rememberLevel(3);
    const { initializeQuality, quality } = await load();

    initializeQuality();

    expect(quality.getQualityLevel()).toBe(3);
    expect(quality.getQualitySource()).toBe('boot');
  });

  /**
   * The regression. Module-level texture tables resolve the seed while they
   * are being built, which happens before `main.tsx` runs — so a guard that
   * treated "seed already computed" as "seed already applied" would skip the
   * store write entirely and leave every machine on the default rung, however
   * weak its GPU had just been measured to be.
   */
  it('still applies the level when something read the seed first', async () => {
    await rememberLevel(4);
    const { initializeQuality, resolveQualitySeed, quality } = await load();

    // What `textures.ts` does at import time.
    expect(resolveQualitySeed().level).toBe(4);
    expect(quality.getQualityLevel()).not.toBe(4);

    initializeQuality();

    expect(quality.getQualityLevel()).toBe(4);
    expect(quality.getQualitySource()).toBe('boot');
  });

  it('does not re-apply the level once the controller has moved it', async () => {
    await rememberLevel(2);
    const { initializeQuality, quality } = await load();
    initializeQuality();

    quality.setQualityLevel(0, 'auto');
    initializeQuality();

    expect(quality.getQualityLevel()).toBe(0);
    expect(quality.getQualitySource()).toBe('auto');
  });
});
