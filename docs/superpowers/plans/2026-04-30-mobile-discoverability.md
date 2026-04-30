# Mobile Discoverability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent context strip at the top of the mobile HUD, a free-flight FAB, and a tappable constellation mini-card — solving four discoverability gaps without restructuring the bottom nav.

**Architecture:** `MobileContextStrip` is a fixed molecule that replaces `HudTopBarRegion` on mobile, reading from Zustand directly and receiving two sheet-open callbacks from `HUD.tsx`. The rocket FAB lives inline in `HudDetailRegion`. `ConstellationMiniCard` is a fixed molecule that auto-renders when a constellation is selected and the Stars sheet is closed, expanding to a full `BottomSheet` on tap.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Zustand, Lucide icons, Vitest + Testing Library (unit tests), `node_modules/.bin/tsc --project tsconfig.app.json --noEmit` for type-checking.

**Working directory:** `C:\code\projectHelioTrip-sprint1`  
**Branch:** `sprint1-ux-sprint1`  
**Spec:** `docs/superpowers/specs/2026-04-30-mobile-discoverability-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| **Create** | `src/components/molecules/MobileContextStrip.tsx` | Adaptive top strip: home/back left, body name center, XP right |
| **Create** | `src/components/molecules/ConstellationMiniCard.tsx` | Collapsed card with ▲ button → tapping opens BottomSheet with story tabs |
| **Modify** | `src/components/templates/hud/HudTopBarRegion.tsx` | Return `null` when `mobileLayout` — strip replaces it |
| **Modify** | `src/components/templates/HUD.tsx` | Render `MobileContextStrip`; add top padding on mobile; wire callbacks; pass `onOpenConstellationsSheet` to `HudDetailRegion` |
| **Modify** | `src/components/templates/hud/HudDetailRegion.tsx` | Add FAB; remove `FlightModeToggle` from More sheet; wire `ConstellationList` `onPick`; render `ConstellationMiniCard` |

---

## Task 1 — MobileContextStrip

**Commit: `feat: add MobileContextStrip and hide mobile top bar`**

### Files
- Create: `src/components/molecules/MobileContextStrip.tsx`
- Modify: `src/components/templates/hud/HudTopBarRegion.tsx` lines 26–81
- Modify: `src/components/templates/HUD.tsx` lines 82–139

---

- [ ] **Step 1 — Create `MobileContextStrip.tsx`**

Create `src/components/molecules/MobileContextStrip.tsx` with this exact content:

```tsx
import { ChevronLeft } from "lucide-react";
import { CONSTELLATION_MENU_ITEMS } from "../../lib/constellations";
import { useTranslation } from "../../hooks/useTranslation";
import { useStore } from "../../store/useStore";

type MobileContextStripProps = {
  readonly onOpenChallengeSheet: () => void;
  readonly onOpenConstellationsSheet: () => void;
  readonly onBackFromPlanet: () => void;
};

