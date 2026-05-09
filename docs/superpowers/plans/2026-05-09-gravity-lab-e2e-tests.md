# Gravity Lab E2E Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write comprehensive Playwright e2e tests for Gravitationslabbet that verify all interactive features — especially the critical "object falls all the way to the ground" path — across mobile (390×844), tablet (768×1024), and desktop (1280×800).

**Architecture:** One test file `e2e/gravity-lab.spec.ts` running against three Playwright projects (`chromium` desktop + two new viewport-scoped projects). Seven `data-testid` attributes added to `GravityDropLab.tsx` as stable test handles. Tests are parameterised by viewport inside the file; all three viewport sizes run the same test suites.

**Tech Stack:** Playwright, TypeScript, React (existing), Swedish (`sv`) locale (matches existing e2e pattern)

---

## Key Facts (read before writing any test code)

| Fact | Value |
|------|-------|
| Mobile layout breakpoint | `max-width: 639px` — at 390 px the app shows `MobileBottomNav` + `BottomSheet` for lab |
| Tablet/desktop layout | ≥ 640 px — shows `GameModeSwitcher` (role="radio") + right-side fixed panel |
| Default selections | Object: apple (`aria-pressed="true"`), Planet: earth |
| Jupiter fall time | √(2×20 / 24.79) ≈ **1.27 s** — fastest, use for most tests |
| Earth fall time | √(2×20 / 9.81) ≈ **2.02 s** — default planet |
| Swedish button labels | Drop: **"Släpp!"**, Reset: **"Igen!"**, Lab tab: **"Labb"** |
| Swedish object names | Apple: **"Äpple"**, Car: **"Bil"**, Elephant: **"Elefant"** |
| Swedish planet names | Earth: **"Jorden"**, Jupiter: **"Jupiter"** |
| Sun mass slider label | **"Solens Massa: 1.0x"** (default), id=`sun-mass` |
| Orbit accordion title | **"Banmekanik — Solens massa"** |
| Drop accordion title | **"Gravitationslabbet — Släpp & jämför"** |

---

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Modify | `playwright.config.ts` | Add `lab-mobile` and `lab-tablet` projects |
| Modify | `src/components/organisms/GravityDropLab.tsx` | Add 7 `data-testid` attributes |
| Create | `e2e/gravity-lab.spec.ts` | All e2e tests |

---

## Task 1: Add data-testid attributes to GravityDropLab.tsx

**Files:**
- Modify: `src/components/organisms/GravityDropLab.tsx:151,224,253,291,299,311,319`

These are the seven stable test handles. They target the component root, the canvas, the animated object, both action buttons, the live readout, and the result card.

- [ ] **Step 1.1: Add `data-testid="gravity-drop-lab"` to root div (line 151)**

Old:
```tsx
  return (
    <div className="flex flex-col gap-4">
```
New:
```tsx
  return (
    <div data-testid="gravity-drop-lab" className="flex flex-col gap-4">
```

- [ ] **Step 1.2: Add `data-testid="drop-canvas"` to the canvas div (line 224)**

Old:
```tsx
      <div
        className={styles.dropCanvas}
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 70%, ${planet.color}30 85%, ${planet.color}50 100%)`,
        }}
      >
```
New:
```tsx
      <div
        data-testid="drop-canvas"
        className={styles.dropCanvas}
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 70%, ${planet.color}30 85%, ${planet.color}50 100%)`,
        }}
      >
```

- [ ] **Step 1.3: Add `data-testid="falling-object"` to the animated object div (line 253)**

Old:
```tsx
        <div
          className={`${styles.fallingObject} ${impactClass}`}
          style={{
            top: `${topPercent}%`,
            transform: `translateX(-50%) rotate(${phase === "falling" ? frame.progress * 360 : 0}deg)`,
          }}
        >
```
New:
```tsx
        <div
          data-testid="falling-object"
          className={`${styles.fallingObject} ${impactClass}`}
          style={{
            top: `${topPercent}%`,
            transform: `translateX(-50%) rotate(${phase === "falling" ? frame.progress * 360 : 0}deg)`,
          }}
        >
```

- [ ] **Step 1.4: Add `data-testid="drop-button"` to the drop button (line 291)**

