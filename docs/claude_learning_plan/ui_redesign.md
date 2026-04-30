# HelioTrip — UI Redesign Plan
## Immersive Space Explorer + Pedagogical Learning Platform

_Denna plan ersätter "Mobile redesign plan by Claude Code.md" och "Desktop and iPad redesign plan.md"._
_Framtagen 2026-04-28, med läroplanen i docs/claude_learning_plan/ som grund._

---

## 1. Designfilosofi

### Grundprincip: "Rymden är hjälten"

All UI är ett tunt glasskikt som flödar ovanpå det levande solsystemet. Varje panel som läggs till måste förtjäna sin plats genom att tillföra något eleven inte kan läsa av scenen direkt.

| Princip | Vad det innebär konkret |
|---|---|
| **Osynlig tills behövd** | UI dyker upp vid interaktion, inte som permanent väggmatta |
| **Glas, inte plank** | `backdrop-blur` + `bg-black/40` — aldrig opaka block |
| **Rymd andas** | Minst 40 % av skärmen är alltid 3D-scen, aldrig täckt av UI |
| **Läge sätter ton** | Tre visuella lägen med varsitt accentfärgstema |

### Tre lägen — tre visuella identiteter

| Läge | Accentfärg | Känsla | UI-densitet |
|---|---|---|---|
| **Utforska** | Vit/neutral `white/70` | Stilla, meditativt | Minimal — bara nav |
| **Lär** | Cyan `cyan-300` | Nyfiken, öppen, varm | Faktakort + narrativ synliga |
| **Uppdrag** | Smaragd `emerald-300` | Fokuserad, målinriktad | Uppdragsstack + progress |

En diskret **lägesindikator-rand** (2 px, `opacity-60`) längs skärmens överkant ger alltid en passiv signal om aktivt läge utan att ta plats.

---

## 2. Responsiva zoner

Tre beteendenivåer som matchar det befintliga hook-systemet (`useResponsiveLayout`):

```
compact   < 640 px    → telefon stående
medium    640–1279 px → surfplatta (stående + liggande), liten laptop
expanded  ≥ 1280 px   → desktop, stor laptop
```

---

## 3. Layout: Compact (telefon)

### Principskiss

```
┌─────────────────────────────────┐
│ HelioTrip    [Title: 🔭 Stjärntittare 340 XP] │  ← TopBar
│                                 │
│                                 │
│         3D-scen                 │
│         (full skärm)            │
│                                 │
│                                 │
│  [⏱ 3×  ▶]      [lägesrand]   │  ← TimePill (floating)
├─────────────────────────────────┤
│ 🔭 Utforska │ ⭐ Lär │ 🏆 Uppdrag │  ← BottomNav (5 tabs)
│ 🌟 Stjärnor │          ⋯ Mer  │
└─────────────────────────────────┘
```

### TopBar

- Vänster: `HelioTrip` logotyp (liten, diskret)
- Höger: `XpBadge` — visas **bara i Lär och Uppdrag**, döljs i Utforska
  - Format: `🔭 Stjärntittare  340 XP`
  - Glyser svagt när XP nyss ökat (en-sekunds pulse-animation)
- **Lägesindikator-rand**: 2 px horisontell linje direkt under hela headern, accentfärgad
  - Utforska: ingen rand (transparent)
  - Lär: `bg-cyan-400/50`
  - Uppdrag: `bg-emerald-400/50`
  - Övergång: 400 ms fade vid lägesbyte

### BottomNav

5 tabs med ikon + etiketttext, fast längst ner (`fixed bottom-0`), safe-area-aware.

| Tab | Ikon | Effekt |
|---|---|---|
| Utforska | `Globe2` | `gameMode → explore`, stänger aktiv sheet |
| Stjärnor | `Stars` | `gameMode → explore` + öppnar stjärnbildssheet |
| Lär | `BookOpen` | `gameMode → learn` + öppnar lärsheet |
| Uppdrag | `Trophy` | `gameMode → challenge` + öppnar uppdragssheet |
| Mer | `MoreHorizontal` | Öppnar inställningssheet |

