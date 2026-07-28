// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockMatchMedia } from '../../test/mockMatchMedia';

/**
 * The notice exists to explain an unexpected change, so the only thing that
 * makes it worth showing at all is that something actually changed. A weak
 * machine that opened on a low rung and stayed there has nothing to explain —
 * telling it that "the graphics were lowered" is simply false, and it would
 * have been the common case: every phone and every integrated-graphics desktop
 * seeds below the noticeable threshold before a frame is ever measured.
 */
describe('QualityNoticeToast', () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    localStorage.clear();
    media = mockMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    media.restore();
  });

  /**
   * Pins the level the app "opened" at by planting a remembered profile, which
   * is the first thing the seed resolver consults.
   */
  const seedAt = async (level: number) => {
    const { buildGpuKey } = await import('../../lib/quality/qualityProfileStorage');
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

  const mount = async () => {
    const { initializeQuality, resetQualityInitialization } = await import(
      '../../lib/quality/initializeQuality'
    );
    resetQualityInitialization();
    initializeQuality();
    const quality = await import('../../lib/quality/qualityStore');
    const { QualityNoticeToast } = await import('./QualityNoticeToast');
    render(<QualityNoticeToast />);
    return quality;
  };

  /** Mirrors the component's own auto-dismiss delay. */
  const VISIBLE_MS = 6000;

  /** Past the settle delay and well inside the visible window. */
  const settle = async () => {
    await vi.advanceTimersByTimeAsync(11_000);
  };

  it('says nothing when the machine merely started low', async () => {
    await seedAt(3);
    const quality = await mount();

    // What `bindQualityPreference` does before the first frame: it hands the
    // same level back to the controller, rewriting the source from boot to
    // auto without anything having moved.
    quality.setQualityLevel(3, 'auto');
    await settle();

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('speaks up when the controller actually steps down', async () => {
    await seedAt(0);
    const quality = await mount();

    quality.setQualityLevel(3, 'auto');
    await settle();

    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('stays quiet for a drop too small to see', async () => {
    await seedAt(0);
    const quality = await mount();

    quality.setQualityLevel(1, 'auto');
    await settle();

    expect(screen.queryByRole('status')).toBeNull();
  });

  /**
   * The notice's only call to action is "change this under About", so the user
   * doing exactly that must not be the one case where it never goes away. It
   * used to be: the hide timer lived in the effect keyed on the preference, so
   * pinning a level cancelled the countdown and stranded the notice on screen
   * for the rest of the session.
   */
  it('still closes itself after the user takes control', async () => {
    await seedAt(0);
    const quality = await mount();
    quality.setQualityLevel(3, 'auto');
    await settle();
    expect(screen.getByRole('status')).toBeTruthy();

    const { useStore } = await import('../../store/useStore');
    await act(async () => {
      useStore.getState().setGraphicsQuality(0);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(VISIBLE_MS + 1000);
    });

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('never speaks twice, on any later visit', async () => {
    await seedAt(0);
    const first = await mount();
    first.setQualityLevel(3, 'auto');
    await settle();
    expect(screen.getByRole('status')).toBeTruthy();

    cleanup();
    vi.resetModules();
    await seedAt(0);
    const second = await mount();
    second.setQualityLevel(3, 'auto');
    await settle();

    expect(screen.queryByRole('status')).toBeNull();
  });
});
