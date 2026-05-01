Here is a draft plan to refine:

# Plan: HelioTrip Mobile Redesign

## Context

Det nuvarande mobilgränssnittet har en överfull footer (GameModeSwitcher + FlightModeToggle + AboutDialog + TimePlaybackControls klämda i en rad), osynlig lägesväxlare utan ikoner, och paneler som flyter mitt i 3D-scenen. Redesignen ersätter det med ett "Mission Control"-mönster: 3D-scenen äger ytan, allt UI glider upp från botten via en bottom nav + bottom sheets. Desktop-layouten förblir oförändrad.

---

## Nya komponenter att skapa

### 1. `src/components/BottomSheet.tsx`

Återanvändbar slide-up sheet med backdrop-overlay. Hanterar open/close via prop, CSS transform-animation (`translate-y`), och stänger vid klick på backdrop.

```
Props: open, onClose, children, title?
Klasser: fixed inset-x-0 bottom-0 z-20, rounded-t-3xl border-t border-white/10
         bg-black/60 backdrop-blur-xl, transform transition-transform
Backdrop: fixed inset-0 bg-black/30 backdrop-blur-sm
```

### 2. `src/components/MobileBottomNav.tsx`

Ersätter hela nuvarande footer på mobil. Fem flikar med ikon + etiketttext.

```
Tabs: Utforska (Globe2) | Stjärnor (Stars) | Lär (BookOpen) | Utmaning (Trophy) | Mer (MoreHorizontal)
Container: fixed inset-x-0 bottom-0 pointer-events-auto
           flex items-center justify-around
           border-t border-white/10 bg-black/60 backdrop-blur-xl
           pb-[env(safe-area-inset-bottom)]
Active tab: text-white + liten indikator-dot under ikonen (h-1 w-1 rounded-full bg-white)
Inactive:   text-white/45 hover:text-white/70
```

Klick på en tab:

- Öppnar/stänger motsvarande BottomSheet
- "Lär"-tab sätter även gameMode → "learn"
- "Utmaning"-tab sätter gameMode → "challenge"
- "Utforska"/"Stjärnor" sätter gameMode → "explore"

### 3. `src/components/MobileTimePill.tsx`

Kompakt ersättare för den fullbreda `TimePlaybackControls` på mobil. Visas som en liten pill ovanför bottom nav.

```
Collapsed (default):
  flex items-center gap-2 rounded-full border border-white/10
  bg-black/40 backdrop-blur-md px-3 py-1.5 text-xs text-white/70
  Innehåll: [Play/Pause-ikon] [Hastighets-label, t.ex. "3×"]

Expanded (tap):
  Öppnar ett litet sheet (BottomSheet med låg höjd) med full TimePlaybackControls
```

---

## Filer att modifiera

### `src/components/HUD.tsx`

Kärnändringen. Mobilgrenar separeras tydligare.

**Desktop** (`!mobileLayout`): oförändrad — samma paneler i sidorna som nu.

**Mobil** (`mobileLayout`):

- Ta bort: `CollapsibleHudPanel` för planet mitt på skärmen
- Ta bort: `CollapsibleHudPanel` för mission tray
- Ta bort: `NavigationAccordion` i botten-vänster
- Ta bort: hela befintliga `<footer>` (GameModeSwitcher + FlightModeToggle + TimePlaybackControls)
- Lägg till: `<MobileTimePill />` (positionerad ovanför bottom nav)
- Lägg till: `<MobileBottomNav />` (fast längst ner)
- Lägg till: separata `<BottomSheet>`-instanser för varje tab:
  - Explore-sheet → `<PlanetSelector />`
  - Stars-sheet → konstellationslistan (extraherad från `NavigationAccordion`)
  - Learn-sheet → `<MissionCard />`
  - Challenge-sheet → `<ProgressPanel />`
  - More-sheet → `<FlightModeToggle />`, `<LanguageToggle />`, `<AboutDialog />`
- Planetpanel: när `activeBody !== null` öppnas automatiskt en `<BottomSheet>` med `<PlanetPanel />`

### `src/components/NavigationAccordion.tsx`

Konstellationslogiken (state, items, toggle) extraheras till en ny `ConstellationList`-komponent eller rendertas direkt i stars-sheeten. `NavigationAccordion` behålls för desktop men används inte i mobil.

### `src/components/GameModeSwitcher.tsx`

Används oförändrad på desktop. På mobil tas den bort ur footern — lägesbytet sker istället via `MobileBottomNav`-tabklick.

---

## Implementationsordning

**Steg 1 — BottomSheet** (isolerad ny komponent, inga sidoeffekter)
Bygg och verifiera animationen + backdrop i isolation.

**Steg 2 — MobileBottomNav** (ny komponent, kopplas till HUD)
Bygg tabbar med ikoner. Kontrollera state med `openTab: string | null` lokalt i HUD.

**Steg 3 — HUD.tsx mobilgren** (kärnrefactoring)
Koppla ihop BottomSheet + MobileBottomNav i HUD. Kontrollera att desktop är opåverkad.

**Steg 4 — MobileTimePill** (ny komponent)
Komprimera tidskontrollerna till pill + expanderbar sheet.

**Steg 5 — Planetpanel som sheet** (beteendeändring)
`activeBody`-ändringar på mobil öppnar planet-sheeten automatiskt, stänger vid `activeBody = null`.

**Steg 6 — Visuell polish** (sista)

- Gradient-header i planet-sheeten med kroppens färg
- Lite större planet-dots (`h-3 w-3` istället för `h-2.5 w-2.5`)
- Tab-ikoner med `h-5 w-5`

---

## Vad som INTE ändras

- All desktoplayout i `HUD.tsx`
- `CollapsibleHudPanel`, `NavigationAccordion`, `GameModeSwitcher`, `TimePlaybackControls` — används oförändrade på desktop
- Ingen logik i store, hooks eller 3D-scenen

---

## Verifiering

1. Starta dev-servern: `npm run dev`
2. Sätt webbläsaren i mobil-viewport (< 640 px)
3. Kontrollera: bottom nav synlig, 3D-scene tar full yta
4. Tappa planet → planet-sheet glider upp
5. Byt tab → rätt sheet öppnas, gameMode uppdateras
6. Sätt till desktop-viewport → gamla layouten intakt
7. Kör `npm run lint && npm run test:unit`
