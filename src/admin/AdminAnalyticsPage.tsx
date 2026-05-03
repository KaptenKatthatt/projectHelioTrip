import { ChevronDown, ChevronRight, RefreshCw, Activity, Calendar, Database } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SignIn, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

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

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

type TooltipPayloadEntry = { name: string; value: number; color: string };
type CustomTooltipProps = { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string };

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[hsl(230_30%_15%)] p-3 shadow-xl">
        <p className="mb-1 text-sm font-medium text-[hsl(223_25%_91%)]">{label}</p>
        {payload.map((entry: TooltipPayloadEntry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
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
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <article className="ds-panel p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
                <Activity size={100} />
              </div>
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(225_16%_68%)] flex items-center gap-2">
                <Activity className="h-4 w-4" /> Last 14 days
              </h2>
              <p className="mt-3 tabular-nums text-4xl font-semibold leading-9 text-white">
                {total14d.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-[hsl(225_16%_68%)]">Event counts (UTC)</p>
            </article>
            <article className="ds-panel p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
                <Calendar size={100} />
              </div>
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(225_16%_68%)] flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Last 30 days
              </h2>
              <p className="mt-3 tabular-nums text-4xl font-semibold leading-9 text-white">
                {total30d.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-[hsl(225_16%_68%)]">Event counts (UTC)</p>
            </article>
            <article className="ds-panel p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 transition-transform group-hover:scale-110">
                <Database size={100} />
              </div>
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(225_16%_68%)] flex items-center gap-2">
                <Database className="h-4 w-4" /> Storage
              </h2>
              <p className="mt-3 text-2xl font-semibold leading-9 text-white">
                {summary.storage === "supabase" ? "Supabase" : "Local file"}
              </p>
              <p className="mt-2 text-xs text-[hsl(225_16%_68%)]">Source for aggregates</p>
            </article>
          </section>

          <section className="ds-panel p-6">
            <h2 className="text-xl font-semibold leading-8 text-[hsl(223_25%_91%)] mb-6">
              Daily Volume
            </h2>
            {dailyChart.length === 0 ? (
              <p className="text-sm text-[hsl(225_16%_68%)]">No daily data yet.</p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(238, 84%, 60%)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(238, 84%, 60%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => val.slice(5)} 
                      stroke="hsl(225, 16%, 68%)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="hsl(225, 16%, 68%)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="total" name="Events" stroke="hsl(238, 84%, 60%)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="ds-panel p-6">
              <h2 className="text-xl font-semibold leading-8 text-[hsl(223_25%_91%)] mb-4">
                Top 5 Planets
              </h2>
              {topPlanets.length === 0 ? (
                <p className="text-sm text-[hsl(225_16%_68%)]">No planet data yet.</p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topPlanets} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="hsl(225, 16%, 68%)" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="hsl(225, 16%, 68%)" fontSize={12} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Visits" fill="hsl(280, 84%, 60%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="ds-panel p-6">
              <h2 className="text-xl font-semibold leading-8 text-[hsl(223_25%_91%)] mb-4">
                Mission Funnel
              </h2>
              {missionFunnel.length === 0 ? (
                <p className="text-sm text-[hsl(225_16%_68%)]">No mission data yet.</p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={missionFunnel} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="hsl(225, 16%, 68%)" fontSize={12} />
                      <YAxis stroke="hsl(225, 16%, 68%)" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Events" radius={[4, 4, 0, 0]}>
                        {missionFunnel.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="ds-panel p-6">
              <h2 className="text-xl font-semibold leading-8 text-[hsl(223_25%_91%)] mb-4">
                Game Modes
              </h2>
              {modeData.length === 0 ? (
                <p className="text-sm text-[hsl(225_16%_68%)]">No mode-change data yet.</p>
              ) : (
                <div className="h-64 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {modeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                    <span className="text-2xl font-bold text-white">
                      {modeData.reduce((a, b) => a + b.value, 0)}
                    </span>
                  </div>
                </div>
              )}
            </section>

            <section className="ds-panel space-y-3 p-6 max-h-[400px] overflow-y-auto">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-semibold leading-8 text-[hsl(223_25%_91%)]">
                  All Events
                </h2>
                <span className="text-xs text-[hsl(225_16%_68%)]">
                  Updated: {summary.updatedAt ? new Date(summary.updatedAt).toLocaleString() : "n/a"}
                </span>
              </div>
              {byEvent.length === 0 ? (
                <p className="text-sm text-[hsl(225_16%_68%)]">No events yet.</p>
              ) : (
                <div className="space-y-3">
                  {byEvent.map((event) => {
                    const expanded = expandedEvents.has(event.name);
                    return (
                      <article key={event.name} className="rounded-2xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10">
                        <button
                          type="button"
                          onClick={() => toggleEventExpanded(event.name)}
                          className="flex w-full items-center justify-between p-3 text-left"
                          aria-expanded={expanded}
                        >
                          <span className="flex min-w-0 items-center gap-2 font-medium text-[hsl(223_25%_91%)]">
                            {expanded ? (
                              <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(225_16%_68%)]" aria-hidden />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(225_16%_68%)]" aria-hidden />
                            )}
                            <span className="truncate">{event.name}</span>
                          </span>
                          <span className="shrink-0 tabular-nums text-sm font-semibold text-[hsl(223_25%_91%)] bg-white/10 px-2 py-1 rounded-md">
                            {event.total.toLocaleString()}
                          </span>
                        </button>
                        {expanded && event.breakdown.length > 0 ? (
                          <ul className="space-y-1 border-t border-white/10 p-3 pt-2 text-sm text-[hsl(225_16%_68%)] bg-black/20 rounded-b-2xl">
                            {event.breakdown.map((item) => (
                              <li key={`${event.name}-${item.value}`} className="flex justify-between gap-4">
                                <span className="min-w-0 truncate">{formatBreakdownLabel(item.value)}</span>
                                <span className="shrink-0 tabular-nums text-[hsl(223_25%_91%)]">{item.count.toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
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
