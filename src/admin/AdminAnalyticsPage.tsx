import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

type EventBreakdown = {
  value: string;
  count: number;
};

type EventSummary = {
  name: string;
  total: number;
  breakdown: EventBreakdown[];
};

type DaySummary = {
  date: string;
  total: number;
};

type AnalyticsSummary = {
  updatedAt: string;
  storage: 'supabase' | 'local-file';
  byEvent: EventSummary[];
  byDay: DaySummary[];
};
const NBR_TIMES_ACTIVATED_LABEL = 'nbr_times_activated';
const BREAKDOWN_PREVIEW_LIMIT = 6;
const DAILY_PREVIEW_LIMIT = 14;
const TOKEN_STORAGE_KEY = 'heliotrip.analytics.adminToken';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isEventBreakdown = (value: unknown): value is EventBreakdown =>
  isObject(value) &&
  typeof value.value === 'string' &&
  typeof value.count === 'number' &&
  Number.isFinite(value.count);

const isEventSummary = (value: unknown): value is EventSummary =>
  isObject(value) &&
  typeof value.name === 'string' &&
  typeof value.total === 'number' &&
  Number.isFinite(value.total) &&
  Array.isArray(value.breakdown) &&
  value.breakdown.every(isEventBreakdown);

const isDaySummary = (value: unknown): value is DaySummary =>
  isObject(value) &&
  typeof value.date === 'string' &&
  typeof value.total === 'number' &&
  Number.isFinite(value.total);

const isAnalyticsSummary = (value: unknown): value is AnalyticsSummary =>
  isObject(value) &&
  typeof value.updatedAt === 'string' &&
  (value.storage === 'supabase' || value.storage === 'local-file') &&
  Array.isArray(value.byEvent) &&
  value.byEvent.every(isEventSummary) &&
  Array.isArray(value.byDay) &&
  value.byDay.every(isDaySummary);

const formatBreakdownLabel = (value: string): string =>
  value === 'none' ? NBR_TIMES_ACTIVATED_LABEL : value;

export const AdminAnalyticsPage = () => {
  const [token, setToken] = useState('');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
    setToken(stored);
  }, []);

  const hasToken = token.trim().length > 0;

  const fetchSummary = async (inputToken: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const response = await fetch('/api/analytics/summary', {
        headers: { 'x-analytics-token': inputToken.trim() },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const raw = await response.json();
      if (!isAnalyticsSummary(raw)) {
        throw new Error('invalid_analytics_summary_payload');
      }
      setSummary(raw);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown_error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = token.trim();
    window.localStorage.setItem(TOKEN_STORAGE_KEY, trimmed);
    void fetchSummary(trimmed);
  };

  const byEvent = useMemo(() => summary?.byEvent ?? [], [summary]);
  const byDay = useMemo(() => summary?.byDay ?? [], [summary]);
  
  const visibleByDay = byDay.slice(0, DAILY_PREVIEW_LIMIT);
  const hiddenByDayCount = Math.max(byDay.length - DAILY_PREVIEW_LIMIT, 0);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 text-white">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">HelioTrip analytics</h1>
        <p className="text-sm text-white/70">
          Open this page with your admin token.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-2xl border border-white/15 bg-black/30 p-4"
      >
        <label className="block space-y-2">
          <span className="text-sm text-white/80">Analytics admin token</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
            placeholder="Enter ANALYTICS_ADMIN_TOKEN"
            autoComplete="off"
          />
        </label>
        <button
          type="submit"
          disabled={!hasToken || loading}
          className="rounded-md border border-white/30 px-3 py-2 text-sm enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load analytics'}
        </button>
      </form>
      {error ? (
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm">
          Could not load analytics: {error}
        </p>
      ) : null}

      {summary ? (
        <>
          <section className="space-y-3 rounded-2xl border border-white/15 bg-black/30 p-4">
            <h2 className="text-lg font-semibold">By event</h2>
            <p className="text-xs text-white/60">
              Updated: {summary.updatedAt ? new Date(summary.updatedAt).toLocaleString() : 'n/a'}
            </p>
            <p className="text-xs text-white/60">
              Storage: {summary.storage === 'supabase' ? 'Supabase' : 'Local file fallback'}
            </p>
            {byEvent.length === 0 ? (
              <p className="text-sm text-white/70">No events yet.</p>
            ) : (
              byEvent.map((event) => {
                const visibleBreakdown = event.breakdown.slice(0, BREAKDOWN_PREVIEW_LIMIT);
                const hiddenBreakdownCount = Math.max(
                  event.breakdown.length - BREAKDOWN_PREVIEW_LIMIT,
                  0,
                );
                return (
                  <article
                    key={event.name}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{event.name}</h3>
                      <span className="text-sm text-white/80">{event.total}</span>
                    </div>
                    {event.breakdown.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm text-white/70">
                        {visibleBreakdown.map((item) => (
                          <li key={`${event.name}-${item.value}`}>
                            {formatBreakdownLabel(item.value)}: {item.count}
                          </li>
                        ))}
                        {hiddenBreakdownCount > 0 ? (
                          <li
                            className="text-white/50"
                            aria-label={`${hiddenBreakdownCount} more breakdown values not shown`}
                          >
                            +{hiddenBreakdownCount} more
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </article>
                );
              })
            )}
          </section>

          <section className="space-y-2 rounded-2xl border border-white/15 bg-black/30 p-4">
            <h2 className="text-lg font-semibold">Last days</h2>
            {byDay.length === 0 ? (
              <p className="text-sm text-white/70">No daily data yet.</p>
            ) : (
              <ul className="space-y-1 text-sm text-white/80">
                {visibleByDay.map((row) => (
                  <li key={row.date} className="flex justify-between">
                    <span>{row.date}</span>
                    <span>{row.total}</span>
                  </li>
                ))}
                {hiddenByDayCount > 0 ? (
                  <li
                    className="text-white/50"
                    aria-label={`${hiddenByDayCount} more daily rows not shown`}
                  >
                    +{hiddenByDayCount} more
                  </li>
                ) : null}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
};