Aktiv tab: `text-white` + 3 px färgad punkt under (matchad mot lägesaccent).
Inaktiv tab: `text-white/45`.

### TimePill (flytande ovanför BottomNav)

Liten pill med `▶ 3×` som expanderar till full `TimePlaybackControls` via BottomSheet vid tryck.
Position: `fixed bottom-[5.5rem] right-4` — aldrig i vägen för scenen.

### BottomSheets (kontextberoende)

Alla paneler på mobil lever i BottomSheets — ingenting flödar fritt ovanpå scenen.

**Sheet: Planet-info**
- Triggas automatiskt när `activeBody` sätts (efter framkomst)
- Header: kroppens färgton som gradientband + `[● Färgpunkt] Planetnamn`
- Innehåll: tabbad vy — **Fakta** | **Lär dig mer**
- "Fakta"-fliken: befintlig `PlanetPanel`-data (avstånd, omloppstid, etc.)
- "Lär dig mer"-fliken: `FactCardDeck` — scrollbar lista med 4 faktakort
- Varje faktakort har en "Testa dig själv"-knapp som triggar quiz

**Sheet: Lär**
- Aktivt faktakort i fokus (om besökt planet)
- Annars: listar tillgängliga lärmoduler
- Aktiv äventyrsmissions-narrativ visas överst som `NarrativeMessage`

**Sheet: Uppdrag**
- `MissionCard` + `ProgressPanel` med XP-bar
- Knapp: "Välj uppdrag" om inget aktivt

**Sheet: Stjärnbilder**
- `ConstellationList` + stjärnbildens berättelsekort (`ConstellationStoryCard`) om vald

**Sheet: Mer**
- `FlightModeToggle` + `LanguageToggle` + `LevelToggle` + `AboutDialog`

### Quiz på mobil

Quiz visas **inte** som BottomSheet — det är ett **centrerat modal overlay** med scrim.
Anledning: spelaren ska fokusera på frågan, inte scrolla eller interagera med bakgrunden.

```
Stil: fixed inset-x-4 top-[20%] z-40
      rounded-2xl border border-white/15
      bg-black/85 backdrop-blur-xl p-5
```

Scrim: `fixed inset-0 bg-black/50 z-30`.

---

## 4. Layout: Medium (surfplatta stående + liggande, liten laptop)

### Stående (surfplatta)

Använder exakt samma BottomNav-mönster som mobil, men:
- Sheets är bredare: `max-w-lg mx-auto`
- Faktakort visas 2 per rad (CSS grid 2 columns)
- Quiz-modal är bredare: `max-w-md mx-auto`

### Liggande surfplatta (≥ 768 px, `aspect-ratio > 1.2`)

Byter till en hybrid: sidrail + bottom pill.

```
┌──────────┬─────────────────────────────┐
│ LEFT     │                             │
│ RAIL     │    3D-scen                  │
│ 220px    │                             │
│          │                             │
│ NavTree  │                             │
│          │          [planet-panel      │
│          │           floating right]   │
├──────────┴─────────────────────────────┤
│   [⏱ TimePill] [Mode] [Flight] [Mer]  │
└─────────────────────────────────────────┘
```

Planet-info flödar som panel till höger om scenen (inte BottomSheet).

---

## 5. Layout: Expanded (desktop)

### Principskiss

