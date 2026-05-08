# Analytics Robustness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate recurring 500 errors on the analytics admin page and prevent agents from silently breaking analytics data collection.

**Architecture:** Three independent fixes. (1) Sync the 6 frontend event names missing from the backend so no events are silently discarded. (2) Make the Supabase query on the summary endpoint timeout-bounded and error-tolerant so a database hiccup shows empty charts instead of a 500. (3) Add a compile-time sync test + agent rule so future agents cannot add frontend events without updating the backend.

**Tech Stack:** TypeScript, Vitest, Supabase JS v2 (`@supabase/supabase-js`), Hono (API server), Node.js 18+

---

## Root Cause Analysis (read before implementing)

The screenshot shows `GET /api/analytics/summary` returning HTTP 500. Here is the exact failure chain:

```
readAnalyticsSummary() [analyticsStore.ts:357]
  supabase.from(...).select(...)  ← Supabase errors (paused project, bad env var, timeout)
  if (error) throw error;         ← THROWS — no fallback
→ route handler catch block       ← returns c.json({ error: 'internal' }, 500)
→ frontend shows "Server error"
```

**Cause 1 — Supabase intermittent errors (primary 500 cause)**
- Supabase free-tier projects pause after 7 days of inactivity; the first query after wakeup times out or errors.
- No query timeout: a slow Supabase response can exhaust Vercel's 10 s serverless limit, returning a 504/500.
- Any Supabase error (bad creds, RLS, network) immediately propagates to the user as a 500. There is no graceful fallback.

**Cause 2 — Frontend/backend event name drift (silent data loss)**
`src/lib/analytics.ts` has 6 event names that `api/_lib/analyticsStore.ts` does not know about:
- `time_spent_on_planet`, `photo_taken`, `scrapbook_opened`, `device_type`, `time_of_day`, `learn_now_clicked`

When the frontend fires these events the backend returns `{ error: 'invalid_event_name' }` (400) and silently discards them. No data is ever recorded. This breakage was introduced when agents extended `analytics.ts` without updating `analyticsStore.ts`.

**Cause 3 — No guard against future drift**
There is no test or rule that verifies both files contain the same event names. Any agent can extend one file without the other and the test suite stays green.

---

## Files Touched

| File | Action | Why |
|------|--------|-----|
| `api/_lib/analyticsStore.ts` | Modify | Add 6 missing event names; add `AbortSignal.timeout` + error fallback to `readAnalyticsSummary` |
| `api/_lib/analyticsSyncCheck.test.ts` | Create | New test: asserts all frontend event names are accepted by the backend |
| `context/AGENT_REFERENCE.md` | Modify | Add Section 9: Analytics guardrails — agent rule for keeping lists in sync |

---

## Task 1: Sync the 6 missing event names into the backend

**Files:**
- Modify: `api/_lib/analyticsStore.ts`

### What to change

`AnalyticsEventName` (the TypeScript type, lines 5–21) and `VALID_EVENT_NAMES` (the runtime Set, lines 150–167) must both gain the 6 missing names. These are the only two places to edit in this task.

- [ ] **Step 1: Add the missing names to the `AnalyticsEventName` type**

In `api/_lib/analyticsStore.ts`, find `AnalyticsEventName` (line ~5) and extend it:

```typescript
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
```

- [ ] **Step 2: Add the same names to `VALID_EVENT_NAMES`**

Find `VALID_EVENT_NAMES` (line ~150) and extend the Set:

```typescript
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
```

- [ ] **Step 3: Verify TypeScript and lint pass**

