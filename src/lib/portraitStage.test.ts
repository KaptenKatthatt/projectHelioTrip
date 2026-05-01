import { describe, expect, it } from 'vitest';
import { computePortraitStageSize, shouldPhoneLandscapePortraitLock } from './portraitStage';

describe('computePortraitStageSize', () => {
  it('letterboxes a landscape viewport to portrait aspect', () => {
    const { width, height } = computePortraitStageSize(844, 390);
    expect(height).toBe(390);
    expect(width).toBe(Math.round((390 * 390) / 844));
  });

  it('returns full viewport in physical portrait', () => {
    const { width, height } = computePortraitStageSize(390, 844);
    expect(width).toBe(390);
    expect(height).toBe(844);
  });
});

describe('shouldPhoneLandscapePortraitLock', () => {
  it('is true for handheld touch landscape with a phone-sized short edge', () => {
    expect(
      shouldPhoneLandscapePortraitLock(844, 390, true, true),
    ).toBe(true);
  });

  it('is false without handheld touch signals (e.g. narrow mouse desktop)', () => {
    expect(
      shouldPhoneLandscapePortraitLock(600, 500, false, true),
    ).toBe(false);
  });

  it('is false in portrait', () => {
    expect(
      shouldPhoneLandscapePortraitLock(390, 844, true, false),
    ).toBe(false);
  });

  it('is false for tablet-class short edge', () => {
    expect(
      shouldPhoneLandscapePortraitLock(1200, 700, true, true),
    ).toBe(false);
  });
});