```
┌────────────────────────────────────────────────────────────┐
│ HelioTrip                        [🔭 Rymdutforskare 340XP] │  TopBar
│ [lägesrand — cyan/grön/vit 2px full bredd]                 │
├──────────┬─────────────────────────────┬───────────────────┤
│          │                             │                   │
│ VÄNSTER  │                             │  HÖGER            │
│ RAIL     │    3D-scen                  │  KOLUMN           │
│ 240px    │    (tar resterande utrymme) │  320px            │
│          │                             │                   │
│ Planet-  │                             │  PlanetPanel      │
│ lista    │                             │  (tabbad)         │
│    +     │                             │                   │
│ Mode-    │                             │  MissionCard      │
│ specific │                             │  + Narrativ       │
│ content  │                             │                   │
│          │                             │  ProgressPanel    │
│          │                             │  + XP-bar         │
│          │                             │  + Titel          │
├──────────┴─────────────────────────────┴───────────────────┤
│  ←    [TimePlaybackControls]  [Mode] [Flight] [Om]     →  │  BottomPill
└────────────────────────────────────────────────────────────┘
```

### Vänster rail (240 px fast bredd)

Innehåll beroende på `gameMode`:

**Explore-läge:**
```
Planeter
  ● Solen
  ● Merkurius
  ● Venus
  [...]
─────────────
Stjärnbilder
  ✦ Orion
  ✦ Karlavagnen
  [...]
```

**Lär-läge:**
```
Lärmoduler
  ✅ Solsystemsrundtur
  ▶ Vattenjakten       ← aktiv, med framstegsbar
    Steg 2 av 5
  🔒 Gravitationsslingans...
─────────────
Snabblänkar
  ← Tillbaka till planeter
```

**Uppdragsläge:**
```
Uppdrag
  ▶ Jupiters månar
    ● Io ✅  ● Europa ✅  ● Ganymedes ○
─────────────
Alla uppdrag
  [lista]
```

### Höger kolumn (320 px fast bredd)

Vertikal stack, scrollbar. Varje sektion är ett `CollapsibleHudPanel`.

1. **ProgressPanel (utökat)** — alltid synlig överst
   - Aktuell titel med ikon (t.ex. `🔭 Rymdutforskare`)
   - XP-bar: `bg-emerald-500/30` progress mot nästa titel
   - Siffra: `340 / 600 XP`

2. **PlanetPanel (tabbad)** — visas när `activeBody !== null`
   - Tab 1: **Fakta** — befintlig data
   - Tab 2: **Lär dig mer** — `FactCardDeck` (2×2 grid)
   - Tab 3: **Jämför storlek** — `ScaleComparison` (planritning, SVG)

3. **MissionCard (med narrativ)** — visas i Lär/Uppdrag-läge
   - Överst: `NarrativeMessage` (karaktärsbubbla, amber-accent)
   - Sedan: befintlig steglista + progress

### BottomPill (centered, floating)

```
rounded-full bg-black/60 backdrop-blur-xl border border-white/10
fixed bottom-6 left-1/2 -translate-x-1/2
flex items-center gap-3 px-4 py-2
```

Innehåll: `TimePlaybackControls` | divider | `GameModeSwitcher` | `FlightModeToggle` | `AboutDialog`

Lägesaccent: pillens border-färg växlar med `gameMode` — `border-cyan-300/30` i Lär, `border-emerald-300/30` i Uppdrag.

### Quiz på desktop

Positioneras som ett flytande kort till höger om scenen, utan scrim, så spelaren kan se planeten de svarar på.

```
position: fixed right-[344px] top-[30%]  (strax vänster om högerkolumnen)
max-width: 380px
rounded-2xl border border-white/15 bg-black/75 backdrop-blur-xl p-5
```

---

## 6. Komponentspec — nya komponenter

### `XpBadge.tsx`

Visas **enbart när `gameMode !== 'explore'`** — döljs helt i Utforska-läget.

```
Compact (mobil/medium top bar):
  pill-form, rounded-full, border border-white/10, bg-black/40, px-2.5 py-1
  Innehåll: [ikon] [titel] [XP-tal]
  Animation: "glow" pulse i 1s när XP ökar (emerald shadow)
  Visas: gameMode === 'learn' || gameMode === 'challenge'

Full (desktop right column, i ProgressPanel):
  Ingen pill — titel som rubrik + progress-bar nedanför
  bar: h-1.5 rounded-full bg-white/10, fyllning bg-emerald-400/70
  text: "340 / 600 XP till Astronomiassistent"
  Visas: alltid i ProgressPanel (som bara visas i Lär/Uppdrag)
```

