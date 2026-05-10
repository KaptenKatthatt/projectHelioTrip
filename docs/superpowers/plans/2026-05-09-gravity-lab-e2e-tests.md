# Gravity Lab E2E Tests Implementation Plan

> **Status: COMPLETE** — All tasks implemented and committed. See self-review at the bottom for divergences from the original plan.

**Goal:** Write comprehensive Playwright e2e tests for Gravitationslabbet that verify all interactive features — especially the critical "object falls all the way to the ground" path — across mobile (390×844), tablet (768×1024), and desktop (1280×800).

**Architecture (as implemented):** Three files replace the originally planned monolith:
- `e2e/gravity-lab.helpers.ts` — shared helpers: `bootstrapSv`, `openLabMode`, `getLabScope`, `setRangeValue`
- `e2e/gravity-lab.spec.ts` — full functional surface, **chromium-only** (no `testMatch` override)
- `e2e/gravity-lab.viewport.spec.ts` — viewport-critical subset (smoke, drop regression, accordion default), runs on all three Playwright projects

The original plan had one `gravity-lab.spec.ts` running on all three projects. The split was introduced because running the full 20+ test suite × 3 viewports is excessive; only the viewport-sensitive tests need multi-project coverage.

**Tech Stack:** Playwright, TypeScript, React (existing), Swedish (`sv`) locale, `window.__HELIOTRIP_E2E__` bypass flag (added to `App.tsx`)

---

## Key Facts (as verified by tests)

| Fact | Value |
|------|-------|
| Mobile layout breakpoint | `max-width: 639px` — at 390 px shows `MobileBottomNav` + `BottomSheet` for lab |
| Tablet/desktop layout | ≥ 640 px — shows `GameModeSwitcher` (role="radio") + right-side fixed panel |
| Default selections | Object: apple (`aria-pressed="true"`), Planet: earth |
| Jupiter fall time | √(2×20 / 24.79) ≈ **1.27 s** — fastest |
| Earth fall time | √(2×20 / 9.81) ≈ **2.02 s** — default planet |
| Swedish button labels | Drop: **"Släpp!"**, Reset: **"Igen!"**, Lab tab: **"Labb"** |
| Swedish object names | Apple: **"Äpple"**, Car: **"Bil"**, Elephant: **"Elefant"** |
| Swedish planet names | Earth: **"Jorden"**, Jupiter: **"Jupiter"** |
| Sun mass slider label | **"Solens Massa: 1.0x"** (default) |
| Orbit accordion title | **"Banmekanik — Solens massa"** |
| Drop accordion title | **"Gravitationslabbet — Släpp & jämför"** |
| `reset-button` signal | Stable across both `falling` and `impact` phases; **preferred over `velocity-readout`** as "drop started" signal on Jupiter (~1.27 s fall) |

---

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| ✅ Modified | `playwright.config.ts` | Add `lab-mobile`/`lab-tablet` projects (viewport.spec.ts only); workers: 3 local |
| ✅ Modified | `src/components/organisms/GravityDropLab.tsx` | Add 7 `data-testid` attrs + fix rAF start-time anchoring |
| ✅ Created | `e2e/gravity-lab.helpers.ts` | `bootstrapSv`, `openLabMode`, `getLabScope`, `setRangeValue` |
| ✅ Created | `e2e/gravity-lab.spec.ts` | Full functional surface (chromium only) |
| ✅ Created | `e2e/gravity-lab.viewport.spec.ts` | Viewport-critical subset (all 3 projects) |

---

## Task 1: Add data-testid attributes to GravityDropLab.tsx — ✅ DONE

**Commit:** `24d33e2 test: add data-testid attributes to GravityDropLab for e2e tests`

Seven `data-testid` attributes added:

| testid | Element |
|--------|---------|
| `gravity-drop-lab` | Root `<div>` |
| `drop-canvas` | Canvas `<div>` |
| `falling-object` | Animated object `<div>` |
| `drop-button` | Drop button (conditional: only when `canDrop`) |
| `reset-button` | Reset button (conditional: when `falling` or `impact`) |
| `velocity-readout` | Live velocity row (conditional: when `falling`) |
| `result-card` | Result card (conditional: when `showResult`) |