Old:
```tsx
          <button
            type="button"
            onClick={handleDrop}
            className={`pointer-events-auto flex-1 rounded-xl border border-indigo-400/30 bg-indigo-400/10 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-indigo-300 transition hover:bg-indigo-400/20 active:scale-95 ${styles.dropButtonReady}`}
          >
```
New:
```tsx
          <button
            data-testid="drop-button"
            type="button"
            onClick={handleDrop}
            className={`pointer-events-auto flex-1 rounded-xl border border-indigo-400/30 bg-indigo-400/10 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-indigo-300 transition hover:bg-indigo-400/20 active:scale-95 ${styles.dropButtonReady}`}
          >
```

- [ ] **Step 1.5: Add `data-testid="reset-button"` to the reset button (line 299)**

Old:
```tsx
          <button
            type="button"
            onClick={handleReset}
            className="pointer-events-auto flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 active:scale-95"
          >
```
New:
```tsx
          <button
            data-testid="reset-button"
            type="button"
            onClick={handleReset}
            className="pointer-events-auto flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 active:scale-95"
          >
```

- [ ] **Step 1.6: Add `data-testid="velocity-readout"` to the live fall readout (line 311)**

Old:
```tsx
      {phase === "falling" && (
        <div className="flex justify-between text-[11px] font-mono text-white/40">
```
New:
```tsx
      {phase === "falling" && (
        <div data-testid="velocity-readout" className="flex justify-between text-[11px] font-mono text-white/40">
```

- [ ] **Step 1.7: Add `data-testid="result-card"` to the result card (line 319)**

Old:
```tsx
      {showResult && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
```
New:
```tsx
      {showResult && (
        <div data-testid="result-card" className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
```

- [ ] **Step 1.8: Build the app and verify it compiles**

```bash
npm run build
```
Expected: exit 0, no TypeScript errors.

- [ ] **Step 1.9: Commit**

```bash
git add src/components/organisms/GravityDropLab.tsx
git commit -m "test: add data-testid attributes to GravityDropLab for e2e tests"
```

---

## Task 2: Add viewport projects to playwright.config.ts

**Files:**
- Modify: `playwright.config.ts`

The existing `chromium` project is left unchanged (it runs all tests including `gravity-lab.spec.ts` as the desktop viewport). Two new projects are added that only match the new test file.

- [ ] **Step 2.1: Add mobile and tablet projects**

Open `playwright.config.ts`. The `projects` array currently has one entry. Add two entries:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
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
    env: {
      VITE_DISABLE_ANALYTICS: "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "lab-mobile",
      use: { viewport: { width: 390, height: 844 } },
      testMatch: "**/gravity-lab.spec.ts",
    },
    {
      name: "lab-tablet",
      use: { viewport: { width: 768, height: 1024 } },
      testMatch: "**/gravity-lab.spec.ts",
    },
  ],
});
```

- [ ] **Step 2.2: Verify existing tests still pass on chromium**

```bash
npx playwright test --project=chromium e2e/mobile-discoverability.spec.ts
```
Expected: all tests pass.

- [ ] **Step 2.3: Commit**

```bash
git add playwright.config.ts
git commit -m "test: add lab-mobile and lab-tablet playwright projects"
```

---

## Task 3: Create test file — helpers and smoke test

**Files:**
- Create: `e2e/gravity-lab.spec.ts`

- [ ] **Step 3.1: Create the file with helpers and first smoke test**

```typescript
import { expect, test, type Page } from "@playwright/test";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Injects Swedish locale and navigates to the app root. */
async function bootstrapSv(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      "heliotrip-preferences",
      JSON.stringify({ state: { locale: "sv" }, version: 0 }),
    );
  });
  await page.goto("/");
}

/**
 * Enters Lab mode and waits until GravityDropLab is visible.
 *
 * Desktop/tablet (≥640px): GameModeSwitcher renders a role="radio" button
 * labelled "Labb". Mobile (<640px): MobileBottomNav renders a role="button"
 * labelled "Labb" that opens a BottomSheet.
 */
async function openLabMode(page: Page): Promise<void> {
  const radio = page.getByRole("radio", { name: "Labb" });
  const trigger =
    (await radio.count()) > 0
      ? radio
      : page.getByRole("button", { name: "Labb" });
  await trigger.click();
  await expect(page.getByTestId("gravity-drop-lab")).toBeVisible({
    timeout: 5000,
  });
}