### `FactCard.tsx`

```
Container:
  rounded-2xl border bg-black/30 backdrop-blur-sm p-3.5
  border: border-white/10 i default, border-cyan-300/25 i Learn-läge

Header:
  flex items-center gap-2
  [emoji, text-xl] [titel, text-sm font-semibold text-white]
  [nivåpunkt: h-2 w-2 rounded-full, grön=middle, blå=upper]

Body:
  mt-2 text-xs text-white/75 leading-relaxed

Footer:
  mt-3 flex justify-end
  "Testa dig själv →" — liten text-knapp, text-cyan-300/80 hover:text-cyan-300
```

### `FactCardDeck.tsx`

```
Desktop (2 per rad): grid grid-cols-2 gap-2
Mobile (1 per rad):  flex flex-col gap-2
Max 4 kort synliga utan scroll
LevelToggle ovanför filtrar vilka som visas
```

### `LevelToggle.tsx`

```
Kompakt toggle: rounded-lg border border-white/10 flex
Alternativ: [Mellanstadiet] [Högstadiet]
Aktiv: bg-white/10 text-white
Inaktiv: text-white/50
Sparas i store: learningLevel: 'middle' | 'upper'
```

### `QuizCard.tsx`

```
Header:
  [Fråga, text-sm font-medium leading-snug text-white]
  [Nivåpunkt]

Options (multiple-choice):
  flex flex-col gap-2
  Varje alternativ: button, rounded-xl border border-white/10 bg-white/5
    px-3 py-2 text-sm text-left text-white/80
    hover: bg-white/10
    rätt (efter svar): bg-emerald-300/15 border-emerald-300/30 text-emerald-100
    fel: bg-red-400/10 border-red-400/25 text-red-200

True/False:
  flex gap-3
  Två knappar: "Sant" / "Falskt" — bredare, centrerade

Fill-in:
  input, rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white
  placeholder: text-white/30

Hint (visas efter fel svar):
  mt-3 rounded-xl bg-amber-300/10 border border-amber-300/20 px-3 py-2
  text-xs text-amber-200

Förklaring (visas efter rätt svar eller 3:e försöket):
  mt-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2
  text-xs text-white/70

Stjärnfeedback:
  flex gap-1 mt-3
  Varje stjärna: text-amber-300 (fylld) / text-white/20 (tom)
  "3 stjärnor! +30 XP" — text-emerald-300 text-sm font-medium
```

### `NarrativeMessage.tsx`

```
Karaktärsbubbla-stil:
  flex items-start gap-2.5 rounded-2xl border border-amber-300/20
  bg-amber-300/5 p-3

Avatar:
  h-8 w-8 rounded-full bg-amber-300/20 border border-amber-300/30
  flex items-center justify-center text-base
  (emoji: 👩‍🚀 för Dr. Astra, 🤝 för kollegan)

Text:
  flex-1 text-xs text-amber-100/90 leading-relaxed italic

Avsändare:
  mt-1 text-[10px] font-medium text-amber-300/70 uppercase tracking-wide
```

### `ScaleComparison.tsx`

```
SVG-overlay med två proportionerliga cirklar
Bakgrund: bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10
Container: aspect-[16/9] max-h-48
Cirklar: ritas med radier beräknade från body.def.radius
Label: "1 300 Jupiters ryms i Solen" — text-sm text-white/70 text-center mt-2
Knappar: välj vilka två kroppar att jämföra
```

### `ConstellationStoryCard.tsx`

```
3 flikar: [Berättelse] [Hitta den] [Kul fakta]
Tabbar: border-b border-white/10, aktiv tab: border-b-2 border-white text-white
Innehåll: text-sm text-white/75 leading-relaxed
Säsong-badge: rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/55
```