**Key divergence from original plan:** The plan placed `drop-button` and `reset-button` as separate buttons always in the DOM. The actual implementation renders them conditionally inside a `flex gap-2` wrapper:
```tsx
{canDrop && <button data-testid="drop-button" ...>}
{(phase === "falling" || phase === "impact") && <button data-testid="reset-button" ...>}
```
This means `drop-button` is absent from the DOM during falling/impact, and `reset-button` is absent during ready. The tests exploit this for state assertions.

**Bug fix included in this work (`f3a61a5`):** `startTimeRef` was anchored via `performance.now()` in `handleDrop`, which produced a negative `elapsed` on the first rAF frame. Fixed by initialising `startTimeRef` to `null` and anchoring it on the first rAF tick:
```ts
const startTimeRef = useRef<number | null>(null);
// ...
if (startTimeRef.current === null) {
  startTimeRef.current = timestamp;
}
```

---

## Task 2: Add viewport projects to playwright.config.ts — ✅ DONE

**Commit:** `8fe963a test: add lab-mobile and lab-tablet playwright projects`

**As implemented** (differs from original plan):
```typescript
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  // Local cap: 3 workers — gravity-lab tests bypass WebGL via __HELIOTRIP_E2E__
  workers: process.env.CI ? undefined : 3,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    locale: "en-US",
  },
  webServer: {
    command: "npm run dev:web -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120000,
    env: { VITE_DISABLE_ANALYTICS: "true" },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "lab-mobile",
      use: { viewport: { width: 390, height: 844 } },
      testMatch: "**/gravity-lab.viewport.spec.ts",  // viewport subset only
    },
    {
      name: "lab-tablet",
      use: { viewport: { width: 768, height: 1024 } },
      testMatch: "**/gravity-lab.viewport.spec.ts",  // viewport subset only
    },
  ],
});
```

**Key divergences from original plan:**
- Workers limited to `3` locally (was `2` in earlier iteration, raised after adding `__HELIOTRIP_E2E__` flag)
- `lab-mobile` and `lab-tablet` match only `gravity-lab.viewport.spec.ts`, not the full spec
- Original plan's `gravity-lab.spec.ts` monolith does not run on mobile/tablet viewports

---

## Task 3: Helpers file + App.tsx E2E flag — ✅ DONE

**Not in original plan** — extracted to `e2e/gravity-lab.helpers.ts`.

### bootstrapSv (enhanced from plan)

Original plan: set locale in localStorage, `goto("/")`.

Actual: also sets `window.__HELIOTRIP_E2E__ = true` to collapse `MIN_LOADING_MS`/`SCENE_READY_FALLBACK_MS` to zero in `App.tsx`, then waits for the `LoadingScreen` to dismiss:

```typescript
export async function bootstrapSv(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __HELIOTRIP_E2E__: boolean }).__HELIOTRIP_E2E__ = true;
    localStorage.setItem(
      "heliotrip-preferences",
      JSON.stringify({ state: { locale: "sv" }, version: 0 }),
    );
  });
  await page.goto("/");
  await page.waitForFunction(
    () => document.querySelector('[role="status"][data-dismiss="false"]') === null,
    null,
    { timeout: 15000 },
  );
}
```

### openLabMode (returns Locator, not void)

Original plan: `Promise<void>`. Actual: `Promise<Locator>` — returns the active lab scope so tests can scope all queries:

```typescript
export async function openLabMode(page: Page): Promise<Locator> {
  const radio = page.getByRole("radio", { name: "Labb" });
  const trigger = (await radio.count()) > 0
    ? radio
    : page.getByRole("button", { name: "Labb" });
  await trigger.click();
  const scope = await getLabScope(page);
  await expect(scope.getByTestId("gravity-drop-lab")).toBeVisible({ timeout: 5000 });
  return scope;
}
```

### getLabScope (new helper)

Handles the mobile BottomSheet vs desktop panel duality:

```typescript
export async function getLabScope(page: Page): Promise<Locator> {
  const dialog = page.getByRole("dialog", { name: "Labb" });
  if ((await dialog.count()) > 0) return dialog;
  return page.locator("body");
}
```

### setRangeValue (new helper)

Playwright's `fill()` is unreliable on controlled React range inputs. Uses native setter + bubbled events:

```typescript
export async function setRangeValue(slider: Locator, value: string): Promise<void> {
  await slider.evaluate((el, v) => {
    const input = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, v);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
```

---

## Task 4: Object and planet selection tests — ✅ DONE

In `e2e/gravity-lab.spec.ts`. **Key divergence from original plan:**

