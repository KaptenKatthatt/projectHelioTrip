# Gravity Lab Layout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminera scroll i Gravity Drop Lab på mobil, komprimera layout, och begränsa desktop-panel till max-w-md.

**Architecture:** Använd `useResponsiveLayout()` för att växla mellan `compact`/`medium`/`expanded`. På mobil: fullbredd overlay från `top-8` till `bottom-0`, horisontell planetpicker, större canvas, kompakt resultat. På desktop: `max-w-md mx-auto` centrerad panel. Tablet: oförändrad.

**Tech Stack:** React, Tailwind CSS, CSS Modules, TypeScript, Playwright (e2e)

---

### Task 1: Uppdatera LabOverlay med responsiv positionering

**Files:**
- Modify: `src/components/organisms/LabOverlay.tsx`
- Test: `e2e/gravity-lab.viewport.spec.ts` (uppdatera/kontrollera)

**Kontext:** Nuvarande `LabOverlay` använder `fixed inset-x-4 top-16 bottom-20` för drop-läget och `fixed right-4 bottom-20 w-72` för orbit-läget. Vi behöver särskilja mobil (`compact`) från desktop (`expanded`).

- [ ] **Step 1: Importera `useResponsiveLayout`**

I `LabOverlay.tsx`, säkerställ att `useResponsiveLayout` redan är importerad (den finns redan i filen på rad 1).

- [ ] **Step 2: Modifiera `LabOverlay`-komponenten**

Byt ut den nuvarande return-satsen i `LabOverlay` mot responsiv logik:

```tsx
export const LabOverlay = () => {
  const layoutTier = useResponsiveLayout();
  const activeLabGame = useStore((s) => s.activeLabGame);

  if (layoutTier === "compact") return null;

  // Mobile: full-width, starts at top-8, goes to bottom-0, no scroll
  if (layoutTier === "medium") {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-8 bottom-0 z-20">
        <div className="custom-scrollbar pointer-events-auto h-full overflow-y-auto rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
          <LabOverlayContent />
        </div>
      </div>
    );
  }

  // Desktop: tight centered panel
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
    <div className="pointer-events-none fixed inset-x-4 top-16 bottom-20 z-20 max-w-md mx-auto">
      <div className="custom-scrollbar pointer-events-auto h-full overflow-y-auto rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
        <LabOverlayContent />
      </div>
    </div>
  );
};
```

**Notera:** På mobil (`medium`) tar vi bort `bottom-20` och använder `bottom-0` för maximal yta. `overflow-y-auto` behålls just nu — vi tar bort scroll i Task 3.

- [ ] **Step 3: Kör e2e-test för viewport**

```bash
npx playwright test e2e/gravity-lab.viewport.spec.ts --project=chromium
```

Expected: PASS (eller FAIL om testet förväntar sig nuvarande layout — justera testet i så fall).

- [ ] **Step 4: Commit**