---

## 7. Lägesspecifikt visuellt beteende

### Lär-läge (Learn mode)

- Lägesindikator-rand: `bg-cyan-400/50`
- BottomPill border: `border-cyan-300/30`
- Aktiv tab i BottomNav: `text-cyan-300` med cyan punkt
- FactCard borders: `border-cyan-300/25`
- "Testa dig själv"-knapp: `text-cyan-300`
- Vänster rail visar lärandevägar istället för planetlista

### Uppdragsläge (Challenge mode)

- Lägesindikator-rand: `bg-emerald-400/50`
- BottomPill border: `border-emerald-300/30`
- Aktiv tab: `text-emerald-300` med smaragdpunkt
- MissionCard framstegsbar: `bg-emerald-300/80` (befintlig)
- Stepmärkena: befintlig gröntdotsstil

### Utforska-läge (Explore mode)

- Ingen lägesindikator-rand (rent läge)
- Allt UI: standard `text-white/70` — neutralt
- Maximum scenexponeringen — minst UI

---

## 8. Animationer och övergångar

Håll det subtilt — rymden är lugn.

| Händelse | Animation |
|---|---|
| Sheet öppnar (mobil) | `translate-y 300ms ease-out` (befintlig `BottomSheet`) |
| Faktakort dyker upp | `fade-in + scale-in 200ms ease-out` |
| Quiz dyker upp | `fade-in 150ms` — snabbt, fokus |
| XP ökar | 1s `pulse`-glow på `XpBadge` |
| Ny titel | `AchievementToast`-liknande popup centrerat (3s) |
| Mode-byte | 400ms fade på lägesindikator-rand |
| Planet-sheet header | Färg-gradient fade in med kroppens färg |
| Quiz rätt svar | `bg-emerald` flash 300ms |
| Quiz fel svar | Subtil `shake` animation på den valda knappen (3px horisontellt) |

Alla animationer respekterar `prefers-reduced-motion`.

---

## 9. Typografisk hierarki (ny textinnehåll)

```
Faktakort-titel:     text-sm font-semibold text-white
Faktakort-brödtext:  text-xs text-white/75 leading-relaxed (ej font-mono)
Quiz-fråga:          text-sm font-medium text-white leading-snug
Quiz-alternativ:     text-sm text-white/80
Quiz-hint:           text-xs text-amber-200 italic
Quiz-förklaring:     text-xs text-white/70
Narrativ (Dr. Astra): text-xs text-amber-100/90 italic leading-relaxed
Titel (XP):          text-xs font-medium tracking-wide text-white/80
XP-siffra:           font-mono text-xs tabular-nums text-white
```

---

## 10. Nya i18n-nycklar (UI-strängar)

```typescript
t.learn.ui.factsTab          = "Fakta" / "Facts"
t.learn.ui.learnMoreTab      = "Lär dig mer" / "Learn More"
t.learn.ui.compareSize       = "Jämför storlek" / "Compare size"
t.learn.ui.testYourself      = "Testa dig själv →" / "Test yourself →"
t.learn.ui.levelMiddle       = "Mellanstadiet" / "Middle school"
t.learn.ui.levelUpper        = "Högstadiet" / "Upper school"
t.learn.ui.quizStars         = "{n} stjärnor! +{xp} XP" / "{n} stars! +{xp} XP"
t.learn.ui.quizHint          = "Tips:" / "Hint:"
t.learn.ui.newTitle          = "Ny titel upplåst!" / "New title unlocked!"
t.learn.ui.xpUntilNext       = "{xp} XP till {title}" / "{xp} XP until {title}"
t.learn.ui.narratorAstra     = "Dr. Astra" / "Dr. Astra"
t.learn.ui.narratorColleague = "Din kollega" / "Your colleague"
t.learn.ui.constellationStory   = "Berättelse" / "Story"
t.learn.ui.constellationFindIt  = "Hitta den" / "Find it"
t.learn.ui.constellationFunFact = "Kul fakta" / "Fun fact"
```

