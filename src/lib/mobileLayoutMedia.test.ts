// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { matchesMobileLayout, MOBILE_LAYOUT_MATCH_MEDIA_QUERY } from './mobileLayoutMedia';

describe('matchesMobileLayout', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    globalThis.window = originalWindow;
    vi.restoreAllMocks();
  });

  function setupMatchMediaMock(
    mobileSize: boolean,
    coarsePrimary: boolean,
    landscapeFine: boolean
  ) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches:
          query === MOBILE_LAYOUT_MATCH_MEDIA_QUERY &&
          (mobileSize || coarsePrimary || landscapeFine),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  it('returns false when window is undefined', () => {
    // @ts-expect-error simulating undefined window
    globalThis.window = undefined;
    expect(matchesMobileLayout()).toBe(false);
  });

  it('returns true when MOBILE_LAYOUT_MEDIA_QUERY matches', () => {
    setupMatchMediaMock(true, false, false);
    expect(matchesMobileLayout()).toBe(true);
  });

  it('returns true when COARSE_TOUCH_PRIMARY_MQ matches', () => {
    setupMatchMediaMock(false, true, false);
    expect(matchesMobileLayout()).toBe(true);
  });

  it('returns true when FINE_POINTER_PHONE_LANDSCAPE_MQ matches', () => {
    setupMatchMediaMock(false, false, true);
    expect(matchesMobileLayout()).toBe(true);
  });

  it('returns false when no media queries match', () => {
    setupMatchMediaMock(false, false, false);
    expect(matchesMobileLayout()).toBe(false);
  });
});