// ── Smoke ─────────────────────────────────────────────────────────────────────

test.describe("Gravitationslabbet – smoke", () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapSv(page);
    await openLabMode(page);
  });

  test("renders title and default selections", async ({ page }) => {
    const lab = page.getByTestId("gravity-drop-lab");
    await expect(lab.getByText("Gravitationslabbet")).toBeVisible();
    await expect(lab.getByRole("button", { name: /Äpple/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(lab.getByRole("button", { name: /Bil/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(lab.getByRole("button", { name: /Elefant/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(lab.getByRole("button", { name: /Jorden/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByTestId("drop-button")).toBeVisible();
  });
});
```

- [ ] **Step 3.2: Run the smoke test across all three projects to verify the scaffolding works**

```bash
npx playwright test e2e/gravity-lab.spec.ts --headed
```
Expected: 3 tests pass (one per project: chromium, lab-mobile, lab-tablet).

If the test fails on mobile because `getByRole("button", { name: "Labb" })` is ambiguous, inspect the DOM with `--headed --debug` and narrow the locator as needed. The `MobileBottomNav` renders the button with visible text "Labb" and no extra role attribute.

- [ ] **Step 3.3: Commit**

```bash
git add e2e/gravity-lab.spec.ts
git commit -m "test: add gravity lab e2e scaffold with smoke test"
```

---

## Task 4: Object and planet selection tests

**Files:**
- Modify: `e2e/gravity-lab.spec.ts`

- [ ] **Step 4.1: Add object-selection describe block after the smoke block**

```typescript
test.describe("Gravitationslabbet – objektval", () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapSv(page);
    await openLabMode(page);
  });

  test("can cycle through all three objects", async ({ page }) => {
    const lab = page.getByTestId("gravity-drop-lab");

    await lab.getByRole("button", { name: /Bil/ }).click();
    await expect(lab.getByRole("button", { name: /Bil/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(lab.getByRole("button", { name: /Äpple/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await lab.getByRole("button", { name: /Elefant/ }).click();
    await expect(lab.getByRole("button", { name: /Elefant/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(lab.getByRole("button", { name: /Bil/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await lab.getByRole("button", { name: /Äpple/ }).click();
    await expect(lab.getByRole("button", { name: /Äpple/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("changing object mid-fall resets to ready", async ({ page }) => {
    const lab = page.getByTestId("gravity-drop-lab");
    await lab.getByRole("button", { name: /Jupiter/ }).click();
    await page.getByTestId("drop-button").click();
    await expect(page.getByTestId("velocity-readout")).toBeVisible({
      timeout: 2000,
    });

    // Change object while falling
    await lab.getByRole("button", { name: /Bil/ }).click();

    // Must reset to ready: drop button back, readout and result card gone
    await expect(page.getByTestId("drop-button")).toBeVisible({
      timeout: 3000,
    });
    await expect(page.getByTestId("velocity-readout")).toHaveCount(0);
    await expect(page.getByTestId("result-card")).toHaveCount(0);
  });
});
```

- [ ] **Step 4.2: Add planet-selection describe block**

```typescript
test.describe("Gravitationslabbet – planetval", () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapSv(page);
    await openLabMode(page);
  });

  test("can select Jupiter and gravity overlay updates", async ({ page }) => {
    const lab = page.getByTestId("gravity-drop-lab");

    await lab.getByRole("button", { name: /Jupiter/ }).click();
    await expect(lab.getByRole("button", { name: /Jupiter/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(lab.getByRole("button", { name: /Jorden/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    // g = 24.8 m/s² overlay (locale may use comma or period)
    await expect(lab.getByText(/24[.,]\d/)).toBeVisible();
  });

  test("changing planet mid-fall resets to ready", async ({ page }) => {
    const lab = page.getByTestId("gravity-drop-lab");
    await page.getByTestId("drop-button").click();
    await expect(page.getByTestId("velocity-readout")).toBeVisible({
      timeout: 2000,
    });

    await lab.getByRole("button", { name: /Jupiter/ }).click();

    await expect(page.getByTestId("drop-button")).toBeVisible({
      timeout: 3000,
    });
    await expect(page.getByTestId("velocity-readout")).toHaveCount(0);
    await expect(page.getByTestId("result-card")).toHaveCount(0);
  });
});
```

- [ ] **Step 4.3: Run selection tests**

```bash
npx playwright test e2e/gravity-lab.spec.ts -g "objektval|planetval"
```
Expected: 6 tests × 3 projects = 18 pass.

- [ ] **Step 4.4: Commit**

```bash
git add e2e/gravity-lab.spec.ts
git commit -m "test: add object and planet selection tests for gravity lab"
```

---

## Task 5: The critical drop-to-ground tests

**Files:**
- Modify: `e2e/gravity-lab.spec.ts`

This is the regression suite for the main reported bug. Each test verifies that `phase` transitions all the way from `"ready"` → `"falling"` → `"impact"` and that the result card renders.

- [ ] **Step 5.1: Add the drop describe block**

```typescript
test.describe("Gravitationslabbet – fall mot marken (kritisk)", () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapSv(page);
    await openLabMode(page);
  });

  test("drop on Jupiter completes and result card appears", async ({
    page,
  }) => {
    const lab = page.getByTestId("gravity-drop-lab");
    await lab.getByRole("button", { name: /Jupiter/ }).click();

    // Ready state: only drop button visible
    await expect(page.getByTestId("drop-button")).toBeVisible();
    await expect(page.getByTestId("reset-button")).toHaveCount(0);

    await page.getByTestId("drop-button").click();

    // Falling state: velocity readout must appear within 2 s
    await expect(page.getByTestId("velocity-readout")).toBeVisible({
      timeout: 2000,
    });
    // Drop button gone, reset button appears
    await expect(page.getByTestId("drop-button")).toHaveCount(0);
    await expect(page.getByTestId("reset-button")).toBeVisible();

    // Impact state: result card must appear (Jupiter lands in ~1.3 s; 8 s safety margin)
    await expect(page.getByTestId("result-card")).toBeVisible({
      timeout: 8000,
    });
    // Velocity readout is replaced by result card
    await expect(page.getByTestId("velocity-readout")).toHaveCount(0);
  });

  test("drop on Earth (default planet) completes and result card appears", async ({
    page,
  }) => {
    // Earth is the default selection — no planet click needed
    await page.getByTestId("drop-button").click();

    await expect(page.getByTestId("velocity-readout")).toBeVisible({
      timeout: 2000,
    });
    // Earth lands in ~2.0 s; use 10 s timeout
    await expect(page.getByTestId("result-card")).toBeVisible({
      timeout: 10000,
    });
  });

  test("all three objects complete the drop on Jupiter", async ({ page }) => {
    const lab = page.getByTestId("gravity-drop-lab");
    await lab.getByRole("button", { name: /Jupiter/ }).click();

    for (const name of [/Äpple/, /Bil/, /Elefant/]) {
      await lab.getByRole("button", { name }).click();
      await page.getByTestId("drop-button").click();
      await expect(page.getByTestId("result-card")).toBeVisible({
        timeout: 8000,
      });
      await page.getByTestId("reset-button").click();
      await expect(page.getByTestId("drop-button")).toBeVisible({
        timeout: 3000,
      });
    }
  });

  test("result card shows all four stat labels and Galileo fact", async ({
    page,
  }) => {
    const lab = page.getByTestId("gravity-drop-lab");
    await lab.getByRole("button", { name: /Jupiter/ }).click();
    await page.getByTestId("drop-button").click();
    await expect(page.getByTestId("result-card")).toBeVisible({
      timeout: 8000,
    });

    const card = page.getByTestId("result-card");
    await expect(card.getByText("Falltid")).toBeVisible();
    await expect(card.getByText("Hastighet vid nedslag")).toBeVisible();
    await expect(card.getByText("Gravitationsstyrka")).toBeVisible();
    await expect(card.getByText("Massa")).toBeVisible();
    await expect(card.getByText(/Galileo/)).toBeVisible();
  });

  test("result card shows numerically correct fall time for Jupiter", async ({
    page,
  }) => {
    const lab = page.getByTestId("gravity-drop-lab");
    await lab.getByRole("button", { name: /Jupiter/ }).click();
    await page.getByTestId("drop-button").click();
    await expect(page.getByTestId("result-card")).toBeVisible({
      timeout: 8000,
    });
    // Jupiter fall time ≈ 1.3 s (locale may produce "1.3" or "1,3")
    const card = page.getByTestId("result-card");
    await expect(card.getByText(/1[.,][23]/)).toBeVisible();
  });
});
```

- [ ] **Step 5.2: Run only the critical drop tests**

```bash
npx playwright test e2e/gravity-lab.spec.ts -g "fall mot marken"
```
Expected: 5 tests × 3 projects = 15 pass.

If **any test fails** with the result card never appearing, this confirms the reported bug. Check:
1. Open with `--headed --debug`
2. After clicking "Släpp!", watch the console for `requestAnimationFrame` errors
3. Check if `phase === "falling"` sets correctly but `hasLanded` never fires
4. Common root cause: `startTimeRef.current` is set before `requestAnimationFrame` fires, so `elapsed` is always slightly wrong → check `computeDropFrame` with `elapsed > fallDuration` path

- [ ] **Step 5.3: Commit**

```bash
git add e2e/gravity-lab.spec.ts
git commit -m "test: add critical drop-to-ground regression tests for gravity lab"
```

---

## Task 6: Reset and multi-drop tests

**Files:**
- Modify: `e2e/gravity-lab.spec.ts`

- [ ] **Step 6.1: Add reset describe block**

```typescript
test.describe("Gravitationslabbet – återställning", () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapSv(page);
    await openLabMode(page);
  });

  test("reset mid-fall returns to ready state", async ({ page }) => {
    const lab = page.getByTestId("gravity-drop-lab");
    await lab.getByRole("button", { name: /Jupiter/ }).click();
    await page.getByTestId("drop-button").click();
    await expect(page.getByTestId("velocity-readout")).toBeVisible({
      timeout: 2000,
    });

    await page.getByTestId("reset-button").click();

    await expect(page.getByTestId("drop-button")).toBeVisible({
      timeout: 3000,
    });
    await expect(page.getByTestId("velocity-readout")).toHaveCount(0);
    await expect(page.getByTestId("result-card")).toHaveCount(0);
  });

  test("reset after impact allows a second drop", async ({ page }) => {
    const lab = page.getByTestId("gravity-drop-lab");
    await lab.getByRole("button", { name: /Jupiter/ }).click();

    // First drop
    await page.getByTestId("drop-button").click();
    await expect(page.getByTestId("result-card")).toBeVisible({
      timeout: 8000,
    });

    // Reset
    await page.getByTestId("reset-button").click();
    await expect(page.getByTestId("drop-button")).toBeVisible({
      timeout: 3000,
    });
    await expect(page.getByTestId("result-card")).toHaveCount(0);

    // Second drop must also complete
    await page.getByTestId("drop-button").click();
    await expect(page.getByTestId("result-card")).toBeVisible({
      timeout: 8000,
    });
  });
});
```

- [ ] **Step 6.2: Run reset tests**

```bash
npx playwright test e2e/gravity-lab.spec.ts -g "återställning"
```
Expected: 2 tests × 3 projects = 6 pass.

- [ ] **Step 6.3: Commit**

```bash
git add e2e/gravity-lab.spec.ts
git commit -m "test: add reset and multi-drop tests for gravity lab"
```

---

## Task 7: Accordion toggle and orbit controls tests

**Files:**
- Modify: `e2e/gravity-lab.spec.ts`

- [ ] **Step 7.1: Add accordion and orbit describe blocks**

```typescript
test.describe("Gravitationslabbet – ackordeon", () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapSv(page);
    await openLabMode(page);
  });

  test("Drop section is open by default", async ({ page }) => {
    // GravityDropLab visible ↔ drop section is expanded
    await expect(page.getByTestId("gravity-drop-lab")).toBeVisible();
    const dropToggle = page.getByRole("button", {
      name: /Gravitationslabbet/,
    });
    await expect(dropToggle).toHaveAttribute("aria-expanded", "true");
  });

  test("toggling to Orbit section collapses Drop and shows slider", async ({
    page,
  }) => {
    const orbitToggle = page.getByRole("button", { name: /Banmekanik/ });
    await orbitToggle.click();
    await expect(orbitToggle).toHaveAttribute("aria-expanded", "true");

    // Orbit content: sun mass slider
    await expect(page.getByRole("slider")).toBeVisible({ timeout: 2000 });
    // "Solens Massa" label visible
    await expect(page.getByText(/Solens Massa/)).toBeVisible();
  });

  test("toggling back to Drop re-expands GravityDropLab", async ({ page }) => {
    await page.getByRole("button", { name: /Banmekanik/ }).click();
    await expect(page.getByRole("slider")).toBeVisible({ timeout: 2000 });

    await page.getByRole("button", { name: /Gravitationslabbet/ }).click();
    await expect(page.getByTestId("gravity-drop-lab")).toBeVisible({
      timeout: 2000,
    });
  });
});

test.describe("Gravitationslabbet – omloppskontroller", () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapSv(page);
    await openLabMode(page);
    // Open orbit section first
    await page.getByRole("button", { name: /Banmekanik/ }).click();
    await expect(page.getByRole("slider")).toBeVisible({ timeout: 2000 });
  });

  test("sun mass slider starts at 1x and label reflects value", async ({
    page,
  }) => {
    await expect(page.getByText("Solens Massa: 1.0x")).toBeVisible();
    const slider = page.getByRole("slider");
    await expect(slider).toHaveAttribute("value", "1");
  });

  test("moving slider updates the label", async ({ page }) => {
    const slider = page.getByRole("slider");
    await slider.fill("3");
    await expect(page.getByText("Solens Massa: 3.0x")).toBeVisible();
  });

  test("reset button restores slider to 1x", async ({ page }) => {
    const slider = page.getByRole("slider");
    await slider.fill("5");
    await expect(page.getByText("Solens Massa: 5.0x")).toBeVisible();

    await page.getByRole("button", { name: "Återställ" }).click();
    await expect(page.getByText("Solens Massa: 1.0x")).toBeVisible({
      timeout: 3000,
    });
  });
});
```

- [ ] **Step 7.2: Run accordion and orbit tests**

```bash
npx playwright test e2e/gravity-lab.spec.ts -g "ackordeon|omloppskontroller"
```
Expected: 6 tests × 3 projects = 18 pass.

**Note on `toHaveAttribute("value", "1")`:** Range inputs in React update the DOM's `value` attribute via the `value` prop. If this assertion fails (e.g., attribute reads "1" but the matcher fails), use `toHaveValue("1")` instead — Playwright's `toHaveValue` handles form controls more reliably than `toHaveAttribute`.

- [ ] **Step 7.3: Commit**

```bash
git add e2e/gravity-lab.spec.ts
git commit -m "test: add accordion toggle and orbit controls tests for gravity lab"
```

---

## Task 8: Full run and final verification

- [ ] **Step 8.1: Run the complete gravity lab suite**

```bash
npx playwright test e2e/gravity-lab.spec.ts
```
Expected: all tests pass across all three projects. Count: ~20 tests × 3 projects = ~60.

- [ ] **Step 8.2: Run all e2e tests to check no regressions**

```bash
npx playwright test
```
Expected: existing tests unchanged, all pass.

- [ ] **Step 8.3: If any tests are flaky, add retries or increase timeouts**

The per-project `retries: 1` in `playwright.config.ts` covers transient failures. For persistently slow CI, increase the fall-completion timeout from `8000` to `12000` in the critical drop tests only.

---

## Self-Review Notes

- **Spec coverage:** All features covered — navigation (both layouts), object selection (3 objects), planet selection, the critical drop path (2 planets × 3 objects), result card content, reset mid-fall and post-impact, accordion toggle, orbit slider read/write/reset.
- **Type consistency:** All `data-testid` values defined in Task 1 are referenced by exact string in Tasks 3–7. No mismatches.
- **No placeholders:** All test blocks contain complete TypeScript. No TBDs.
- **Locale note:** Number assertions use `/1[.,][23]/` regex to be locale-agnostic — Swedish uses comma, English uses period, both are covered.
- **Slider label:** `GravityLabControls` uses a hardcoded Swedish string `"Solens Massa: ${sunMassMultiplier.toFixed(1)}x"` (not an i18n key), so the test assertion matches exactly what renders.
- **Mobile "Återställ" button:** `GravityLabControls` has `title="Återställ planeter"` and visible text "Återställ" — `getByRole("button", { name: "Återställ" })` will match on the visible text.
