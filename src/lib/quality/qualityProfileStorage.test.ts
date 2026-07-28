// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildGpuKey, readQualityProfile, writeQualityProfile } from './qualityProfileStorage';

const KEY = 'heliotrip-quality-profile';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('qualityProfileStorage', () => {
  it('round-trips a profile for the same GPU', () => {
    const gpuKey = buildGpuKey('Apple M2');
    writeQualityProfile({
      gpuKey,
      lastStableLevel: 2,
      lastStableDprStep: 1,
      failedLevels: [1],
    });

    const read = readQualityProfile(gpuKey);
    expect(read?.lastStableLevel).toBe(2);
    expect(read?.lastStableDprStep).toBe(1);
    expect(read?.failedLevels).toEqual([1]);
  });

  /** A different machine, or the same laptop on a much larger screen. */
  it('ignores a profile recorded against another GPU key', () => {
    writeQualityProfile({
      gpuKey: buildGpuKey('Apple M2'),
      lastStableLevel: 0,
      lastStableDprStep: 0,
      failedLevels: [],
    });

    expect(readQualityProfile(buildGpuKey('Intel UHD 620'))).toBeNull();
  });

  it('includes the screen size in the key', () => {
    const before = buildGpuKey('Apple M2');
    Object.defineProperty(window.screen, 'width', { configurable: true, value: 3840 });
    expect(buildGpuKey('Apple M2')).not.toBe(before);
  });

  it('ignores a profile written by a different version', () => {
    const gpuKey = buildGpuKey('Apple M2');
    localStorage.setItem(
      KEY,
      JSON.stringify({ v: 99, gpuKey, lastStableLevel: 2, lastStableDprStep: 0, failedLevels: [], updatedAtMs: Date.now() }),
    );
    expect(readQualityProfile(gpuKey)).toBeNull();
  });

  it('ignores corrupt JSON rather than throwing', () => {
    localStorage.setItem(KEY, '{ not json');
    expect(() => readQualityProfile(buildGpuKey(null))).not.toThrow();
    expect(readQualityProfile(buildGpuKey(null))).toBeNull();
  });

  it('rejects a stored level that is not a real level', () => {
    const gpuKey = buildGpuKey('Apple M2');
    localStorage.setItem(
      KEY,
      JSON.stringify({ v: 1, gpuKey, lastStableLevel: 9, lastStableDprStep: 0, failedLevels: [], updatedAtMs: Date.now() }),
    );
    expect(readQualityProfile(gpuKey)).toBeNull();
  });

  /** Driver and browser updates change the answer, so a bar cannot be permanent. */
  it('forgets failed levels after a month but keeps the profile', () => {
    const gpuKey = buildGpuKey('Apple M2');
    const fortyDaysAgo = Date.now() - 40 * 24 * 3600 * 1000;
    localStorage.setItem(
      KEY,
      JSON.stringify({
        v: 1,
        gpuKey,
        lastStableLevel: 2,
        lastStableDprStep: 0,
        failedLevels: [1],
        updatedAtMs: fortyDaysAgo,
      }),
    );

    const read = readQualityProfile(gpuKey);
    expect(read?.lastStableLevel).toBe(2);
    expect(read?.failedLevels).toEqual([]);
  });

  it('discards a profile older than three months', () => {
    const gpuKey = buildGpuKey('Apple M2');
    localStorage.setItem(
      KEY,
      JSON.stringify({
        v: 1,
        gpuKey,
        lastStableLevel: 2,
        lastStableDprStep: 0,
        failedLevels: [],
        updatedAtMs: Date.now() - 100 * 24 * 3600 * 1000,
      }),
    );
    expect(readQualityProfile(gpuKey)).toBeNull();
  });

  /** Safari private mode throws on setItem; losing the hint must not crash. */
  it('swallows a storage write that throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() =>
      writeQualityProfile({
        gpuKey: buildGpuKey('Apple M2'),
        lastStableLevel: 1,
        lastStableDprStep: 0,
        failedLevels: [],
      }),
    ).not.toThrow();
  });
});
