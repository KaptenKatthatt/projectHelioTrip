import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnalyticsSummary, DaySummary } from "./types";
import { formatBreakdownLabel } from "./types";

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

export const useAnalyticsData = (getToken: () => Promise<string | null>) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(() => new Set());

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

  return {
    summary,
    error,
    loading,
    expandedEvents,
    fetchSummary,
    toggleEventExpanded,
    byEvent,
    total14d,
    total30d,
    dailyChart,
    topPlanets,
    modeData,
    missionFunnel,
  };
};
