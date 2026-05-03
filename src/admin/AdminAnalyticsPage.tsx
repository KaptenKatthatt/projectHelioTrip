import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SignIn, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";

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
  storage: "supabase" | "local-file";
  byEvent: EventSummary[];
  byDay: DaySummary[];
};

const NBR_TIMES_ACTIVATED_LABEL = "nbr_times_activated";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isEventBreakdown = (value: unknown): value is EventBreakdown =>
  isObject(value) &&
  typeof value.value === "string" &&
  typeof value.count === "number" &&
  Number.isFinite(value.count);

const isEventSummary = (value: unknown): value is EventSummary =>
  isObject(value) &&
  typeof value.name === "string" &&
  typeof value.total === "number" &&
  Number.isFinite(value.total) &&
  Array.isArray(value.breakdown) &&
  value.breakdown.every(isEventBreakdown);

const isDaySummary = (value: unknown): value is DaySummary =>
  isObject(value) &&
  typeof value.date === "string" &&
  typeof value.total === "number" &&
  Number.isFinite(value.total);

const isAnalyticsSummary = (value: unknown): value is AnalyticsSummary =>
  isObject(value) &&
  typeof value.updatedAt === "string" &&
  (value.storage === "supabase" || value.storage === "local-file") &&
  Array.isArray(value.byEvent) &&
  value.byEvent.every(isEventSummary) &&
  Array.isArray(value.byDay) &&
  value.byDay.every(isDaySummary);

const formatBreakdownLabel = (value: string): string =>
  value === "none" ? NBR_TIMES_ACTIVATED_LABEL : value;

const httpErrorMessage = (status: number): string => {
  if (status === 403) {
    return "Wrong password or missing permission.";
  }
  if (status === 404) {
    return "API not found (check deployment / GET /api/health).";
  }
  if (status === 503) {
    return "Admin login is not configured on the server.";
  }
  if (status >= 500) {
    return "Server error while loading analytics.";
  }
  return `HTTP ${status}`;
};

const sumTotalsLastUtcDays = (
  byDay: DaySummary[],
  dayCount: number,
): number => {
  if (dayCount <= 0) return 0;
  const today = new Date();
  let sum = 0;
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - i,
      ),
    );
    const key = d.toISOString().slice(0, 10);
    const row = byDay.find((x) => x.date === key);
    if (row) sum += row.total;
  }
  return sum;
};

const chartDays = (byDay: DaySummary[], maxBars: number): DaySummary[] => {
  const sorted = [...byDay].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length <= maxBars) return sorted;
  return sorted.slice(sorted.length - maxBars);
};

