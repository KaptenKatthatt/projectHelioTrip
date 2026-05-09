# Lab Overlay Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scrollable side-panel accordion with a full-area tab overlay that shows GravityDropLab at ~90% viewport or GravityLabControls in a small corner panel, while hiding unrelated HUD controls in lab mode.

**Architecture:** A new `LabOverlay` organism reads `activeLabGame` from Zustand and self-positions — a near-full-screen panel for the drop game, a compact corner panel for the orbit game. On mobile it exports `LabOverlayContent` (no positioning wrapper) for use inside the existing BottomSheet. `HudPrimaryNavRegion` returns null in lab mode (hiding NavigationAccordion, ProgressPanel, etc.). `HudControlRailRegion` hides TimePlayback and FlightMode in lab, keeping only GameModeSwitcher and AboutDialog.

**Tech stack:** React 18, Zustand, Tailwind CSS v4, Playwright e2e tests

---

## Files

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/store/slices/createGameSlice.ts` | Add `activeLabGame` state + `setActiveLabGame` action |
| Modify | `src/i18n/translations.ts` | Add `dropTabLabel` / `orbitTabLabel` to `labAccordion` type |
| Modify | `src/i18n/locales/sv.ts` | Swedish tab label strings |
| Modify | `src/i18n/locales/en.ts` | English tab label strings |
| Create | `src/components/organisms/LabOverlay.tsx` | `LabOverlayContent` (shared) + `LabOverlay` (desktop-positioned) |
| Modify | `src/components/templates/HUD.tsx` | Wire LabOverlay, hide CameraTool in lab mode |
| Modify | `src/components/templates/hud/HudControlRailRegion.tsx` | Accept `gameMode` prop; hide TimePlayback + FlightMode in lab |
| Modify | `src/components/templates/hud/HudPrimaryNavRegion.tsx` | Read `gameMode` from store; return null in lab mode |
| Modify | `src/components/templates/hud/HudDetailRegion.tsx` | Replace LabAccordion with LabOverlayContent in mobile sheet; raise height |
| Modify | `e2e/gravity-lab.spec.ts` | Update accordion selectors to tab selectors; add lab-mode-controls tests |
| Delete | `src/components/molecules/LabAccordion.tsx` | Replaced by LabOverlay |

---

## Task 1: Add `activeLabGame` to Zustand store

**Files:**
- Modify: `src/store/slices/createGameSlice.ts`

- [ ] **Step 1: Add state and action types**

  In `createGameSlice.ts`, add to the `GameState` interface (after `gravityLabResetTrigger: number;`):
  ```ts
  activeLabGame: "drop" | "orbit";
  ```
  Add to the `GameActions` interface (after `triggerGravityLabReset: () => void;`):
  ```ts
  setActiveLabGame: (game: "drop" | "orbit") => void;
  ```

- [ ] **Step 2: Wire initial value and implementation**

  In the `createGameSlice` factory, add after `gravityLabResetTrigger: 0,`:
  ```ts
  activeLabGame: "drop",
  ```
  Add after `triggerGravityLabReset: () => set(...),`:
  ```ts
  setActiveLabGame: (game) => set({ activeLabGame: game }),
  ```

- [ ] **Step 3: Run existing store tests to confirm no regression**

  Run: `npx vitest run src/store/useStore.test.ts`
  Expected: all pass

- [ ] **Step 4: Commit**

  ```bash
  git add src/store/slices/createGameSlice.ts
  git commit -m "feat(store): add activeLabGame state for lab game tab switcher"
  ```

---

## Task 2: Add translation keys for tab labels

**Files:**
- Modify: `src/i18n/translations.ts`
- Modify: `src/i18n/locales/sv.ts`
- Modify: `src/i18n/locales/en.ts`

- [ ] **Step 1: Update the type in `translations.ts`**

  Find the `labAccordion` block in the `Translation` type (search for `orbitTitle`). Extend it:
  ```ts
  labAccordion: {
    orbitTitle: string;
    dropTitle: string;
    orbitTabLabel: string;
    dropTabLabel: string;
  };
  ```

- [ ] **Step 2: Add Swedish strings in `sv.ts`**

  Locate `labAccordion:` in `sv.ts` and add the two new keys:
  ```ts
  labAccordion: {
    orbitTitle: 'Banmekanik — Solens massa',
    dropTitle: 'Gravitationslabbet — Släpp & jämför',
    orbitTabLabel: 'Banmekanik',
    dropTabLabel: 'Gravitationsfall',
  },
  ```

- [ ] **Step 3: Add English strings in `en.ts`**

  Locate `labAccordion:` in `en.ts` and add the two new keys:
  ```ts
  labAccordion: {
    orbitTitle: 'Orbital Mechanics — Sun Mass',
    dropTitle: 'Gravity Lab — Drop & Compare',
    orbitTabLabel: 'Orbital Mechanics',
    dropTabLabel: 'Gravity Lab',
  },
  ```

- [ ] **Step 4: Confirm TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: zero errors

- [ ] **Step 5: Commit**

  ```bash
  git add src/i18n/translations.ts src/i18n/locales/sv.ts src/i18n/locales/en.ts
  git commit -m "feat(i18n): add short tab labels for lab game switcher"
  ```

---

## Task 3: Create LabOverlay component

**Files:**
- Create: `src/components/organisms/LabOverlay.tsx`

- [ ] **Step 1: Create the file with LabOverlayContent**

  Create `src/components/organisms/LabOverlay.tsx`:
  ```tsx
  import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
  import { useTranslation } from "../../hooks/useTranslation";
  import { useStore } from "../../store/useStore";
  import { GravityDropLab } from "./GravityDropLab";
  import { GravityLabControls } from "../molecules/GravityLabControls";

  export const LabOverlayContent = () => {
    const activeLabGame = useStore((s) => s.activeLabGame);
    const setActiveLabGame = useStore((s) => s.setActiveLabGame);
    const { t } = useTranslation();
    const lab = t.learn.labAccordion;

    return (
      <div className="flex flex-col gap-3">
        <div
          role="tablist"
          data-testid="lab-game-switcher"
          aria-label={lab.dropTabLabel + " / " + lab.orbitTabLabel}
          className="flex rounded-xl bg-white/5 p-1 gap-1 shrink-0"
        >
          <button
            type="button"
            role="tab"
            data-testid="lab-tab-drop"
            aria-selected={activeLabGame === "drop"}
            onClick={() => setActiveLabGame("drop")}
            className={[
              "pointer-events-auto flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
              activeLabGame === "drop"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/50 hover:text-white/80 hover:bg-white/8",
            ].join(" ")}
          >
            <span className="text-base leading-none shrink-0">🍎</span>
            <span className="truncate">{lab.dropTabLabel}</span>
          </button>
          <button
            type="button"
            role="tab"
            data-testid="lab-tab-orbit"
            aria-selected={activeLabGame === "orbit"}
            onClick={() => setActiveLabGame("orbit")}
            className={[
              "pointer-events-auto flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
              activeLabGame === "orbit"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/50 hover:text-white/80 hover:bg-white/8",
            ].join(" ")}
          >
            <span className="text-base leading-none shrink-0">☀️</span>
            <span className="truncate">{lab.orbitTabLabel}</span>
          </button>
        </div>

        {activeLabGame === "drop" && <GravityDropLab />}
        {activeLabGame === "orbit" && (
          <div className="flex flex-col gap-4">
            <GravityLabControls embedded />
          </div>
        )}
      </div>
    );
  };

  export const LabOverlay = () => {
    const layoutTier = useResponsiveLayout();
    const activeLabGame = useStore((s) => s.activeLabGame);

    if (layoutTier === "compact") return null;

    if (activeLabGame === "orbit") {
      return (
        <div className="pointer-events-none fixed right-4 bottom-20 z-20 w-72">
          <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
            <LabOverlayContent />
          </div>
        </div>
      );
    }

    return (
      <div className="pointer-events-none fixed inset-x-4 top-16 bottom-20 z-20">
        <div className="pointer-events-auto h-full overflow-y-auto custom-scrollbar rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
          <LabOverlayContent />
        </div>
      </div>
    );
  };
  ```

- [ ] **Step 2: Confirm TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: zero errors

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/organisms/LabOverlay.tsx
  git commit -m "feat: add LabOverlay component with pill-switcher game nav"
  ```

