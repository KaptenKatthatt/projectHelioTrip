import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AnalyticsEventName =
  | "planet_selected"
  | "language_changed"
  | "free_flight_activated"
  | "constellation_opened"
  | "play_clicked"
  | "pause_clicked"
  | "solar_system_start_clicked"
  | "mode_changed"
  | "mission_started"
  | "mission_step_completed"
  | "mission_completed"
  | "mission_abandoned"
  | "checklist_progress"
  | "achievement_unlocked"
  | "share_link_created"
  | "share_link_restored";

type AnalyticsAggregate = {
  date: string;
  name: AnalyticsEventName;
  value: string;
  count: number;
};

type AnalyticsStore = {
  updatedAt: string;
  aggregates: AnalyticsAggregate[];
};

const EMPTY_STORE: AnalyticsStore = {
  updatedAt: new Date(0).toISOString(),
  aggregates: [],
};

const STORE_FILE = process.env.ANALYTICS_FILE
  ? path.resolve(process.env.ANALYTICS_FILE)
  : process.env.VERCEL
    ? "/tmp/heliotrip-analytics.json"
    : path.join(process.cwd(), ".analytics", "events.json");

// Process-local queue only; it does not serialize writes across instances/processes.
let writeQueue: Promise<void> = Promise.resolve();
let cache: AnalyticsStore | null = null;
let cacheLoadedAtMs = 0;
let supabaseClient: SupabaseClient | null = null;

const SUPABASE_URL = process.env.SUPABASE_URL?.trim() ?? "";
const SUPABASE_SECRET_KEY = (
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  ""
).trim();
// Used only for best-effort fallback paths. Prefer RPC increments for correctness across instances.
const SUPABASE_TABLE =
  process.env.ANALYTICS_SUPABASE_TABLE?.trim() || "analytics_events_daily";
const HAS_SUPABASE = SUPABASE_URL.length > 0 && SUPABASE_SECRET_KEY.length > 0;
const SUPABASE_INCREMENT_RPC =
  process.env.ANALYTICS_SUPABASE_INCREMENT_RPC?.trim() ||
  "increment_analytics_event";
const ANALYTICS_QUERY_LIMIT = (() => {
  const raw = process.env.ANALYTICS_QUERY_LIMIT?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return 5000;
  return parsed;
})();
const ANALYTICS_CACHE_TTL_MS = (() => {
  const raw = process.env.ANALYTICS_CACHE_TTL_MS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return 10_000;
  return parsed;
})();

const setCacheValue = (store: AnalyticsStore): AnalyticsStore => {
  cache = store;
  cacheLoadedAtMs = Date.now();
  return store;
};
const isRpcNotDeployedError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const maybeCode =
    "code" in error ? (error.code as string | undefined) : undefined;
  const maybeMessage =
    "message" in error ? (error.message as string | undefined) : undefined;
  return (
    maybeCode === "PGRST202" ||
    maybeCode === "42883" ||
    (typeof maybeMessage === "string" &&
      maybeMessage.toLowerCase().includes("increment_analytics_event"))
  );
};

const safeReadStore = async (): Promise<AnalyticsStore> => {
  if (cache && Date.now() - cacheLoadedAtMs < ANALYTICS_CACHE_TTL_MS) {
    return cache;
  }
  try {
    const content = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(content) as Partial<AnalyticsStore>;
    const rawAggregates = Array.isArray(parsed.aggregates)
      ? parsed.aggregates
      : [];
    const store: AnalyticsStore = {
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date(0).toISOString(),
      aggregates: rawAggregates.filter(isAnalyticsAggregate),
    };
    return setCacheValue(store);
  } catch (err) {
    console.error("Failed to read analytics store, using empty fallback", {
      storeFile: STORE_FILE,
      error: err,
    });
    return setCacheValue({ ...EMPTY_STORE });
  }
};

