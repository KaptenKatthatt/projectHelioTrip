// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockMatchMedia } from '../../test/mockMatchMedia';
import { PERSISTED_PREFERENCES_KEY } from '../../store/persistKey';
import { QUALITY_PRESETS } from './qualityLevels';

/**
 * Texture size is the one rung resolved from storage rather than from the
 * live quality store, because it is decided before the store exists. That
 * makes it the easiest one to wire to the wrong input — and the most
 * expensive to get wrong, since it is worth roughly 25x the download and 20x
 * the video memory between the top and bottom rungs.
 */
describe('getTextureMaxSize', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    mockMatchMedia(false);
  });

  const rememberHardwareLevel = async (level: number) => {
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

  const pinPreference = (graphicsQuality: unknown) => {
    localStorage.setItem(
      PERSISTED_PREFERENCES_KEY,
      JSON.stringify({ state: { graphicsQuality }, version: 0 }),
    );
  };

  const load = async () => {
    const init = await import('./initializeQuality');
    init.resetQualityInitialization();
    const module = await import('./textureResolution');
    module.resetTextureResolution();
    return module;
  };

  it('follows the hardware seed when the user has not chosen', async () => {
    await rememberHardwareLevel(4);
    const { getTextureMaxSize } = await load();

    expect(getTextureMaxSize()).toBe(QUALITY_PRESETS[4].textureMaxSize);
  });

  /**
   * The gap this test exists for: the setting whose entire purpose is to
   * overrule the probe was being ignored for the most expensive thing on the
   * ladder, so someone who picked High on a machine judged weak kept getting
   * 512px textures.
   */
  it('lets a pinned level overrule a pessimistic seed', async () => {
    await rememberHardwareLevel(4);
    pinPreference(0);
    const { getTextureMaxSize } = await load();

    expect(getTextureMaxSize()).toBe(QUALITY_PRESETS[0].textureMaxSize);
  });

  it('lets a pinned level overrule an optimistic seed', async () => {
    await rememberHardwareLevel(0);
    pinPreference(4);
    const { getTextureMaxSize } = await load();

    expect(getTextureMaxSize()).toBe(QUALITY_PRESETS[4].textureMaxSize);
  });

  it('treats auto as no choice at all', async () => {
    await rememberHardwareLevel(3);
    pinPreference('auto');
    const { getTextureMaxSize } = await load();

    expect(getTextureMaxSize()).toBe(QUALITY_PRESETS[3].textureMaxSize);
  });

  it('ignores a stored value it does not recognise', async () => {
    await rememberHardwareLevel(3);
    pinPreference('ultra');
    const { getTextureMaxSize } = await load();

    expect(getTextureMaxSize()).toBe(QUALITY_PRESETS[3].textureMaxSize);
  });

  it('survives unparseable storage', async () => {
    await rememberHardwareLevel(2);
    localStorage.setItem(PERSISTED_PREFERENCES_KEY, '{not json');
    const { getTextureMaxSize } = await load();

    expect(getTextureMaxSize()).toBe(QUALITY_PRESETS[2].textureMaxSize);
  });

  /**
   * Resolved once and then frozen: re-reading it after a runtime downgrade
   * would swap every texture URL, re-suspending and re-downloading the whole
   * set at the exact moment the machine was found to be struggling.
   */
  it('does not move when the level changes mid-session', async () => {
    await rememberHardwareLevel(0);
    const { getTextureMaxSize } = await load();
    const first = getTextureMaxSize();

    const { setQualityLevel } = await import('./qualityStore');
    setQualityLevel(4, 'auto');

    expect(getTextureMaxSize()).toBe(first);
  });
});