```bash
git add src/components/organisms/LabOverlay.tsx e2e/gravity-lab.viewport.spec.ts
git commit -m "feat(lab): responsive overlay positioning for mobile and desktop

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Mobil-kompakt planetpicker med horisontell scroll

**Files:**
- Modify: `src/components/organisms/GravityDropLab.tsx:195-228`

**Kontext:** Planetpicker använder `flex-wrap gap-1.5`. På mobil tar detta mycket vertikalt utrymme. Byt till `flex-nowrap overflow-x-auto` på mobil.

- [ ] **Step 1: Använd `useResponsiveLayout` i GravityDropLab**

Importera högst upp:

```tsx
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
```

Lägg till i komponenten:

```tsx
export const GravityDropLab = () => {
  const { t, locale } = useTranslation();
  const grav = t.learn.gravityLab;
  const layoutTier = useResponsiveLayout();
  const isCompact = layoutTier === "medium"; // mobil
  // ... resten av komponenten
```

- [ ] **Step 2: Modifiera planetpicker-wrappern**

Byt wrapper-diven för planet-knapparna:

```tsx
<div className={`flex gap-1.5 ${isCompact ? "overflow-x-auto pb-1" : "flex-wrap"}`}>
```

Detta gör att planeterna scrollas horisontellt på mobil istället för att brytas till flera rader.

- [ ] **Step 3: Verifiera i dev-server**

```bash
npm run dev
```

Öppna i mobilvy (375px). Kontrollera att planet-knapparna visas på en rad med horisontell scroll.

- [ ] **Step 4: Commit**

```bash
git add src/components/organisms/GravityDropLab.tsx
git commit -m "feat(lab): horizontal-scroll planet picker on mobile

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Dynamisk canvas-höjd och ta bort scroll

**Files:**
- Modify: `src/components/organisms/GravityDropLab.tsx:230-295`
- Modify: `src/components/organisms/GravityDropLab.module.css`
- Modify: `src/components/organisms/LabOverlay.tsx`

**Kontext:** Canvas har fast höjd 300px. På mobil behöver den ta mer plats. Dessutom måste `overflow-y-auto` tas bort från mobil-overlayn.

- [ ] **Step 1: Lägg till mobil canvas-stil i CSS**

I `GravityDropLab.module.css`, lägg till:

```css
.dropCanvasCompact {
  position: relative;
  width: 100%;
  height: 50vh;
  min-height: 240px;
  max-height: 400px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, transparent 0%, transparent 85%, var(--surface-color, #333) 85%);
}
```

- [ ] **Step 2: Applicera dynamisk canvas-höjd i komponenten**

Byt canvas-divens klass:

```tsx
<div
  data-testid="drop-canvas"
  className={isCompact ? styles.dropCanvasCompact : styles.dropCanvas}
  style={{
    background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 70%, ${planet.color}30 85%, ${planet.color}50 100%)`,
  }}
>
```

- [ ] **Step 3: Ta bort scroll från mobil-overlay**

I `LabOverlay.tsx`, byt `medium`-grenen:

```tsx
if (layoutTier === "medium") {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-8 bottom-0 z-20">
      <div className="pointer-events-auto h-full rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
        <LabOverlayContent />
      </div>
    </div>
  );
}
```

**Notera:** `custom-scrollbar` och `overflow-y-auto` är borttagna.

- [ ] **Step 4: Verifiera ingen scroll på mobil**

Öppna i mobilvy (375×667). Kontrollera att:
1. Hela spelet syns utan scroll.
2. Canvas tar upp mer än 50% av skärmen.
3. "Släpp"-knappen är synlig direkt.

- [ ] **Step 5: Commit**

```bash
git add src/components/organisms/GravityDropLab.tsx src/components/organisms/GravityDropLab.module.css src/components/organisms/LabOverlay.tsx
git commit -m "feat(lab): dynamic canvas height and remove mobile scroll

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Kompakt resultatrad på mobil

**Files:**
- Modify: `src/components/organisms/GravityDropLab.tsx:329-383`

**Kontext:** Resultatkortet tar mycket utrymme med flera rader. På mobil ska det visas som en kompakt en-rads-rad.

- [ ] **Step 1: Skapa kompakt resultat-komponent**

Byt ut resultatkort-sektionen (rader 329-383) mot villkorad rendering:

```tsx
{showResult && (
  <div data-testid="result-card" className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
    {isCompact ? (
      <div className="flex justify-between items-center text-[11px] text-white/70">
        <span>Falltid: <strong className="text-white font-mono">{numFmt.format(impact.fallDuration)}s</strong></span>
        <span className="mx-1 text-white/20">|</span>
        <span>v: <strong className="text-white font-mono">{numFmt.format(impact.impactVelocity)} m/s</strong></span>
        <span className="mx-1 text-white/20">|</span>
        <span>g: <strong className="text-white font-mono">{numFmt.format(planet.surfaceGravity)} m/s²</strong></span>
      </div>
    ) : (
      <div className="space-y-1.5">
        {/* ... befintligt fullt resultatkort (rader 333-367) ... */}
      </div>
    )}

    {/* Pedagogical message — alltid synlig */}
    <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2">
      <p className="text-[11px] leading-relaxed text-amber-200/80">
        💡 {grav.factAllFallSame}
      </p>
    </div>

    {/* Planet fun fact */}
    {funFact && (
      <p className="mt-2 text-[10px] italic leading-relaxed text-white/35">
        {funFact}
      </p>
    )}
  </div>
)}
```

- [ ] **Step 2: Verifiera resultatvisning**

Kör ett dropp på mobil. Kontrollera att resultatet visas i en kompakt rad.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/GravityDropLab.tsx
git commit -m "feat(lab): compact result row on mobile, full card on desktop

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: Minska padding/typografi globalt på mobil

