import { describe, expect, it } from 'vitest';
import { formatDaysPerSecond, formatTimeScaleNumber } from './timePlayback';

describe('timePlayback', () => {
  describe('formatTimeScaleNumber', () => {
    it('formats numbers less than 1 to 2 decimal places', () => {
      expect(formatTimeScaleNumber(0.25)).toBe('0.25');
      expect(formatTimeScaleNumber(0.5)).toBe('0.50');
      expect(formatTimeScaleNumber(0.123)).toBe('0.12');
    });

    it('formats integers >= 1 with no decimal places', () => {
      expect(formatTimeScaleNumber(1)).toBe('1');
      expect(formatTimeScaleNumber(7)).toBe('7');
      expect(formatTimeScaleNumber(30)).toBe('30');
      expect(formatTimeScaleNumber(365)).toBe('365');
    });

    it('formats non-integers >= 1 to 1 decimal place', () => {
      expect(formatTimeScaleNumber(1.5)).toBe('1.5');
      expect(formatTimeScaleNumber(3.14)).toBe('3.1');
      expect(formatTimeScaleNumber(7.99)).toBe('8.0');
    });
  });

  describe('formatDaysPerSecond', () => {
    it('adds " d/s" suffix to formatted number', () => {
      expect(formatDaysPerSecond(0.25)).toBe('0.25 d/s');
      expect(formatDaysPerSecond(1)).toBe('1 d/s');
      expect(formatDaysPerSecond(1.5)).toBe('1.5 d/s');
      expect(formatDaysPerSecond(365)).toBe('365 d/s');
    });
  });
});
