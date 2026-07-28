// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { mockMatchMedia } from '../../../test/mockMatchMedia';

/**
 * `React.memo` on a component whose props are rebuilt every render does
 * nothing at all, and nothing about the code makes that visible — it is the
 * standard way memoization gets added and then quietly stops paying for
 * itself. These pin the two things that have to stay true for the HUD's memo
 * boundaries to hold: the callbacks keep their identity, and so does the
 * element handed to the largest region as a prop.
 */
describe('HUD callback identity', () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    vi.resetModules();
    media = mockMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    media.restore();
  });

  it('keeps the sheet-independent handlers stable across re-renders', async () => {
    const { useHudLogic } = await import('./useHudLogic');
    const { result, rerender } = renderHook(() => useHudLogic());

    const first = {
      closeNavSheets: result.current.closeNavSheets,
      handleResetToStart: result.current.handleResetToStart,
      handleBackToConstellationsMenu: result.current.handleBackToConstellationsMenu,
    };

    rerender();
    rerender();

    expect(result.current.closeNavSheets).toBe(first.closeNavSheets);
    expect(result.current.handleResetToStart).toBe(first.handleResetToStart);
    expect(result.current.handleBackToConstellationsMenu).toBe(
      first.handleBackToConstellationsMenu,
    );
  });

  /**
   * This one legitimately changes identity when the open sheet changes — it
   * closes over it — but it must not churn on unrelated renders.
   */
  it('keeps the toggle stable while the open sheet does not change', async () => {
    const { useHudLogic } = await import('./useHudLogic');
    const { result, rerender } = renderHook(() => useHudLogic());

    const before = result.current.handleToggleNavSheet;
    rerender();
    expect(result.current.handleToggleNavSheet).toBe(before);

    act(() => {
      result.current.handleToggleNavSheet('stars');
    });
    expect(result.current.handleToggleNavSheet).not.toBe(before);
  });
});

describe('useMediaQuery', () => {
  let media: ReturnType<typeof mockMatchMedia>;

  beforeEach(() => {
    vi.resetModules();
    media = mockMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    media.restore();
  });

  /**
   * The old shape got away with its mount-time re-sync because React bails
   * out when `setState` is handed the value it already holds — so this passed
   * before the change too. It is here to keep it that way: reading the live
   * value at render time must not reintroduce a second pass.
   */
  it('renders once on mount', async () => {
    const { useMediaQuery } = await import('../../../hooks/useMediaQuery');
    let renders = 0;

    const Probe = () => {
      renders += 1;
      useMediaQuery('(max-width: 768px)');
      return null;
    };

    render(<Probe />);
    expect(renders).toBe(1);
  });

  it('reports the live value without waiting for an effect', async () => {
    media.restore();
    media = mockMatchMedia(true);
    const { useMediaQuery } = await import('../../../hooks/useMediaQuery');

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('falls back to false where matchMedia is missing', async () => {
    const original = window.matchMedia;
    // @ts-expect-error deliberately removing it for this case
    delete window.matchMedia;
    vi.resetModules();
    const { useMediaQuery } = await import('../../../hooks/useMediaQuery');

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);

    window.matchMedia = original;
  });
});
