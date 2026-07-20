import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

type NeonClient = ReturnType<typeof neon>;

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
  | "share_link_restored"
  | "time_spent_on_planet"
  | "photo_taken"
  | "scrapbook_opened"
  | "device_type"
  | "time_of_day"
  | "learn_now_clicked";

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
let dbClient: NeonClient | null = null;

// Neon (or any Postgres) connection string. `POSTGRES_URL` is accepted as an
// alias because the Vercel Postgres/Neon integration provisions that variable.
const DATABASE_URL = (
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  ""
).trim();
// Only bare identifiers are allowed; the table name is interpolated into SQL
// (it cannot be a bound parameter), so an unexpected value must never reach it.
const DEFAULT_ANALYTICS_TABLE = "analytics_events_daily";
const ANALYTICS_TABLE = (() => {
  const raw = (
    process.env.ANALYTICS_DB_TABLE ??
    process.env.ANALYTICS_SUPABASE_TABLE ??
    ""
  ).trim();
  if (raw.length === 0) return DEFAULT_ANALYTICS_TABLE;
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(raw)) {
    console.error(
      "Ignoring invalid analytics table name; falling back to default",
      { provided: raw, fallback: DEFAULT_ANALYTICS_TABLE },
    );
    return DEFAULT_ANALYTICS_TABLE;
  }
  return raw;
})();
const HAS_DB = DATABASE_URL.length > 0;
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

const getDbClient = (): NeonClient | null => {
  if (!HAS_DB) return null;
  if (dbClient) return dbClient;
  // Neon's HTTP driver issues one stateless fetch per query, which fits the
  // serverless model (no long-lived connection to keep warm or leak).
  dbClient = neon(DATABASE_URL);
  return dbClient;
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
  "time_spent_on_planet",
  "photo_taken",
  "scrapbook_opened",
  "device_type",
  "time_of_day",
  "learn_now_clicked",
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
      const sql = getDbClient();
      if (sql) {
        const date = utcDay();
        // Atomic upsert: the increment happens inside a single statement, so it
        // is correct across concurrent serverless instances without any RPC.
        await sql.query(
          `insert into ${ANALYTICS_TABLE} (date, name, value, count, updated_at)
           values ($1, $2, $3, 1, now())
           on conflict (date, name, value)
           do update set
             count = ${ANALYTICS_TABLE}.count + 1,
             updated_at = now()`,
          [date, name, value],
        );
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

type AnalyticsSummaryResponse = {
  updatedAt: string;
  storage: "neon" | "local-file";
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
    const sql = getDbClient();
    if (sql) {
      try {
        // `to_char(date, ...)` guarantees a string key regardless of the
        // driver's date parsing, matching the local-file aggregate shape.
        // The 8-second AbortSignal keeps a slow database from exhausting
        // Vercel's serverless budget — GET /api/analytics/summary must never 500.
        const rawRows = (await sql.query(
          `select to_char(date, 'YYYY-MM-DD') as date, name, value, count, updated_at
           from ${ANALYTICS_TABLE}
           order by date desc
           limit $1`,
          [ANALYTICS_QUERY_LIMIT],
          { fetchOptions: { signal: AbortSignal.timeout(8_000) } },
        )) as Array<Record<string, unknown>>;

        const normalized: AnalyticsSummaryRow[] = [];
        let filteredCount = 0;
        for (const raw of rawRows) {
          const candidate = {
            date: raw.date,
            name: raw.name,
            value: raw.value,
            count:
              typeof raw.count === "number" ? raw.count : Number(raw.count),
            updated_at:
              raw.updated_at == null
                ? null
                : new Date(raw.updated_at as string | Date).toISOString(),
          };
          if (isAnalyticsAggregate(candidate)) {
            normalized.push(candidate as AnalyticsSummaryRow);
          } else {
            filteredCount += 1;
          }
        }
        if (filteredCount > 0) {
          console.error("Filtered invalid analytics summary rows", {
            table: ANALYTICS_TABLE,
            filteredCount,
          });
        }
        const { updatedAtFromRows, byEvent, byDay } =
          buildAnalyticsSummary(normalized);
        return {
          updatedAt: updatedAtFromRows,
          storage: "neon",
          byEvent,
          byDay,
        };
      } catch (err) {
        console.error("Analytics database query failed — returning empty summary", {
          table: ANALYTICS_TABLE,
          error: err,
        });
        return {
          updatedAt: new Date(0).toISOString(),
          storage: "neon",
          byEvent: [],
          byDay: [],
        };
      }
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
