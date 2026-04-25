import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type AnalyticsStoreModule = typeof import('./analyticsStore');

const ORIGINAL_ENV = { ...process.env };

const loadAnalyticsStore = async (
  analyticsFilePath: string,
): Promise<AnalyticsStoreModule> => {
  vi.resetModules();
  process.env.ANALYTICS_FILE = analyticsFilePath;
  process.env.SUPABASE_URL = '';
  process.env.SUPABASE_SECRET_KEY = '';
  process.env.SUPABASE_SERVICE_ROLE_KEY = '';
  process.env.VERCEL = '';
  return import('./analyticsStore');
};

describe('analyticsStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-25T08:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = { ...ORIGINAL_ENV };
  });

  it('accepts only known analytics event names', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'heliotrip-analytics-'));
    const mod = await loadAnalyticsStore(path.join(tempDir, 'events.json'));

    expect(mod.isAnalyticsEventName('planet_selected')).toBe(true);
    expect(mod.isAnalyticsEventName('language_changed')).toBe(true);
    expect(mod.isAnalyticsEventName('totally_unknown_event')).toBe(false);
  });

  it('resolves analytics payload values in correct priority order', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'heliotrip-analytics-'));
    const mod = await loadAnalyticsStore(path.join(tempDir, 'events.json'));

    expect(
      mod.eventValueFromPayload({
        constellation_id: 'orion',
        body_id: 'earth',
        locale: 'sv',
        value: 'fallback',
      }),
    ).toBe('orion');
    expect(mod.eventValueFromPayload({ body_id: ' earth ' })).toBe('earth');
    expect(mod.eventValueFromPayload({ locale: ' en ' })).toBe('en');
    expect(mod.eventValueFromPayload({ value: ' custom ' })).toBe('custom');
    expect(mod.eventValueFromPayload({})).toBe('nbr_times_activated');
  });

  it('aggregates counts and creates analytics summary in local-file mode', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'heliotrip-analytics-'));
    const analyticsFilePath = path.join(tempDir, 'events.json');
    const mod = await loadAnalyticsStore(analyticsFilePath);

    await mod.recordAnalyticsEvent('language_changed', 'sv');
    await mod.recordAnalyticsEvent('language_changed', 'sv');
    await mod.recordAnalyticsEvent('planet_selected', 'earth');

    const summary = await mod.readAnalyticsSummary();

    expect(summary.storage).toBe('local-file');
    expect(summary.byEvent.map((event) => [event.name, event.total])).toEqual([
      ['language_changed', 2],
      ['planet_selected', 1],
    ]);
    expect(summary.byEvent[0]?.breakdown).toEqual([{ value: 'sv', count: 2 }]);
    expect(summary.byDay).toEqual([{ date: '2026-04-25', total: 3 }]);

    const rawStore = await readFile(analyticsFilePath, 'utf8');
    expect(rawStore).toContain('"name":"language_changed"');
  });
});
