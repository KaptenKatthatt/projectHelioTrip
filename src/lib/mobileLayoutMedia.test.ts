import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  matchesMobileLayout,
  MOBILE_LAYOUT_MEDIA_QUERY,
  COARSE_TOUCH_PRIMARY_MQ,
  FINE_POINTER_PHONE_LANDSCAPE_MQ,
} from './mobileLayoutMedia';

describe('matchesMobileLayout', () => {
  const originalWindow = global.window;

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  it('returns false when window is undefined', () => {
    const original = global.window;
    // @ts-expect-error simulating undefined window
    global.window = undefined;
    expect(matchesMobileLayout()).toBe(false);
    global.window = original;
  });

  function setupMatchMediaMock(
    mobileSize: boolean,
    coarsePrimary: boolean,
    landscapeFine: boolean
  ) {
    if (typeof window === 'undefined') {
      // Create a mock window object if it's undefined (e.g., in node environment without jsdom)
      global.window = {} as any;
    }
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches:
          (query === MOBILE_LAYOUT_MEDIA_QUERY && mobileSize) ||
          (query === COARSE_TOUCH_PRIMARY_MQ && coarsePrimary) ||
          (query === FINE_POINTER_PHONE_LANDSCAPE_MQ && landscapeFine),
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

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
