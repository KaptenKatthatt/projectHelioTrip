import { RefreshCw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  formatBreakdownLabel,
} from "./analytics/types";
import type { AnalyticsSummary, DaySummary } from "./analytics/types";
import { SummaryCards } from "./analytics/SummaryCards";
import { DailyVolumeChart } from "./analytics/DailyVolumeChart";
import { BreakdownCharts } from "./analytics/BreakdownCharts";
import { EventList } from "./analytics/EventList";
import { SignIn, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAnalyticsSummary = (value: unknown): value is AnalyticsSummary =>
  isObject(value) &&
  typeof value.updatedAt === "string" &&
  (value.storage === "supabase" || value.storage === "local-file") &&
  Array.isArray(value.byEvent) &&
  Array.isArray(value.byDay);

const httpErrorMessage = (status: number): string => {
  if (status === 403) return "Wrong password or missing permission.";
  if (status === 404) return "API not found (check deployment / GET /api/health).";
  if (status === 503) return "Admin login is not configured on the server.";
  if (status >= 500) return "Server error while loading analytics.";
  return `HTTP ${status}`;
};

const sumTotalsLastUtcDays = (byDay: DaySummary[], dayCount: number): number => {
  if (dayCount <= 0) return 0;
  const today = new Date();
  let sum = 0;
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
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

const AnalyticsDashboard = ({ getToken, userButton }: { getToken: () => Promise<string | null>; userButton?: React.ReactNode; }) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(() => new Set());

  useEffect(() => { document.title = "HelioTrip analytics"; }, []);

  const fetchSummary = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) { setSummary(null); return false; }
      const response = await fetch("/api/analytics/summary", { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) {
        setSummary(null);
        if (response.status === 403) { setError(null); return false; }
        setError(httpErrorMessage(response.status));
        return false;
      }
      const raw = await response.json();
      if (!isAnalyticsSummary(raw)) throw new Error("invalid_analytics_summary_payload");
      setSummary(raw);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown_error");
      setSummary(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { const id = setTimeout(() => { void fetchSummary(); }, 0); return () => clearTimeout(id); }, [fetchSummary]);

  const toggleEventExpanded = (name: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const byEvent = useMemo(() => summary?.byEvent ?? [], [summary]);
  const byDay = useMemo(() => summary?.byDay ?? [], [summary]);
  const total14d = useMemo(() => sumTotalsLastUtcDays(byDay, 14), [byDay]);
  const total30d = useMemo(() => sumTotalsLastUtcDays(byDay, 30), [byDay]);
  const dailyChart = useMemo(() => chartDays(byDay, 30), [byDay]);

  const planetEvent = byEvent.find(e => e.name === "planet_selected");
  const topPlanets = useMemo(() => {
    if (!planetEvent) return [];
    return [...planetEvent.breakdown]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(b => ({ name: formatBreakdownLabel(b.value), count: b.count }));
  }, [planetEvent]);

  const modeEvent = byEvent.find(e => e.name === "mode_changed");
  const modeData = useMemo(() => {
    if (!modeEvent) return [];
    return modeEvent.breakdown.map(b => ({ name: formatBreakdownLabel(b.value), value: b.count }));
  }, [modeEvent]);

  const missionFunnel = useMemo(() => {
    const started = byEvent.find(e => e.name === "mission_started")?.total || 0;
    const completedSteps = byEvent.find(e => e.name === "mission_step_completed")?.total || 0;
    const completed = byEvent.find(e => e.name === "mission_completed")?.total || 0;
    const abandoned = byEvent.find(e => e.name === "mission_abandoned")?.total || 0;
    
    if (started === 0) return [];

    return [
      { name: "Started", count: started },
      { name: "Steps done", count: completedSteps },
      { name: "Completed", count: completed },
      { name: "Abandoned", count: abandoned }
    ];
  }, [byEvent]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="ds-eyebrow">Anonymous usage</p>
          <h1 className="text-3xl font-semibold leading-9 text-[hsl(223_25%_91%)]">
            HelioTrip Analytics
          </h1>
          <p className="text-sm leading-5 text-[hsl(225_16%_68%)] max-w-xl">
            Aggregated event counts only. No user ids, accounts, or fingerprints.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void fetchSummary()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[hsl(230_30%_15%)] px-4 py-2 text-sm font-medium text-[hsl(223_25%_91%)] transition-colors hover:border-[hsl(232_89%_66%)]/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            Refresh
          </button>
          {userButton}
        </div>
      </header>

      {error ? (
        <p className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100 shadow-sm" role="alert">
          Could not load analytics: {error}
        </p>
      ) : null}

      {summary ? (
        <div className="space-y-6">
          <SummaryCards summary={summary} total14d={total14d} total30d={total30d} />
          <DailyVolumeChart data={dailyChart} />
          <BreakdownCharts topPlanets={topPlanets} missionFunnel={missionFunnel} modeData={modeData} />
          <EventList events={byEvent} expandedEvents={expandedEvents} onToggleExpand={toggleEventExpanded} updatedAt={summary.updatedAt} />
        </div>
      ) : null}
    </main>
  );
};

const SignedInAnalyticsDashboard = () => {
  const { getToken } = useAuth();
  return (
    <AnalyticsDashboard 
      getToken={getToken} 
      userButton={
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-9 w-9",
            },
          }}
        />
      }
    />
  );
};

export const AdminAnalyticsPage = () => {
  const isMock = window.location.search.includes("mock_auth=true");

  if (isMock) {
    return <AnalyticsDashboard getToken={() => Promise.resolve("mock-token")} />;
  }

  return (
    <>
      <SignedIn>
        <SignedInAnalyticsDashboard />
      </SignedIn>
      <SignedOut>
        <div className="ds-panel flex justify-center p-8">
          <SignIn routing="hash" forceRedirectUrl="/admin/analytics" />
        </div>
      </SignedOut>
    </>
  );
};
