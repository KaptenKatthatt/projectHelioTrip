// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

/** jsdom ships no matchMedia; the desktop answer is what we want here. */
const stubMatchMedia = (): void => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
};

/**
 * The preference is the one thing that outranks the measurement, so what
 * matters is that pinning a level actually reaches the renderer *and* silences
 * the controller — and that the choice survives a reload.
 */
describe('graphics quality preference', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    stubMatchMedia();
  });

  const load = async () => {
    const { useStore } = await import('../../store/useStore');
    const { bindQualityPreference } = await import('./bindQualityPreference');
    const qualityStore = await import('./qualityStore');
    return { useStore, bindQualityPreference, qualityStore };
  };

  it('defaults to auto', async () => {
    const { useStore } = await load();
    expect(useStore.getState().graphicsQuality).toBe('auto');
  });

  it('pins the level and stands the controller down when the user chooses High', async () => {
    const { useStore, bindQualityPreference, qualityStore } = await load();
    const unbind = bindQualityPreference();

    useStore.getState().setGraphicsQuality(0);

    expect(qualityStore.getQualityLevel()).toBe(0);
    expect(qualityStore.getQualitySource()).toBe('user');
    unbind();
  });

  it('pins the bottom rung on Low, so the escape hatch is a real one', async () => {
    const { useStore, bindQualityPreference, qualityStore } = await load();
    const unbind = bindQualityPreference();

    useStore.getState().setGraphicsQuality(4);

    expect(qualityStore.getQualityLevel()).toBe(4);
    expect(qualityStore.getQualitySource()).toBe('user');
    unbind();
  });

  it('hands control back to the controller when returned to Auto', async () => {
    const { useStore, bindQualityPreference, qualityStore } = await load();
    const unbind = bindQualityPreference();

    useStore.getState().setGraphicsQuality(0);
    expect(qualityStore.getQualitySource()).toBe('user');

    useStore.getState().setGraphicsQuality('auto');
    expect(qualityStore.getQualitySource()).toBe('auto');
    unbind();
  });

  it('stops following the store once unbound', async () => {
    const { useStore, bindQualityPreference, qualityStore } = await load();
    const unbind = bindQualityPreference();
    unbind();

    useStore.getState().setGraphicsQuality(4);

    expect(qualityStore.getQualitySource()).not.toBe('user');
  });
});

describe('graphics quality persistence', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    stubMatchMedia();
  });

  it('survives a reload', async () => {
    const first = await import('../../store/useStore');
    first.useStore.getState().setGraphicsQuality(4);

    vi.resetModules();
    const second = await import('../../store/useStore');

    expect(second.useStore.getState().graphicsQuality).toBe(4);
  });

  /** A dropped field would silently revert the user's choice on every visit. */
  it('is actually written to storage, not just held in memory', async () => {
    const { useStore } = await import('../../store/useStore');
    useStore.getState().setGraphicsQuality(0);

    const raw = localStorage.getItem('heliotrip-preferences');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw ?? '{}').state.graphicsQuality).toBe(0);
  });

  it('falls back to auto when the stored value is nonsense', async () => {
    localStorage.setItem(
      'heliotrip-preferences',
      JSON.stringify({ state: { graphicsQuality: 'ultra' }, version: 0 }),
    );

    const { useStore } = await import('../../store/useStore');
    expect(useStore.getState().graphicsQuality).toBe('auto');
  });

  /** A shared link must not impose the sender's hardware settings. */
  it('is not carried by share links', async () => {
    const codec = await import('../shareLinkCodec');
    const search = codec.buildShareLinkSearch({
      bodyId: 'mars',
      simulationTimeMs: 0,
      timeScale: 1,
      gameMode: 'explore',
      missionId: null,
      navigationMode: 'cinematic',
    });

    expect(search).not.toContain('quality');
    expect(search).not.toContain('graphics');
  });
});