const getSupabaseClient = (): SupabaseClient | null => {
  if (!HAS_SUPABASE) return null;
  if (supabaseClient) return supabaseClient;
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return supabaseClient;
};

const persistStore = async (store: AnalyticsStore): Promise<void> => {
  await mkdir(path.dirname(STORE_FILE), { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store), "utf8");
};

// Use UTC day buckets so analytics aggregation is stable across server timezones.
const utcDay = (): string => new Date().toISOString().slice(0, 10);
const EMPTY_VALUE_LABEL = "nbr_times_activated";

const normalizeValue = (raw: string | undefined): string => {
  const value = (raw ?? "").trim();
  return value.length > 0 ? value.slice(0, 64) : EMPTY_VALUE_LABEL;
};

const VALID_EVENT_NAMES = new Set<AnalyticsEventName>([
  "planet_selected",
  "language_changed",
  "free_flight_activated",
  "constellation_opened",
  "play_clicked",
  "pause_clicked",
  "solar_system_start_clicked",
  "mode_changed",
  "mission_started",
  "mission_step_completed",
  "mission_completed",
  "mission_abandoned",
  "checklist_progress",
  "achievement_unlocked",
  "share_link_created",
  "share_link_restored",
]);

export const isAnalyticsEventName = (raw: string): raw is AnalyticsEventName =>
  VALID_EVENT_NAMES.has(raw as AnalyticsEventName);

const isAnalyticsAggregate = (entry: unknown): entry is AnalyticsAggregate => {
  if (!entry || typeof entry !== "object") return false;
  const candidate = entry as Partial<AnalyticsAggregate>;
  return (
    typeof candidate.date === "string" &&
    typeof candidate.name === "string" &&
    isAnalyticsEventName(candidate.name) &&
    typeof candidate.value === "string" &&
    typeof candidate.count === "number" &&
    Number.isFinite(candidate.count) &&
    candidate.count > 0
  );
};

export const eventValueFromPayload = (
  payload: Record<string, unknown>,
): string => {
  const constellationId = payload.constellation_id;
  if (typeof constellationId === "string")
    return normalizeValue(constellationId);
  const bodyId = payload.body_id;
  if (typeof bodyId === "string") return normalizeValue(bodyId);
  const missionId = payload.mission_id;
  if (typeof missionId === "string") {
    const stepId = payload.step_id;
    return typeof stepId === "string"
      ? normalizeValue(`${missionId}:${stepId}`)
      : normalizeValue(missionId);
  }
  const achievementId = payload.achievement_id;
  if (typeof achievementId === "string") return normalizeValue(achievementId);
  const mode = payload.mode;
  if (typeof mode === "string") return normalizeValue(mode);
  const contextType = payload.context_type;
  if (typeof contextType === "string") return normalizeValue(contextType);
  const visitedCount = payload.visited_count;
  if (typeof visitedCount === "number" && Number.isFinite(visitedCount)) {
    return normalizeValue(String(Math.max(0, Math.round(visitedCount))));
  }
  const locale = payload.locale;
  if (typeof locale === "string") return normalizeValue(locale);
  const value = payload.value;
  if (typeof value === "string") return normalizeValue(value);
  return EMPTY_VALUE_LABEL;
};