---

## 11. Store-tillägg

```typescript
// Tillägg till SimulationState i useStore.ts
learningLevel: 'middle' | 'upper';  // Default: 'middle'. Persistas.
xp: number;                          // Persistas
title: TitleId;                      // Beräknas från xp + completed missions
quizResults: Record<string, { stars: number; attempts: number }>; // Persistas
pendingQuizId: string | null;        // Transient — triggar QuizOverlay (modal)
activeLearningPath: string | null;   // Persistas
leftRailOpen: boolean;               // Desktop vänster rail, default false. Persistas.

// Tillägg till SimulationActions
setLearningLevel: (level: 'middle' | 'upper') => void;
awardXp: (amount: number) => void;
recordQuizResult: (quizId: string, stars: number) => void;
triggerQuiz: (quizId: string) => void;
dismissQuiz: () => void;
toggleLeftRail: () => void;
```

---

## 12. Nya filer att skapa

```
src/
  components/
    atoms/
      XpBadge.tsx               — XP + titel badge
      LevelToggle.tsx           — Mellanstadiet/Högstadiet
      NarrativeMessage.tsx      — Karaktärsbubbla
    molecules/
      FactCard.tsx              — Enskilt faktakort
      FactCardDeck.tsx          — Gridlayout av faktakort
      QuizCard.tsx              — Quizfråga med feedback
      ScaleComparison.tsx       — SVG-skalvisualiserare
      ConstellationStoryCard.tsx — Stjärnbildsberättelse
    organisms/
      QuizOverlay.tsx           — Global quiz-container (modal/floating)
      LearningRail.tsx          — Vänster rail i Lär-läge
  lib/
    learning/
      bodyContent.ts            — Faktakort-definitioner (se factcards.md)
      quiz.ts                   — Quizfråge-definitioner (se quiz.md)
      xp.ts                     — XP-logik + titelberäkning (se xp_titles.md)
      learningPaths.ts          — Moduler/lärandevägar
```

---

## 13. Befintliga filer att modifiera

| Fil | Ändring |
|---|---|
| `src/store/useStore.ts` | Lägg till: `learningLevel`, `xp`, `title`, `quizResults`, `pendingQuizId` |
| `src/lib/missions/types.ts` | Lägg till fält på `MissionStep`: `factCardId?`, `quizId?`, `narrativeKey?`; ny trigger: `quiz_answered` |
| `src/components/organisms/PlanetPanel.tsx` | Lägg till flöde med Fakta/Lär dig mer/Jämför-tabbar |
| `src/components/organisms/ProgressPanel.tsx` | Ersätt achievement-flaggor med XP-bar + titel (flaggor bevaras separat) |
| `src/components/organisms/MissionCard.tsx` | Lägg till `NarrativeMessage` ovanför steglistan |
| `src/components/templates/HUD.tsx` | Lägg till `QuizOverlay` + `LearningRail` i rätt layouttier |
| `src/components/templates/hud/HudTopBarRegion.tsx` | Lägg till `XpBadge` i höger sida |
| `src/components/templates/hud/HudControlRailRegion.tsx` | Refactoring till "BottomPill" med lägesaccent |
| `src/components/ConstellationViewControls.tsx` | Lägg till `ConstellationStoryCard` |
| `src/i18n/locales/sv.ts` + `en.ts` | Lägg till `t.learn.*` (se section 10) |

---

## 14. Implementationsordning (fas för fas)

### Fas 1 — Grund (prerequisite för allt annat)
1. Store-tillägg (learningLevel, xp, title, pendingQuizId)
2. `xp.ts` — XP-logik och titelberäkning
3. `LevelToggle.tsx` + koppla till store
4. `XpBadge.tsx` + lägg in i `HudTopBarRegion`
5. Lägesindikator-rand i HUD (2px band under TopBar)