export const AdminAnalyticsPage = () => {
  const { getToken } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    document.title = "HelioTrip analytics";
  }, []);

  const fetchSummary = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setSummary(null);
        return false;
      }
      const response = await fetch("/api/analytics/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        setSummary(null);
        if (response.status === 403) {
          setError(null);
          return false;
        }
        setError(httpErrorMessage(response.status));
        return false;
      }
      const raw = await response.json();
      if (!isAnalyticsSummary(raw)) {
        throw new Error("invalid_analytics_summary_payload");
      }
      setSummary(raw);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown_error";
      setError(message);
      setSummary(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  const toggleEventExpanded = (name: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const byEvent = useMemo(
    () => summary?.byEvent ?? [],
    [summary],
  );
  const byDay = useMemo(() => summary?.byDay ?? [], [summary]);

  const total14d = useMemo(
    () => sumTotalsLastUtcDays(byDay, 14),
    [byDay],
  );
  const total30d = useMemo(
    () => sumTotalsLastUtcDays(byDay, 30),
    [byDay],
  );

  const dailyChart = useMemo(() => chartDays(byDay, 14), [byDay]);
  const maxDaily = useMemo(
    () => dailyChart.reduce((m, r) => Math.max(m, r.total), 0),
    [dailyChart],
  );



  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <p className="ds-eyebrow">Anonymous usage</p>
        <h1 className="text-3xl font-semibold leading-9 text-[hsl(223_25%_91%)]">
          HelioTrip analytics
        </h1>
        <p className="text-sm leading-5 text-[hsl(225_16%_68%)]">
          Aggregated event counts only. No user ids, accounts, or fingerprints.
          Hosting may log network metadata separately.
        </p>
      </header>

      <SignedIn>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void fetchSummary()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[hsl(230_30%_15%)] px-4 py-2 text-sm font-medium text-[hsl(223_25%_91%)] transition-colors hover:border-[hsl(232_89%_66%)]/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-9 w-9",
              },
            }}
          />
        </div>
      </SignedIn>

      <SignedOut>
        <div className="ds-panel flex justify-center p-8">
          <SignIn routing="hash" forceRedirectUrl="/admin/analytics" />
        </div>
      </SignedOut>

      {loading ? (
        <p className="text-sm text-[hsl(225_16%_68%)]">Loading…</p>
      ) : null}

      {error ? (
        <p
          className="rounded-2xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100"
          role="alert"
        >
          Could not load analytics: {error}
        </p>
      ) : null}

      {summary ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <article className="ds-panel p-4">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(225_16%_68%)]">
                Last 14 days
              </h2>
              <p className="mt-2 tabular-nums text-3xl font-semibold leading-9 text-[hsl(223_25%_91%)]">
                {total14d.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[hsl(225_16%_68%)]">
                Event counts (UTC days)
              </p>
            </article>
            <article className="ds-panel p-4">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(225_16%_68%)]">
                Last 30 days
              </h2>
              <p className="mt-2 tabular-nums text-3xl font-semibold leading-9 text-[hsl(223_25%_91%)]">
                {total30d.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[hsl(225_16%_68%)]">
                Event counts (UTC days)
              </p>
            </article>
            <article className="ds-panel p-4">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(225_16%_68%)]">
                Storage
              </h2>
              <p className="mt-2 text-lg font-semibold leading-6 text-[hsl(223_25%_91%)]">
                {summary.storage === "supabase" ? "Supabase" : "Local file"}
              </p>
              <p className="mt-1 text-xs text-[hsl(225_16%_68%)]">
                Source for aggregates
              </p>
            </article>
          </section>

          <section className="ds-panel space-y-3 p-4">
            <h2 className="text-2xl font-semibold leading-8 text-[hsl(223_25%_91%)]">
              By event
            </h2>
            <p className="text-xs text-[hsl(225_16%_68%)]">
              Updated:{" "}
              {summary.updatedAt
                ? new Date(summary.updatedAt).toLocaleString()
                : "n/a"}
            </p>
            {byEvent.length === 0 ? (
              <p className="text-sm text-[hsl(225_16%_68%)]">No events yet.</p>
            ) : (
              byEvent.map((event) => {
                const expanded = expandedEvents.has(event.name);
                return (
                  <article
                    key={event.name}
                    className="rounded-2xl border border-white/10 bg-white/3 p-3"
                  >
                    <button
                      type="button"
                      onClick={() => toggleEventExpanded(event.name)}
                      className="flex w-full items-center justify-between gap-3 text-left"
                      aria-expanded={expanded}
                    >
                      <span className="flex min-w-0 items-center gap-2 font-medium text-[hsl(223_25%_91%)]">
                        {expanded ? (
                          <ChevronDown
                            className="h-4 w-4 shrink-0 text-[hsl(225_16%_68%)]"
                            aria-hidden
                          />
                        ) : (
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-[hsl(225_16%_68%)]"
                            aria-hidden
                          />
                        )}
                        <span className="truncate">{event.name}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-sm text-[hsl(223_25%_91%)]">
                        {event.total.toLocaleString()}
                      </span>
                    </button>
                    {expanded && event.breakdown.length > 0 ? (
                      <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm text-[hsl(225_16%_68%)]">
                        {event.breakdown.map((item) => (
                          <li
                            key={`${event.name}-${item.value}`}
                            className="flex justify-between gap-4"
                          >
                            <span className="min-w-0 truncate">
                              {formatBreakdownLabel(item.value)}
                            </span>
                            <span className="shrink-0 tabular-nums">
                              {item.count.toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                );
              })
            )}
          </section>

          <section className="ds-panel space-y-3 p-4">
            <h2 className="text-2xl font-semibold leading-8 text-[hsl(223_25%_91%)]">
              Daily volume
            </h2>
            {dailyChart.length === 0 ? (
              <p className="text-sm text-[hsl(225_16%_68%)]">
                No daily data yet.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex h-28 items-end gap-1 sm:gap-2">
                  {dailyChart.map((row) => {
                    const h =
                      maxDaily > 0 ? (row.total / maxDaily) * 100 : 0;
                    return (
                      <div
                        key={row.date}
                        className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                        title={`${row.date}: ${row.total}`}
                      >
                        <div
                          className="w-full max-w-[28px] rounded-t bg-[hsl(238_84%_60%)]/70 sm:max-w-none"
                          style={{ height: `${Math.max(h, 4)}%` }}
                        />
                        <span className="max-w-full truncate text-center text-[10px] text-[hsl(225_16%_68%)] sm:text-xs">
                          {row.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-[hsl(225_16%_68%)]">
                  Last {dailyChart.length} UTC days with data (up to 14 bars).
                </p>
              </div>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
};
