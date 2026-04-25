import { useEffect, useState } from 'react';

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

export const AdminAnalyticsPage = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const token = new URLSearchParams(window.location.search).get('token');
        const endpoint = token
          ? `/api/analytics/summary?token=${encodeURIComponent(token)}`
          : '/api/analytics/summary';
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as AnalyticsSummary;
        if (mounted) setSummary(data);
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'unknown_error';
          setError(message);
        }
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 text-white">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">HelioTrip analytics</h1>
        <p className="text-sm text-white/70">
          Anonymous event stats from <code>/api/analytics/event</code>.
        </p>
        {summary ? (
          <p className="text-xs text-white/60">
            Storage: {summary.storage === 'supabase' ? 'Supabase' : 'Local file fallback'}
          </p>
        ) : null}
      </header>

      {error ? (
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm">
          Could not load analytics: {error}
        </p>
      ) : null}

      {!summary && !error ? (
        <p className="text-sm text-white/70">Loading…</p>
      ) : null}

      {summary ? (
        <>
          <section className="space-y-3 rounded-2xl border border-white/15 bg-black/30 p-4">
            <h2 className="text-lg font-semibold">By event</h2>
            <p className="text-xs text-white/60">
              Updated: {summary.updatedAt ? new Date(summary.updatedAt).toLocaleString() : 'n/a'}
            </p>
            {summary.byEvent.length === 0 ? (
              <p className="text-sm text-white/70">No events yet.</p>
            ) : (
              summary.byEvent.map((event) => (
                <article key={event.name} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{event.name}</h3>
                    <span className="text-sm text-white/80">{event.total}</span>
                  </div>
                  {event.breakdown.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-sm text-white/70">
                      {event.breakdown.slice(0, 6).map((item) => (
                        <li key={`${event.name}-${item.value}`}>
                          {item.value === 'none' ? 'nbr_times_activated' : item.value}: {item.count}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))
            )}
          </section>

          <section className="space-y-2 rounded-2xl border border-white/15 bg-black/30 p-4">
            <h2 className="text-lg font-semibold">Last days</h2>
            {summary.byDay.length === 0 ? (
              <p className="text-sm text-white/70">No daily data yet.</p>
            ) : (
              <ul className="space-y-1 text-sm text-white/80">
                {summary.byDay.slice(0, 14).map((row) => (
                  <li key={row.date} className="flex justify-between">
                    <span>{row.date}</span>
                    <span>{row.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
};