### Fas 2 — Faktakort
6. `bodyContent.ts` — alla 72 faktakort (från factcards.md)
7. `FactCard.tsx` + `FactCardDeck.tsx`
8. `PlanetPanel.tsx` — lägg till tab-system
9. i18n: alla `t.learn.cards.*`-nycklar

### Fas 3 — Quiz
10. `quiz.ts` — alla 54 frågor (från quiz.md)
11. `QuizCard.tsx`
12. `QuizOverlay.tsx` — global container, läser `pendingQuizId` ur store
13. "Testa dig själv"-knapp i FactCard kopplas till `triggerQuiz()`
14. i18n: alla `t.learn.quiz.*`-nycklar

### Fas 4 — Äventyrsuppdrag
15. `MissionStep`-typuppdatering (`factCardId?`, `quizId?`, `narrativeKey?`, ny trigger `quiz_answered`)
16. `NarrativeMessage.tsx`
17. `MissionCard.tsx` — lägg till narrativ-yta
18. Lägg till `water_hunt` och `gravity_sling` i `missionDefinitions.ts`
19. i18n: alla `t.learn.missions.*`-nycklar

### Fas 5 — ProgressPanel + BottomPill desktop
20. `ProgressPanel.tsx` — XP-bar + titel (achievements bevaras)
21. `HudControlRailRegion.tsx` → BottomPill med lägesaccent
22. Läges-specifik vänster rail (`LearningRail.tsx`)

### Fas 6 — Mobil redesign (BottomNav + Sheets)
23. `MobileBottomNav.tsx` — 5 tabs med lägesaccent
24. `MobileTimePill.tsx`
25. `HUD.tsx` — mobil gren refactoring (sheets per tab)
26. `HudDetailRegion.tsx` — koppla nya sheets

### Fas 7 — Stjärnbildsberättelser
27. `ConstellationStoryCard.tsx`
28. Koppla in i `ConstellationViewControls.tsx`
29. i18n: alla `t.learn.constellations.*`-nycklar

### Fas 8 — Skalvisualiserare + polish
30. `ScaleComparison.tsx`
31. Lägg till i PlanetPanel som tredje flik
32. Animationsrefinement (quiz shake, XP pulse, mode-fade)
33. iPad landscape hybrid layout
34. Accessibility-genomgång (focus ring, aria-labels, reduced-motion)

---

## 15. Vad som INTE ändras

- All 3D-scen, kamerasystem och fysik
- `BottomSheet.tsx` (befintlig, behålls)
- `CollapsibleHudPanel.tsx` (behålls på desktop)
- `GameModeSwitcher.tsx` (integreras i BottomPill, tas bort som separat element)
- Alla 6 befintliga achievements (bevaras parallellt med XP)
- Befintliga uppdrag i `missionDefinitions.ts` (de 5 enkla uppdragen finns kvar)
- `shareLink`-systemet, analytics, Zustand-struktur i övrigt

---

## 16. Designbeslut — fastslagna 2026-04-28

| # | Fråga | Beslut |
|---|---|---|
| 1 | Quiz i missioner: modal eller inline? | **Global modal** (Alt B) — `pendingQuizId` i store, `QuizOverlay` global komponent |
| 2 | Lägesindikator-rand: överkant eller nederkant? | **Överkant** — 2 px rand direkt under TopBar |
| 3 | LearningRail (vänster, desktop): permanent eller toggle? | **Toggle** — knapp i TopBar, tillstånd i store (`leftRailOpen: boolean`) |
| 4 | XpBadge: visa alltid eller bara i Lär/Uppdrag? | **Kontextberoende** — döljs i Utforska-läget, visas i Lär och Uppdrag |
| 5 | Faktakort level-default: middle eller upper? | **Mellanstadiet (middle)** — default, sparas i store som `learningLevel` |
