# Gravity Drop Lab Layout Redesign

## Problem

- **Mobile**: `GravityDropLab` inuti `LabOverlay` orsakar vertikal scroll. Användaren ser bara övre halvan av spelet och måste scrolla för att hitta "Släpp"-knappen. Det finns dessutom onödigt tomt utrymme mellan HUD-topbaren och overlayn.
- **Desktop**: Panelen sträcker sig `inset-x-4` (nästan hela bredden), vilket gör spelet visuellt utdraget och olämpligt för stora skärmar.

## Mål

- **Ingen scroll någonsin** i gravitationslabbet — allt innehåll ska synas direkt.
- **Mobil**: Utnyttja skärmytan maximalt, komprimera pickers och resultat.
- **Tablet**: Oförändrat — redan bra.
- **Desktop**: Tight, centrerad panel med maxbredd.

## Lösning (Approach A)

### Mobil (`compact` via `useResponsiveLayout`)

- **`LabOverlay` position**: Ändra från `top-16 bottom-20` till `top-8 bottom-0` (eller `bottom-8` om bottom-HUD ska synas). Overlayn startar direkt under topbaren.
- **Ta bort `overflow-y-auto`**: Ingen scroll tillåts.
- **Objektpicker**: Behålls som flex-rad men minskad padding/font-size.
- **Planetpicker**: Ändra från `flex-wrap` till `flex-nowrap overflow-x-auto` — en horisontellt scrollbar rad som inte tar vertikalt utrymme.
- **Canvas**: Öka höjden. Använd dynamisk höjd baserat på viewport (t.ex. `h-[50vh]` eller liknande), inte fast `300px`.
- **Resultatkort**: Efter impact, visa resultatet i en kompakt en-rads-layout istället för ett helt kort med separata rader. Alternativt: behåll kortet men med mindre padding och kompaktare typografi.
- **Action-knappar**: "Släpp" + "Återställ" visas alltid synligt.

### Desktop (`expanded`)

- **`LabOverlay` bredd**: Ändra från `inset-x-4` till `w-full max-w-md mx-auto` (alternativt `max-w-lg` vid behov).
- **Vertikal position**: Behåll `top-16 bottom-20`.
- **Canvas**: Behåll fast höjd (`300px` eller motsvarande) — lagom inom tight panel.
- **Innehåll**: Samma layout som tablet, men koncentrerad inom maxbredd.

### Tablet (`medium`)

- Ingen förändring. Nuvarande layout fungerar bra.

## Implementation

### Fil: `LabOverlay.tsx`

- Utöka `LabOverlay`-komponenten att lyssna på `useResponsiveLayout()`.
- För mobilt (`compact`): `fixed top-8 left-0 right-0 bottom-0`, ingen `overflow-y-auto`.
- För desktop (`expanded`): `fixed top-16 left-0 right-0 bottom-20 max-w-md mx-auto`.

### Fil: `GravityDropLab.tsx`

- Lyssna på `layoutTier` från `useResponsiveLayout()`.
- **Mobil**: Planet-picker med `flex-nowrap overflow-x-auto`. Minska padding och font-size globalt.
- **Canvas-höjd**: Villkorad — `h-[55vh]` på mobil, `h-[300px]` på desktop.
- **Resultatkort**: Villkorad rendering — kompakt rad på mobil, fullt kort på desktop.

### Fil: `GravityDropLab.module.css`

- Lägg till `.dropCanvasCompact` med större relativ höjd.
- Behåll nuvarande `.dropCanvas` för desktop.

## Testning

- Verifiera på mobilviewport (~375px bred): inga scrollbars, hela spelet synligt.
- Verifiera på tablet (~768px): oförändrat beteende.
- Verifiera på desktop (~1440px+): tight centrerad panel, inga scrollbars.

## Kriterier för framgång

1. [ ] Mobil: Ingen vertikal scroll i gravitationslabbet.
2. [ ] Mobil: "Släpp"-knappen är alltid synlig utan scroll.
3. [ ] Mobil: Canvas tar upp mer än 50% av skärmhöjden.
4. [ ] Desktop: Panelbredd max `448px` (max-w-md) och centrerad.
5. [ ] Tablet: Oförändrad layout.