```bash
npx tsc --noEmit
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Run existing tests to confirm nothing broke**

```bash
npx vitest run api/_lib/analyticsStore.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/analyticsStore.ts
git commit -m "fix: add 6 missing analytics event names to backend store"
```

---

## Task 2: Add Supabase timeout and graceful error fallback

**Files:**
- Modify: `api/_lib/analyticsStore.ts` (only the `readAnalyticsSummary` function, ~line 348)

### What to change

Replace the hard `throw error` with a catch that logs the error and returns an empty-but-valid summary. Add an 8-second timeout via `AbortSignal.timeout` so a sleeping Supabase instance fails fast instead of hanging until Vercel kills the function.

- [ ] **Step 1: Replace `readAnalyticsSummary` Supabase branch**

Find `readAnalyticsSummary` (line ~348). Replace only the `if (supabase)` branch inside it with:

```typescript
export const readAnalyticsSummary =
  async (): Promise<AnalyticsSummaryResponse> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLE)
          .select("date,name,value,count,updated_at")
          .order("date", { ascending: false })
          .limit(ANALYTICS_QUERY_LIMIT)
          .abortSignal(AbortSignal.timeout(8_000));
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
        const { updatedAtFromRows, byEvent, byDay } =
          buildAnalyticsSummary(rows);
        return {
          updatedAt: updatedAtFromRows,
          storage: "supabase",
          byEvent,
          byDay,
        };
      } catch (err) {
        console.error(
          "Analytics Supabase query failed — returning empty summary",
          err,
        );
        return {
          updatedAt: new Date(0).toISOString(),
          storage: "supabase",
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
```

- [ ] **Step 2: Run TypeScript and lint**

```bash
npx tsc --noEmit
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Run all analytics tests**

```bash
npx vitest run api/_lib/
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add api/_lib/analyticsStore.ts
git commit -m "fix: add Supabase timeout and graceful error fallback to analytics summary"
```

---

## Task 3: Add sync validation test

**Files:**
- Create: `api/_lib/analyticsSyncCheck.test.ts`

### Purpose

This test reads `src/lib/analytics.ts` as text, extracts every string literal in the `AnonymousEventName` union type, and asserts that every one of them is accepted by the backend's `isAnalyticsEventName`. If an agent adds a frontend event without adding it to `analyticsStore.ts`, this test fails with a clear message.

- [ ] **Step 1: Verify the test would fail before Task 1 was applied**

You can skip this step if Task 1 is already committed — in that case the test should pass immediately.

To simulate the failure: temporarily comment out `"time_spent_on_planet"` from `VALID_EVENT_NAMES` in `analyticsStore.ts`, run the test (Step 3 below), and verify it fails with the right message. Then revert.

- [ ] **Step 2: Create the test file**

Create `api/_lib/analyticsSyncCheck.test.ts`:

```typescript
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const extractFrontendEventNames = (): string[] => {
  const src = readFileSync(
    path.resolve(__dirname, "../../src/lib/analytics.ts"),
    "utf8",
  );
  const match = src.match(/type AnonymousEventName\s*=\s*([\s\S]+?);/);
  if (!match)
    throw new Error(
      "Could not find AnonymousEventName type in src/lib/analytics.ts",
    );
  const names: string[] = [];
  const re = /"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(match[1])) !== null) {
    names.push(m[1]);
  }
  return names;
};

describe("analytics event name sync", () => {
  it("all frontend AnonymousEventName values are registered in the backend", async () => {
    const { isAnalyticsEventName } = await import("./analyticsStore.js");
    const frontendNames = extractFrontendEventNames();

    expect(frontendNames.length).toBeGreaterThan(0);

    const missing = frontendNames.filter((name) => !isAnalyticsEventName(name));
    expect(
      missing,
      `Frontend events not registered in api/_lib/analyticsStore.ts VALID_EVENT_NAMES: [${missing.join(", ")}]. ` +
        `Add them to both AnalyticsEventName and VALID_EVENT_NAMES.`,
    ).toEqual([]);
  });
});
```

- [ ] **Step 3: Run the test to confirm it passes**

```bash
npx vitest run api/_lib/analyticsSyncCheck.test.ts
```

Expected output (all passing):
```
✓ api/_lib/analyticsSyncCheck.test.ts > analytics event name sync > all frontend AnonymousEventName values are registered in the backend
```

- [ ] **Step 4: Commit**

```bash
git add api/_lib/analyticsSyncCheck.test.ts
git commit -m "test: add sync validation to catch frontend/backend analytics event name drift"
```

---

## Task 4: Add agent guardrail to AGENT_REFERENCE.md

**Files:**
- Modify: `context/AGENT_REFERENCE.md`

### Purpose

Without an explicit rule, agents will keep extending `src/lib/analytics.ts` without updating the backend. This section makes the rule discoverable at the top of the agent context read order.

- [ ] **Step 1: Append Section 9 to `context/AGENT_REFERENCE.md`**

Add this section at the end of the file (before the closing `---` line if one exists, otherwise just append):

```markdown
## 9) Analytics guardrails for agents

### Architecture

Analytics has two layers that must stay in sync:

| Layer | File | Role |
|-------|------|------|
| Frontend client | `src/lib/analytics.ts` | Defines `AnonymousEventName` type + sends events |
| Backend validator | `api/_lib/analyticsStore.ts` | Defines `AnalyticsEventName` type + `VALID_EVENT_NAMES` Set |

Both files contain independent copies of the event name list. They **must always contain identical sets of names**. If they diverge, the backend silently discards events with a 400 error and no data is recorded.

### Rule: always update both files together

When adding a new analytics event:
1. Add the event name to `AnonymousEventName` in `src/lib/analytics.ts`
2. Add the same event name to `AnalyticsEventName` **and** `VALID_EVENT_NAMES` in `api/_lib/analyticsStore.ts`
3. Run the sync test to confirm: `npx vitest run api/_lib/analyticsSyncCheck.test.ts`

**Never add to one file without updating the other.**

### Sync test

`api/_lib/analyticsSyncCheck.test.ts` automatically catches drift. If this test is failing, it means `VALID_EVENT_NAMES` in `analyticsStore.ts` is missing one or more event names that the frontend sends. The test error message tells you exactly which names are missing.

### Analytics summary endpoint resilience

`GET /api/analytics/summary` must not return HTTP 500. The implementation wraps the Supabase query with an 8-second timeout and catches all errors, returning an empty-but-valid summary on failure. Do not remove this error boundary or the `AbortSignal.timeout` call.
```

- [ ] **Step 2: Update the `Last updated` date at the bottom of the file**

Change:
```
Last updated: 2026-04-24
```
To:
```
Last updated: 2026-05-08
```

- [ ] **Step 3: Run TypeScript and lint to confirm no regressions**

```bash
npx tsc --noEmit
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add context/AGENT_REFERENCE.md
git commit -m "docs: add analytics guardrails section to agent reference"
```

---

## Verification checklist after all tasks

Run the full test suite to confirm nothing is broken:

```bash
npx vitest run
```

Expected: all tests pass, including the new sync check test.

Manually verify the production fix by deploying and visiting `/admin/analytics`. The page should load charts (or show empty charts with `updatedAt: 1970-01-01`) instead of "Server error while loading analytics."

---

## Self-Review

**Spec coverage:**
- ✅ Root cause 1 (Supabase errors → 500) → Task 2
- ✅ Root cause 2 (6 missing event names → silent data loss) → Task 1
- ✅ Root cause 3 (no CI guard against drift) → Task 3
- ✅ Agent rule to prevent recurrence → Task 4

**Placeholder scan:** No TBDs, no "add appropriate error handling", all steps contain actual code.

**Type consistency:** `AnalyticsSummaryResponse` type in `analyticsStore.ts` uses `storage: "supabase" | "local-file"`. The error fallback in Task 2 returns `storage: "supabase"` — this is intentional (Supabase was configured, it just failed). The frontend `isAnalyticsSummary` check already accepts both values.