---

## Task 4: Wire LabOverlay into HUD.tsx

**Files:**
- Modify: `src/components/templates/HUD.tsx`

- [ ] **Step 1: Replace the lab inline block**

  At the top of `HUD.tsx`, replace the existing import:
  ```tsx
  import { LabAccordion } from "../molecules/LabAccordion";
  ```
  with:
  ```tsx
  import { LabOverlay } from "../organisms/LabOverlay";
  ```
  Remove the import of `GravityLabControls` from HUD.tsx (it's now inside LabOverlay).

- [ ] **Step 2: Replace the conditional render block**

  Find this block near the bottom of the JSX in `HUD.tsx` (around line 181):
  ```tsx
  {gameMode === "lab" ? (
    <div className="pointer-events-none fixed right-4 top-16 z-20 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl min-w-[280px] max-w-[340px]">
        <LabAccordion />
      </div>
    </div>
  ) : (
    <div className="pointer-events-none fixed right-4 top-1/4 z-20 flex flex-col items-end">
      <GravityLabControls />
    </div>
  )}
  ```
  Replace it with:
  ```tsx
  {gameMode === "lab" && <LabOverlay />}
  ```

- [ ] **Step 3: Hide CameraTool in lab mode**

  Find the mobile CameraTool render (around line 178):
  ```tsx
  {mobileLayout && (
    <CameraTool className="fixed left-4 bottom-32 z-10" />
  )}
  ```
  Change it to:
  ```tsx
  {mobileLayout && gameMode !== "lab" && (
    <CameraTool className="fixed left-4 bottom-32 z-10" />
  )}
  ```

- [ ] **Step 4: Confirm TypeScript compiles and dev server starts**

  Run: `npx tsc --noEmit`
  Expected: zero errors. Start dev server and verify lab mode shows the new overlay.

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/templates/HUD.tsx
  git commit -m "feat: wire LabOverlay into HUD, replace LabAccordion panel"
  ```

---

## Task 5: Hide non-lab controls in HudControlRailRegion

**Files:**
- Modify: `src/components/templates/hud/HudControlRailRegion.tsx`
- Modify: `src/components/templates/HUD.tsx` (pass gameMode prop)

- [ ] **Step 1: Add `gameMode` prop to HudControlRailRegion**

  In `HudControlRailRegion.tsx`, update the props type:
  ```tsx
  import type { GameMode } from "../../../lib/missions/types";

  type HudControlRailRegionProps = {
    readonly show: boolean;
    readonly selectedConstellation: string | null;
    readonly gameMode: GameMode;
  };

  export const HudControlRailRegion = ({
    show,
    selectedConstellation,
    gameMode,
  }: HudControlRailRegionProps) => {
  ```

- [ ] **Step 2: Conditionally hide TimePlayback and FlightModeToggle in lab**

  Replace the body of the component's return with:
  ```tsx
  if (!show) return null;

  return (
    <footer className="shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-center">
        {selectedConstellation === null && gameMode !== "lab" ? (
          <TimePlaybackControls
            className="pointer-events-auto ds-panel-control w-full max-w-3xl sm:w-auto"
          />
        ) : null}
        <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 sm:w-auto">
          {selectedConstellation !== null ? <ConstellationViewControls /> : null}
          <GameModeSwitcher compact={false} />
          {gameMode !== "lab" ? <FlightModeToggle /> : null}
          <AboutDialog />
        </div>
      </div>
    </footer>
  );
  ```

- [ ] **Step 3: Pass gameMode from HUD.tsx**

  In `HUD.tsx`, find:
  ```tsx
  <HudControlRailRegion
    show={!mobileLayout}
    selectedConstellation={selectedConstellation}
  />
  ```
  Replace with:
  ```tsx
  <HudControlRailRegion
    show={!mobileLayout}
    selectedConstellation={selectedConstellation}
    gameMode={gameMode}
  />
  ```

- [ ] **Step 4: Confirm TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: zero errors

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/templates/hud/HudControlRailRegion.tsx src/components/templates/HUD.tsx
  git commit -m "feat: hide TimePlayback and FlightMode controls in lab mode"
  ```

---

## Task 6: Hide HudPrimaryNavRegion (and NavigationAccordion) in lab mode

**Files:**
- Modify: `src/components/templates/hud/HudPrimaryNavRegion.tsx`

- [ ] **Step 1: Read gameMode from store and return null in lab**

  Add the import at the top of `HudPrimaryNavRegion.tsx`:
  ```tsx
  import { useStore } from "../../../store/useStore";
  ```
  Inside the component body, add as the first line after destructuring props:
  ```tsx
  const gameMode = useStore((s) => s.gameMode);
  if (gameMode === "lab") return null;
  ```

  The full component signature is unchanged; the guard is the only addition:
  ```tsx
  export const HudPrimaryNavRegion = ({
    mobileLayout,
    showPlanetInfoUi,
    showMissionUi,
    selectedConstellation,
    minimizePanelLabel,
    expandPanelLabel,
    progressTitle,
  }: HudPrimaryNavRegionProps) => {
    const { gameMode } = useActiveBodyViewGameMode();
    const gameModeStore = useStore((s) => s.gameMode);
    if (gameModeStore === "lab") return null;
    // ... rest unchanged
  ```

  Note: `HudPrimaryNavRegion` already imports `useActiveBodyViewGameMode` which also exposes `gameMode`. Use the store selector directly to avoid duplication — the existing `gameMode` from `useActiveBodyViewGameMode` is used in the JSX below so leave it intact.

- [ ] **Step 2: Confirm TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: zero errors

- [ ] **Step 3: Verify visually**

  Start dev server. Switch to lab mode on desktop. Confirm:
  - NavigationAccordion (planet/constellation menu) is gone
  - ProgressPanel is gone
  - MissionCard is gone
  - LabOverlay is visible

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/templates/hud/HudPrimaryNavRegion.tsx
  git commit -m "feat: hide primary nav region in lab mode (NavigationAccordion, ProgressPanel)"
  ```

---

## Task 7: Update mobile BottomSheet to use LabOverlayContent

**Files:**
- Modify: `src/components/templates/hud/HudDetailRegion.tsx`

- [ ] **Step 1: Update import**

  In `HudDetailRegion.tsx`, replace:
  ```tsx
  import { LabAccordion } from "../../molecules/LabAccordion";
  ```
  with:
  ```tsx
  import { LabOverlayContent } from "../../organisms/LabOverlay";
  ```

- [ ] **Step 2: Update the mobile lab BottomSheet**

  Find (around line 147):
  ```tsx
  <BottomSheet
    open={openNavSheet === "lab"}
    onClose={closeNavSheets}
    title={t.phase3.gameMode.lab}
  >
    <div className="p-3">
      <LabAccordion />
    </div>
  </BottomSheet>
  ```
  Replace with:
  ```tsx
  <BottomSheet
    open={openNavSheet === "lab"}
    onClose={closeNavSheets}
    title={t.phase3.gameMode.lab}
    panelClassName="max-h-[90dvh]"
  >
    <div className="p-3 h-full overflow-y-auto">
      <LabOverlayContent />
    </div>
  </BottomSheet>
  ```

- [ ] **Step 3: Confirm TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: zero errors

- [ ] **Step 4: Verify on mobile viewport**

  Open the dev server in a browser, set viewport to 375×812 (iPhone size). Open lab mode. Confirm:
  - BottomSheet is ~90dvh tall
  - Pill-switcher visible at top
  - GravityDropLab shows without scroll when drop tab is selected
  - Switching to orbit tab shows GravityLabControls

- [ ] **Step 5: Commit**

  ```bash
  git add src/components/templates/hud/HudDetailRegion.tsx
  git commit -m "feat: use LabOverlayContent in mobile lab BottomSheet, raise to 90dvh"
  ```

---

## Task 8: Delete LabAccordion

**Files:**
- Delete: `src/components/molecules/LabAccordion.tsx`

- [ ] **Step 1: Confirm no remaining imports**

  Run:
  ```bash
  grep -r "LabAccordion" src/
  ```
  Expected: zero matches (HUD.tsx and HudDetailRegion.tsx were already updated in Tasks 4 and 7).

- [ ] **Step 2: Delete the file**

  ```bash
  git rm src/components/molecules/LabAccordion.tsx
  ```

- [ ] **Step 3: Confirm TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: zero errors

- [ ] **Step 4: Commit**

  ```bash
  git commit -m "refactor: delete LabAccordion, superseded by LabOverlay"
  ```

---

## Task 9: Update e2e tests for new tab-switcher UI

**Files:**
- Modify: `e2e/gravity-lab.spec.ts`

Context: The existing tests use accordion semantics (`role="button"` with `aria-expanded`). The new UI uses a tab switcher (`role="tab"` with `aria-selected`). The `getLabScope` and `openLabMode` helpers still work (they scope by dialog name and testid), but the accordion-specific describe block must be rewritten.

- [ ] **Step 1: Update `openLabMode` to use new scope detection**

  The `openLabMode` helper currently expects `gravity-drop-lab` to be visible after clicking — this still holds since the drop tab is the default. No change needed.

  The `getLabScope` helper still works (scopes to `role="dialog"` named "Labb" on mobile, or `body` on desktop). No change needed.

- [ ] **Step 2: Rewrite the accordion describe block**

  Replace the entire `"Gravitationslabbet – ackordeon"` describe block:
  ```ts
  test.describe("Gravitationslabbet – fliknavigation", () => {
    test("Drop tab is selected by default and GravityDropLab is visible", async ({ page }) => {
      await bootstrapSv(page);
      const scope = await openLabMode(page);

      await expect(scope.getByTestId("lab-tab-drop")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(scope.getByTestId("lab-tab-orbit")).toHaveAttribute(
        "aria-selected",
        "false",
      );
      await expect(scope.getByTestId("gravity-drop-lab")).toBeVisible();
    });

    test("switching to Orbit tab shows the sun mass slider", async ({ page }) => {
      await bootstrapSv(page);
      const scope = await openLabMode(page);

      await scope.getByTestId("lab-tab-orbit").click();

      await expect(scope.getByTestId("lab-tab-orbit")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(scope.getByTestId("lab-tab-drop")).toHaveAttribute(
        "aria-selected",
        "false",
      );
      await expect(scope.getByRole("slider")).toBeVisible({ timeout: 2000 });
      await expect(scope.getByText(/Solens Massa/)).toBeVisible();
      await expect(scope.getByTestId("gravity-drop-lab")).toHaveCount(0);
    });

    test("switching back to Drop tab re-shows GravityDropLab", async ({ page }) => {
      await bootstrapSv(page);
      const scope = await openLabMode(page);

      await scope.getByTestId("lab-tab-orbit").click();
      await expect(scope.getByRole("slider")).toBeVisible({ timeout: 2000 });

      await scope.getByTestId("lab-tab-drop").click();
      await expect(scope.getByTestId("gravity-drop-lab")).toBeVisible({
        timeout: 2000,
      });
      await expect(scope.getByRole("slider")).toHaveCount(0);
    });
  });
  ```

- [ ] **Step 3: Update the orbit-controls describe block selectors**

  The `"Gravitationslabbet – omloppskontroller"` tests open orbit via `scope.getByRole("button", { name: /Banmekanik/ }).click()`. Replace all three occurrences with:
  ```ts
  await scope.getByTestId("lab-tab-orbit").click();
  ```
  The assertions inside each test (`getByRole("slider")`, `getByText("Solens Massa: ...")`, `getByRole("button", { name: "Återställ" })`) are unchanged.

- [ ] **Step 4: Add a lab-mode-controls test describing what is hidden**

  Append a new describe block at the end of the file:
  ```ts
  test.describe("Labbläge – gränssnittsfokus (desktop)", () => {
    test("NavigationAccordion and ProgressPanel are absent in lab mode", async ({
      page,
    }) => {
      // Only meaningful on desktop (≥640 px); skip on mobile viewports.
      await page.setViewportSize({ width: 1280, height: 800 });
      await bootstrapSv(page);
      await openLabMode(page);

      // Planet/constellation nav should not be in the DOM
      await expect(
        page.getByRole("navigation").filter({ hasText: /Planeter|Planets/ }),
      ).toHaveCount(0, { timeout: 3000 });

      // GameModeSwitcher is still present (lab tab is active)
      await expect(page.getByRole("radio", { name: "Labb" })).toBeVisible();
    });
  });
  ```

- [ ] **Step 5: Run the full e2e suite**

  Run: `npx playwright test e2e/gravity-lab.spec.ts --project=lab-desktop`
  Expected: all tests pass. If any test times out, increase `timeout` for that test up to `120_000`.

  Also run: `npx playwright test e2e/gravity-lab.spec.ts --project=lab-mobile`
  Expected: all tests pass.

- [ ] **Step 6: Commit**

  ```bash
  git add e2e/gravity-lab.spec.ts
  git commit -m "test: update e2e suite for pill-switcher lab nav and hidden controls"
  ```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task(s) |
|---|---|
| Planet menu auto-closes in lab | Task 6 (HudPrimaryNavRegion returns null) |
| GravityDropLab no scrollbars | Task 3 (full-height overlay `inset-x-4 top-16 bottom-20`) |
| Banmekanik small + discrete | Task 3 (orbit: `w-72` corner panel) |
| ProgressPanel disappears | Task 6 (HudPrimaryNavRegion returns null) |
| Full focus in lab (unrelated panels closed) | Task 6 |
| Hide free flight, time, camera | Task 4 (CameraTool), Task 5 (TimePlayback, FlightMode) |
| GameModeSwitcher stays | Task 5 (GameModeSwitcher kept in HudControlRailRegion) |
| Menus return on mode switch | Tasks 4–6 (conditions reactivate on gameMode change) |
| Desktop, mobile, tablet | Task 3 (LabOverlay), Task 7 (mobile BottomSheet) |
| 2 games clearly discoverable | Task 3 (pill-switcher always visible, both tabs shown) |
| Extensible for 2–3 more games | Task 3 (add tab button + `activeLabGame` value per new game) |

**Placeholder check:** None found.

**Type consistency check:** `activeLabGame: "drop" | "orbit"` is defined in Task 1 and used in Tasks 3, 9. `setActiveLabGame` is defined in Task 1 and called in Task 3. `dropTabLabel` / `orbitTabLabel` defined in Task 2 and consumed in Task 3.