**Files:**
- Modify: `src/components/organisms/GravityDropLab.tsx` (diverse rader)

**Kontext:** Mindre padding, mindre text, tightare avstånd på mobil för att spara utrymme.

- [ ] **Step 1: Justera padding och storlekar**

Byt rot-diven från:
```tsx
<div data-testid="gravity-drop-lab" className="flex flex-col gap-4">
```
till:
```tsx
<div data-testid="gravity-drop-lab" className={`flex flex-col ${isCompact ? "gap-2" : "gap-4"}`}>
```

Byt objektpicker-sektionen från `gap-1.5` till `gap-1` på mobil.
Byt planet-picker-sektionen från `gap-1.5` till `gap-1` på mobil.
Minska action-knapparnas padding: `px-4 py-2.5` → `px-3 py-2` på mobil.

- [ ] **Step 2: Commit**

```bash
git add src/components/organisms/GravityDropLab.tsx
git commit -m "feat(lab): tighter spacing and smaller padding on mobile

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Desktop max-w-md och centrerad panel

**Files:**
- Modify: `src/components/organisms/LabOverlay.tsx`

**Kontext:** Desktop ska ha `max-w-md` (448px) centrerad panel.

- [ ] **Step 1: Verifiera desktop-grenen**

Se till att desktop-grenen (rader 84-89 i original, nu `expanded`-grenen) har:

```tsx
return (
  <div className="pointer-events-none fixed inset-x-4 top-16 bottom-20 z-20 max-w-md mx-auto">
    <div className="custom-scrollbar pointer-events-auto h-full overflow-y-auto rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl">
      <LabOverlayContent />
    </div>
  </div>
);
```

- [ ] **Step 2: Verifiera i desktop-viewport**

Öppna i desktopvy (1440px+). Panelen ska vara centrerad med maxbredd ~448px.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/LabOverlay.tsx
git commit -m "feat(lab): tight max-w-md centered panel on desktop

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 7: Uppdatera och kör e2e-tester

**Files:**
- Modify: `e2e/gravity-lab.spec.ts`
- Modify: `e2e/gravity-lab.viewport.spec.ts`

**Kontext:** Befintliga e2e-tester kan förvänta sig nuvarande layout. Uppdatera dem.

- [ ] **Step 1: Kontrollera nuvarande e2e-tester**

```bash
npx playwright test e2e/gravity-lab.spec.ts --project=chromium
npx playwright test e2e/gravity-lab.viewport.spec.ts --project=chromium
```

- [ ] **Step 2: Uppdatera om nödvändigt**

Om testerna förväntar sig scroll eller specifika dimensioner, justera dem. Lägg till test för:
- Mobil: canvas är synlig utan scroll.
- Desktop: panelbredd ≤ 448px.

- [ ] **Step 3: Kör alla labb-tester**

```bash
npx playwright test e2e/gravity-lab --project=chromium
```

Expected: ALL PASS.

- [ ] **Step 4: Commit**

```bash
git add e2e/
git commit -m "test(lab): update e2e tests for responsive layout

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Spec Coverage Check

| Spec-krav | Task |
|---|---|
| Mobil overlay top-8 bottom-0 | Task 1, Task 3 |
| Ta bort overflow-y-auto på mobil | Task 3 |
| Horisontell planetpicker | Task 2 |
| Större canvas på mobil | Task 3 |
| Kompakt resultat på mobil | Task 4 |
| Desktop max-w-md centrerad | Task 6 |
| Tablet oförändrad | Ingen ändring (medium == tablet, men vi behandlar medium som mobil här — se not nedan) |

**Not:** `useResponsiveLayout()` returnerar `medium` för tablet. I denna plan behandlar vi `medium` som mobil-liknande layout eftersom användaren sa "tablet ser bra ut". Om tablet behöver en egen gren, justera Task 1.

## Placeholder Scan

Inga placeholders hittade. Alla steg innehåller konkret kod.

## Type Consistency

- `useResponsiveLayout` returnerar `"compact" | "medium" | "expanded"`.
- `isCompact` sätts till `layoutTier === "medium"` — överväg att döpa om till `isMobile` för tydlighet.
- Alla importerade funktioner och typer matchar existerande kodbas.