export const recordAnalyticsEvent = async (
  name: AnalyticsEventName,
  value: string,
): Promise<void> => {
  writeQueue = writeQueue.then(async () => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const date = utcDay();
        const { error } = await supabase.rpc(SUPABASE_INCREMENT_RPC, {
          p_date: date,
          p_name: name,
          p_value: value,
        });
        if (!error) return;
        if (!isRpcNotDeployedError(error)) throw error;

        // Best-effort fallback for environments where RPC has not been deployed yet.
        // This path has a cross-instance TOCTOU race and should not be relied on for strict accuracy.
        const { data: existing, error: existingError } = await supabase
          .from(SUPABASE_TABLE)
          .select("count")
          .eq("date", date)
          .eq("name", name)
          .eq("value", value)
          .maybeSingle<{ count: number }>();
        if (existingError) throw existingError;

        const nextCount = (existing?.count ?? 0) + 1;
        const { error: upsertError } = await supabase
          .from(SUPABASE_TABLE)
          .upsert(
            {
              date,
              name,
              value,
              count: nextCount,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "date,name,value" },
          );
        if (upsertError) throw upsertError;
        return;
      }

      const store = await safeReadStore();
      const day = utcDay();
      const existing = store.aggregates.find(
        (entry) =>
          entry.date === day && entry.name === name && entry.value === value,
      );
      if (existing) {
        existing.count += 1;
      } else {
        store.aggregates.push({ date: day, name, value, count: 1 });
      }
      store.updatedAt = new Date().toISOString();
      await persistStore(store);
      setCacheValue(store);
    } catch (error) {
      console.error("recordAnalyticsEvent failed", error);
    }
  });
  await writeQueue;
};

type DailySummary = {
  date: string;
  total: number;
};

type EventSummary = {
  name: AnalyticsEventName;
  total: number;
  breakdown: Array<{ value: string; count: number }>;
};

type AnalyticsSummaryRow = AnalyticsAggregate & {
  updated_at?: string | null;
};

export type AnalyticsSummaryResponse = {
  updatedAt: string;
  storage: "supabase" | "local-file";
  byEvent: EventSummary[];
  byDay: DailySummary[];
};

const buildAnalyticsSummary = (
  rows: AnalyticsSummaryRow[],
): {
  updatedAtFromRows: string;
  byEvent: EventSummary[];
  byDay: DailySummary[];
} => {
  const byEventMap = new Map<AnalyticsEventName, EventSummary>();
  const byDayMap = new Map<string, number>();
  let updatedAtFromRows = new Date(0).toISOString();

  for (const row of rows) {
    byDayMap.set(row.date, (byDayMap.get(row.date) ?? 0) + row.count);

    const eventSummary = byEventMap.get(row.name) ?? {
      name: row.name,
      total: 0,
      breakdown: [],
    };
    eventSummary.total += row.count;
    eventSummary.breakdown.push({ value: row.value, count: row.count });
    byEventMap.set(row.name, eventSummary);

    if (row.updated_at && row.updated_at > updatedAtFromRows) {
      updatedAtFromRows = row.updated_at;
    }
  }

  const byEvent = [...byEventMap.values()]
    .map((event) => ({
      ...event,
      breakdown: event.breakdown.sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.total - a.total);

  const byDay = [...byDayMap.entries()]
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return { updatedAtFromRows, byEvent, byDay };
};

export const readAnalyticsSummary =
  async (): Promise<AnalyticsSummaryResponse> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select("date,name,value,count,updated_at")
        .order("date", { ascending: false })
        .limit(ANALYTICS_QUERY_LIMIT);
      if (error) throw error;

      const filteredOut = (data ?? []).filter(
        (entry) => !isAnalyticsAggregate(entry),
      );
      if (filteredOut.length > 0) {
        console.error("Filtered invalid analytics summary rows", {
          table: SUPABASE_TABLE,
          filteredCount: filteredOut.length,
          sample: filteredOut.slice(0, 3),
        });
      }
      const rows = (data ?? []).filter((entry) =>
        isAnalyticsAggregate(entry),
      ) as AnalyticsSummaryRow[];
      const { updatedAtFromRows, byEvent, byDay } = buildAnalyticsSummary(rows);
      return {
        updatedAt: updatedAtFromRows,
        storage: "supabase",
        byEvent,
        byDay,
      };
    }

    const store = await safeReadStore();
    const { byEvent, byDay } = buildAnalyticsSummary(store.aggregates);

    return {
      updatedAt: store.updatedAt,
      storage: "local-file",
      byEvent,
      byDay,
    };
  };