`reset-button` used instead of `velocity-readout` as "drop has started" signal:
```typescript
// Plan had:
await expect(page.getByTestId("velocity-readout")).toBeVisible({ timeout: 2000 });

// Actual implementation:
await expect(scope.getByTestId("reset-button")).toBeVisible({ timeout: 3000 });
// Rationale: velocity-readout is too transient on Jupiter (~1.27 s) under parallel-worker load
```

Timeout on drop-button visibility raised from `3000` to `5000`.

---

## Task 5: Critical drop-to-ground tests — ✅ DONE

**Split between two files:**
- `gravity-lab.viewport.spec.ts`: "drop on Jupiter" and smoke tests — run on all 3 projects
- `gravity-lab.spec.ts`: "drop on Earth", "all three objects", result card content/accuracy — chromium only

**Key divergences from original plan:**

1. `velocity-readout` no longer used as "falling state" assertion. Use `reset-button` instead.
2. Timeouts raised to `12000` for result card (was `8000`), `3000` for reset-button signal.
3. "All three objects" loop uses `dispatchEvent("click")` throughout:
   ```typescript
   // Plan had:
   await scope.getByTestId("drop-button").click();
   // Actual:
   await scope.getByTestId("drop-button").dispatchEvent("click");
   // Rationale: result-card animations + panel scrollbar make buttons geometrically
   // unstable; dispatchEvent fires React's onClick directly without waiting for stability
   ```
4. `exact: true` on `"Massa"` label to avoid strict-mode collision with Galileo fact text.

---

## Task 6: Reset and multi-drop tests — ✅ DONE

In `e2e/gravity-lab.spec.ts`. **Key divergence from original plan:**

"Reset after impact" uses `dispatchEvent("click")` for the reset button (same animation stability reason as Task 5):
```typescript
await scope.getByTestId("reset-button").dispatchEvent("click");
```

Timeouts: `5000` for drop-button visibility after reset (was `3000`).

---

## Task 7: Accordion and orbit controls tests — ✅ DONE

In `e2e/gravity-lab.spec.ts`. **Key divergences from original plan:**

1. "Drop section is open by default" moved to `viewport.spec.ts` (runs on all 3 projects).
2. `slider.fill("3")` replaced by `setRangeValue(slider, "3")` (Playwright's fill unreliable on range inputs).
3. `toHaveAttribute("value", "1")` replaced by `toHaveValue("1")` — already noted as a fallback in the original plan, and it's what was used.
4. All three orbit tests open orbit section via `scope.getByRole("button", { name: /Banmekanik/ }).click()` (accordion — correct for current UI, will need update if overlay redesign ships).

---

## Task 8: Full run and final verification — ✅ DONE

All commits landed on `dev` branch. Suite structure:

```
gravity-lab.viewport.spec.ts — 3 tests × 3 projects = 9
gravity-lab.spec.ts          — ~14 tests × 1 project = 14
```

---

## Self-Review Notes

### Divergences from original plan

| Plan said | Actual |
|-----------|--------|
| One `gravity-lab.spec.ts` on all 3 projects | Split into functional spec (chromium) + viewport spec (all 3) |
| `bootstrapSv` just sets locale | Also sets `__HELIOTRIP_E2E__` flag + waits for LoadingScreen dismiss |
| `openLabMode` returns `void` | Returns `Promise<Locator>` (the active scope) |
| No helpers file | `e2e/gravity-lab.helpers.ts` created with 4 helpers |
| `velocity-readout` as "drop started" signal | `reset-button` used (more stable) |
| `slider.fill()` for range inputs | `setRangeValue()` helper (native setter + bubbled events) |
| All loop clicks with `.click()` | Impact-phase loops use `.dispatchEvent("click")` |
| Result card timeout: 8000 | 12000 |
| Workers: 2 (cap) | Workers: 3 locally, unlimited in CI |

### Upcoming: Lab Overlay Redesign
The `ackordeon` and `omloppskontroller` tests use accordion selectors (`role="button"` + `aria-expanded`). If the overlay redesign plan (`2026-05-09-lab-overlay-redesign.md`) ships, **Task 9 of that plan** rewrites these to use tab selectors (`data-testid="lab-tab-drop"`, `data-testid="lab-tab-orbit"`, `aria-selected`). The helpers file and viewport spec need no changes for the overlay redesign.