export const MobileContextStrip = ({
  onOpenChallengeSheet,
  onOpenConstellationsSheet,
  onBackFromPlanet,
}: MobileContextStripProps) => {
  const { locale, t, bodyName } = useTranslation();
  const activeBody = useStore((s) => s.activeBody);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const xp = useStore((s) => s.xp);
  const titleId = useStore((s) => s.title);
  const titleLabel = t.learn.xpTitles[titleId];

  const constellationLabel = selectedConstellation
    ? (CONSTELLATION_MENU_ITEMS.find((i) => i.id === selectedConstellation)?.[
        locale === "sv" ? "labelSv" : "labelEn"
      ] ?? selectedConstellation)
    : null;

  const renderLeft = () => {
    if (selectedConstellation !== null) {
      return (
        <button
          type="button"
          onClick={onOpenConstellationsSheet}
          className="flex items-center gap-0.5 text-xs text-white/65 transition hover:text-white/90"
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t.ui.constellations}
        </button>
      );
    }
    if (activeBody !== null) {
      return (
        <button
          type="button"
          onClick={onBackFromPlanet}
          className="flex items-center gap-0.5 text-xs text-white/65 transition hover:text-white/90"
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t.ui.universeSolarSystem}
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={onBackFromPlanet}
        className="text-sm font-semibold tracking-tight text-white/90 transition hover:text-white"
      >
        {t.appTitle}
      </button>
    );
  };

  const renderCenter = () => {
    if (selectedConstellation !== null) {
      return (
        <span className="pointer-events-none absolute inset-x-0 text-center text-xs font-semibold text-white/80">
          {constellationLabel}
        </span>
      );
    }
    if (activeBody !== null) {
      return (
        <span className="pointer-events-none absolute inset-x-0 text-center text-xs font-semibold text-white/80">
          {bodyName(activeBody)}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="pointer-events-auto fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-white/8 bg-black/70 px-3 py-1.5 backdrop-blur-xl">
      <div className="relative z-10 min-w-0">{renderLeft()}</div>
      {renderCenter()}
      <button
        type="button"
        onClick={onOpenChallengeSheet}
        aria-label={`${xp} ${t.learn.ui.xpPoints} – ${titleLabel}`}
        className="relative z-10 flex shrink-0 items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[11px] text-cyan-200 transition hover:bg-cyan-400/20"
      >
        <span className="font-mono">{xp}</span>
        <span className="text-cyan-300/60">{t.learn.ui.xpPoints}</span>
        <span className="text-white/40">·</span>
        <span className="text-white/65">{titleLabel}</span>
      </button>
    </div>
  );
};
```

- [ ] **Step 2 — Null out `HudTopBarRegion` on mobile**

In `src/components/templates/hud/HudTopBarRegion.tsx`, add an early return after the function opens. The existing signature is:

```tsx
export const HudTopBarRegion = ({
  mobileLayout,
  appTitle,
  tagline,
  gameMode,
}: HudTopBarRegionProps) => {
```

Add immediately after the opening brace:

```tsx
  if (mobileLayout) return null;
```

- [ ] **Step 3 — Wire `MobileContextStrip` into `HUD.tsx`**

Open `src/components/templates/HUD.tsx`.

**3a.** Add import at top (after existing HUD region imports):

```tsx
import { MobileContextStrip } from "../molecules/MobileContextStrip";
```

**3b.** Add two new store reads after `const setMobilePlanetInfoSheetOpen = ...` (around line 41):

```tsx
  const setActiveBody = useStore((s) => s.setActiveBody);
```

**3c.** Inside `HUD.tsx`, after the `closeNavSheets` function, add:

```tsx
  const handleBackFromPlanet = (): void => {
    setActiveBody(null);
  };
```

**3d.** In the JSX return, add `<MobileContextStrip>` as the **first child** of the outer div, before `<HudTopBarRegion>`:

```tsx
      {mobileLayout && (
        <MobileContextStrip
          onOpenChallengeSheet={() => handleToggleNavSheet("challenge")}
          onOpenConstellationsSheet={() => handleToggleNavSheet("stars")}
          onBackFromPlanet={handleBackFromPlanet}
        />
      )}
      <HudTopBarRegion ... />
```

**3e.** In the outer div's className, change the mobile padding string to add top padding that clears the fixed strip (~36 px):

```tsx
mobileLayout
  ? "p-3 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))]"
  : layoutTier === "expanded"
```

- [ ] **Step 4 — Type-check**

```bash
cd C:/code/projectHelioTrip-sprint1
node_modules/.bin/tsc --project tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 5 — Commit**

```bash
git -C C:/code/projectHelioTrip-sprint1 add \
  src/components/molecules/MobileContextStrip.tsx \
  src/components/templates/hud/HudTopBarRegion.tsx \
  src/components/templates/HUD.tsx
git -C C:/code/projectHelioTrip-sprint1 commit -m "feat: add MobileContextStrip and hide mobile top bar"
```

---

### Handoff 1

> **State after commit 1:** The mobile HUD now shows a fixed dark strip at the top. In the solar system overview it shows "HelioTrip" left and the XP pill right. When a planet is selected it shows "← Solsystemet" left and the planet name centered. When a constellation is selected it shows "← Stjärnbilder" left and the constellation name centered. Tapping the XP pill opens the Challenge sheet. The old HudTopBarRegion title/badge is hidden on mobile.
>
> **Next task:** Task 2 — Free-flight FAB + remove FlightModeToggle from More sheet.
>
> **Working directory:** `C:\code\projectHelioTrip-sprint1` · **Branch:** `sprint1-ux-sprint1`  
> **Spec:** `docs/superpowers/specs/2026-04-30-mobile-discoverability-design.md`  
> **Plan:** `docs/superpowers/plans/2026-04-30-mobile-discoverability.md`  
> **Type-check:** `node_modules/.bin/tsc --project tsconfig.app.json --noEmit`

---

## Task 2 — Free-flight FAB + More menu cleanup

**Commit: `feat: add free-flight FAB and remove it from More menu`**

### Files
- Modify: `src/components/templates/hud/HudDetailRegion.tsx`

---

- [ ] **Step 1 — Add FAB and remove FlightModeToggle from HudDetailRegion**

Open `src/components/templates/hud/HudDetailRegion.tsx`.

**1a.** Add imports at the top:

```tsx
import { Rocket } from "lucide-react";
```

And add store imports inside the component body (after existing `useState`):

```tsx
  const navigationMode = useStore((s) => s.navigationMode);
  const setNavigationMode = useStore((s) => s.setNavigationMode);
  const gameMode = useStore((s) => s.gameMode);
```

**1b.** Remove the existing `FlightModeToggle` import line and remove `<FlightModeToggle />` from the More sheet JSX. The More sheet currently renders:

```tsx
        <div className="flex flex-col gap-3 p-4">
          <FlightModeToggle />
          <LanguageToggle />
          <AboutDialog />
        </div>
```

Change it to:

```tsx
        <div className="flex flex-col gap-3 p-4">
          <LanguageToggle />
          <AboutDialog />
        </div>
```

**1c.** Add the FAB just before the final `</>` closing tag of the returned fragment. The FAB is visible only when `gameMode === "explore"` and not in free flight:

```tsx
      {gameMode === "explore" && navigationMode !== "free" && (
        <button
          type="button"
          aria-label={t.ui.freeFlight}
          onClick={() => setNavigationMode("free")}
          className="pointer-events-auto fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-[15] flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 shadow-lg backdrop-blur-md transition hover:bg-white/15 active:scale-95"
        >
          <Rocket className="h-5 w-5" aria-hidden />
        </button>
      )}
```

- [ ] **Step 2 — Type-check**

```bash
node_modules/.bin/tsc --project tsconfig.app.json --noEmit
```

Expected: no errors. If `FlightModeToggle` is still imported but unused, remove the import line too.

- [ ] **Step 3 — Commit**

```bash
git -C C:/code/projectHelioTrip-sprint1 add src/components/templates/hud/HudDetailRegion.tsx
git -C C:/code/projectHelioTrip-sprint1 commit -m "feat: add free-flight FAB and remove it from More menu"
```

---

### Handoff 2

> **State after commit 2:** A 🚀 rocket FAB appears bottom-right on mobile when Explore mode is active and free flight is off. Tapping it activates free flight (existing exit controls take over from there). The More sheet no longer contains the Flight Mode Toggle — that row is gone.
>
> **Next task:** Task 3 — ConstellationMiniCard + auto-close Stars sheet.
>
> **Working directory:** `C:\code\projectHelioTrip-sprint1` · **Branch:** `sprint1-ux-sprint1`  
> **Spec:** `docs/superpowers/specs/2026-04-30-mobile-discoverability-design.md`  
> **Plan:** `docs/superpowers/plans/2026-04-30-mobile-discoverability.md`  
> **Type-check:** `node_modules/.bin/tsc --project tsconfig.app.json --noEmit`

---

## Task 3 — ConstellationMiniCard + Stars sheet auto-close

**Commit: `feat: add ConstellationMiniCard and auto-close Stars sheet on pick`**

### Files
- Create: `src/components/molecules/ConstellationMiniCard.tsx`
- Modify: `src/components/templates/hud/HudDetailRegion.tsx`
- Modify: `src/components/templates/HUD.tsx`

---

- [ ] **Step 1 — Create `ConstellationMiniCard.tsx`**

Create `src/components/molecules/ConstellationMiniCard.tsx`:

```tsx
import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { CONSTELLATION_MENU_ITEMS } from "../../lib/constellations";
import { getConstellationStory } from "../../lib/learning/constellationStories";
import { useTranslation } from "../../hooks/useTranslation";
import { useStore } from "../../store/useStore";
import { BottomSheet } from "./BottomSheet";
import { ConstellationStoryCard } from "./ConstellationStoryCard";

export const ConstellationMiniCard = () => {
  const { locale } = useTranslation();
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const [expanded, setExpanded] = useState(false);

  if (!selectedConstellation) return null;

  const item = CONSTELLATION_MENU_ITEMS.find((i) => i.id === selectedConstellation);
  const label = item?.[locale === "sv" ? "labelSv" : "labelEn"] ?? selectedConstellation;
  const story = getConstellationStory(selectedConstellation);
  const preview = story?.story[locale as "sv" | "en"]?.slice(0, 72) ?? "";

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="pointer-events-auto fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[15] flex items-center justify-between rounded-xl border border-indigo-400/30 bg-black/80 px-3 py-2.5 text-left backdrop-blur-md transition hover:border-indigo-400/50 hover:bg-black/90"
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-indigo-200">✦ {label}</p>
          {preview && (
            <p className="mt-0.5 truncate text-[11px] text-white/45">{preview}…</p>
          )}
        </div>
        <div className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-400/45 bg-indigo-500/15 text-indigo-400">
          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
        </div>
      </button>

      <BottomSheet
        open={expanded}
        onClose={() => setExpanded(false)}
        title={label}
        panelClassName="max-h-[min(92dvh,32rem)]"
      >
        <div className="p-3 pt-0">
          <ConstellationStoryCard />
        </div>
      </BottomSheet>
    </>
  );
};
```

- [ ] **Step 2 — Auto-close Stars sheet when constellation is picked**

In `src/components/templates/hud/HudDetailRegion.tsx`, find the Stars `BottomSheet` block. It currently renders `ConstellationList` with:

```tsx
          <ConstellationList
            className="max-h-[min(20rem,40dvh)]"
            onPick={() => {}}
          />
```

Change `onPick` to close the sheet:

```tsx
          <ConstellationList
            className="max-h-[min(20rem,40dvh)]"
            onPick={closeNavSheets}
          />
```

- [ ] **Step 3 — Add `ConstellationMiniCard` prop to HudDetailRegion**

The mini card should render only when:
- Mobile layout is active
- A constellation is selected
- The Stars sheet is **not** open (to avoid overlap with the list)

Pass `openNavSheet` already exists as a prop, so this is derivable inside the component. Add the import and render the card inside `HudDetailRegion`.

**3a.** Add import in `HudDetailRegion.tsx`:

```tsx
import { ConstellationMiniCard } from "../molecules/ConstellationMiniCard";
```

**3b.** Add render just before the FAB block (or after — both are fixed, order doesn't matter). Add:

```tsx
      {openNavSheet !== "stars" && <ConstellationMiniCard />}
```

- [ ] **Step 4 — Type-check**

```bash
node_modules/.bin/tsc --project tsconfig.app.json --noEmit
```

Expected: no errors.

- [ ] **Step 5 — Verify `BottomSheet` props**

`ConstellationMiniCard` uses `<BottomSheet panelClassName=...>`. Confirm `BottomSheet` accepts `panelClassName` — it was added in Sprint 3 per the implementation history. If the prop name differs, check `src/components/molecules/BottomSheet.tsx` and adjust.

- [ ] **Step 6 — Commit**

```bash
git -C C:/code/projectHelioTrip-sprint1 add \
  src/components/molecules/ConstellationMiniCard.tsx \
  src/components/templates/hud/HudDetailRegion.tsx \
  src/components/templates/HUD.tsx
git -C C:/code/projectHelioTrip-sprint1 commit -m "feat: add ConstellationMiniCard and auto-close Stars sheet on pick"
```

- [ ] **Step 7 — Push all three commits**

```bash
git -C C:/code/projectHelioTrip-sprint1 push
```

---

### Handoff 3 — Implementation complete

> **State after all commits:** All four mobile discoverability problems are solved:
> 1. ✅ **Free flight found** — 🚀 FAB bottom-right in Explore mode.
> 2. ✅ **Constellation not hidden** — Stars sheet closes when you pick a constellation; a mini card + context strip name keep context visible while the 3D view is unobstructed.
> 3. ✅ **Back to start** — "← Solsystemet" in the context strip clears the active body.
> 4. ✅ **XP always visible** — XP pill in the top strip, tappable to open Progress panel.
>
> **If something needs fixing:**
> - FAB z-index conflict with bottom nav → adjust `z-[15]` up or down
> - Strip overlaps scene content → increase `pt-10` in HUD.tsx outer div
> - Mini card overlaps FAB (both at `bottom-[5.5rem]`) → offset mini card to `bottom-[calc(5.5rem+env(safe-area-inset-bottom))]` and FAB slightly higher, e.g. `bottom-[calc(9rem+env(safe-area-inset-bottom))]`
>
> **Working directory:** `C:\code\projectHelioTrip-sprint1` · **Branch:** `sprint1-ux-sprint1`  
> **Spec:** `docs/superpowers/specs/2026-04-30-mobile-discoverability-design.md`
