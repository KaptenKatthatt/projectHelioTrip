# HelioTrip — UX/UI-genomgång (Composer)

*Framtagen 2026-04-29. Kompletterar och korsrefererar [`claude-ux-rapport.md`](./claude-ux-rapport.md).*

---

## Syfte

Den här rapporten svarar på tre frågor:

1. **Är [`claude-ux-rapport.md`](./claude-ux-rapport.md) fortfarande relevant** mot nuvarande kodbas?
2. **Var finns textrutor som blir för breda** för bekväm läsning?
3. **Hur kan appen kännas roligare och tydligare** utan att HUD:t blir rörigt?

---

## Kort bedömning av Claude-rapporten

Rapporten i [`claude-ux-rapport.md`](./claude-ux-rapport.md) är **i stort sett träffsäker**: den identifierar verkliga dubbleringar (XP), mobilflöden till faktakort, flikar i `PlanetPanel`, liten progress-bar i `XpBadge`, och läsbarhetsproblem med `text-[10px]`. Flera punkter är fortfarande giltiga utifrån kodgranskning nedan.

**Avvikelser / uppdateringar:**

| Claude-punkt | Status i kod (2026-04-29) |
|--------------|---------------------------|
| **§6 ProgressPanel i kollapsbar panel** | `ProgressPanel` ligger redan i `CollapsibleHudPanel` i `HudPrimaryNavRegion` (högerkolumn). Delvis åtgärdat; `MissionCard` är fortfarande alltid expanderad i samma stack. |
| **§5 QuizOverlay och extern dismiss** | `dismissQuiz()` anropas i nuvarande kod bara från `QuizOverlay` via `handleClose()`. Risken är **framtid / refaktor**, men en `useEffect` på `pendingQuizId` är fortfarande sund defensiv UX. |
| **§9 "Avbryt uppdrag"** | I `MissionCard` finns även en **framträdande knapp i sidhuvudet** (`backToExplore`) som avslutar uppdrag och byter till utforska — liknande risk som den nedre `abandon`-knappen. Värt att behandla båda som destruktiva åtgärder. |

---

## Egen genomgång: textrutor och radlängd

**Var läget är bra**

- Högerkolumnen på desktop begränsar paneler till **`max-w-sm`** (~448px) för `PlanetPanel`-wrapper, `MissionCard` och `ProgressPanel`. Det motsvarar ungefär **55–70 tecken** per rad för svensk text — inom vanlig typografisk rekommendation för skärm.
- `AboutDialog` använder **`max-w-md`** för innehåll — rimligt för ett modal-innehåll.
- `FactCard` har `leading-relaxed` på brödtext; radlängden styrs av förälderns bredd (ofta `max-w-sm`), så **fullbreddsproblem är begränsat** i nuvarande layout.

**Där det kan kännas brett eller tungt**

- `PlanetPanel` sätter **`max-w-lg`** när omloppstiden är lång (`hasLongOrbitPeriod`). Då blir infofliken **lite bredare** (~512px) än övriga paneler. Det är inte extremt, men om ni vill ha en enhetlig “kolumnkänsla” kan ni överväga att behålla samma maxbredd och låta värdet wrappa på flera rader i stället.
- På **mobil** fyller sheet ofta **nästan hela viewport-bredden**. Det är normalt för telefoner; i **landskapsläge på surfplatta** kan brödtext i `FactCard` kännas lång. En **maxbredd centrerad i sheet** (t.ex. `max-w-prose mx-auto` på faktatexter) skulle mjuka upp det utan att lägga till ny visuell “låda”.
- **Slutsats:** Det finns **ingen uppenbar “för bred textruta”** som bryter läsbarheten i typiska fall; den största variansen är `max-w-lg` i `PlanetPanel` och eventuellt landskap på tablet.

---

## Rätt saker på rätt plats? Onödiga inforutor?

**Starka val**

- **Lägesaccent** (`HudTopBarRegion`) och **XP** i lär/utmaning ger snabb kontext utan att täcka 3D-scenen.
- **Mobil bottom sheets** (`HudDetailRegion`) delar upp planeter, stjärnbilder, lär-innehåll och “mer” — tydlig mental modell.

**Problem: dubblering och hierarki**

1. **`PlanetPanel` visas två gånger på desktop** när en planet är vald (`showPlanetInfoUi`): en gång i **översta** `CollapsibleHudPanel` (standard kollapsad) och en gång i **högerkolumnen** — båda renderar `<PlanetPanel />`. Det är mer än “samma titel två gånger”; det är **samma funktionella panel dubbelt** i trädet. Det skapar onödig kognitiv last och risk för divergerande scroll/läge mellan instanser om state någonsin delas annorlunda. *Rekommendation:* behåll **en** primär planetpanel (förslagsvis högerkolumnen i utforsk/lär-läge) och ta bort eller ersätt den övre med en **minimal indikator** (namn + färg) om ni behöver snabb synlighet.
2. **XP** syns i **`XpBadge`** (topbar) och i **`ProgressPanel`** (detaljrad + full progress). Claudes resonemang om duplicering står kvar; på desktop kan ni antingen dölja mini-baren i badgen eller göra badgen klickbar och scrolla/fokusera panelen (Claude §16).
3. **`FreeFlightHelp`** och **`FreeFlightHint`** visas bara i fritt flyg — bra kontext, inte onödiga. **`AchievementToast`** är episodisk; rimligt.

**Mobil: “Lär” vs faktakort**

- “Lär”-sheet visar `MissionCard`, inte faktakort. Det stämmer med [`claude-ux-rapport.md`](./claude-ux-rapport.md) §3. En **direkt ledtext eller snabbväg** (“Öppna fakta för vald planet”) skulle sänka tröskeln utan ny permanent panel.

---

## Planetfokus i viewporten (ny prioritering)

I nuvarande UI kan informationspaneler i vissa lägen ta över uppmärksamheten så att planeten hamnar för lågt, nära panelkanten, eller delvis visuellt blockerad. Det bryter mot appens primära löfte: att utforska solsystemet genom att faktiskt se och interagera med planeterna.

**Rekommendation (designprincip):**

- Planeten ska vara **primärt fokusobjekt** i viewporten, inte panelerna.
- Vid hög informationsdensitet ska kamerakompositionen justeras så planeten ligger **högre upp** med tydlig luft runt objektet.
- Definiera en **HUD-safe area** där paneler inte får konkurrera med planetens interaktionsyta (rotation/inspektion).

---

## Hur göra upplevelsen roligare utan rörighet

Princip: **belöning och tydlighet i befintliga ytor**, inte fler permanenta paneler.

| Idé | Varför det inte blir rörigt |
|-----|-----------------------------|
| **En “sanning” för progression** | Välj antingen topbar-X eller sidopanel som detalj; den andra blir minimalt läge eller ren navigationslänk. |
| **Mikro-feedback** | Kort visuell bekräftelse när man låser upp fakta/quiz (ni har redan toast för achievements — samma språk för inlärningsmoment). |
| **Tomma tillstånd som inspirerar** | När achievements är 0: dölj eller byt till en rad som **bjuder in** (Claude §11), inte bara “inga prestationer”. |
| **Konsekvent lägesfeedback** | Starkare accent eller liten läses-chip (Claude §12) — en ändring, synlig överallt. |
| **Planetpanel en gång** | Minskar konkurrerande fokus och gör det lättare att hitta Fakta/Jämför. |
| **Snabbquiz eller “visste du”** | En rad under XP eller i planet-sheet efter besök — valfritt, stängningsbart, inte en tredje kolumn. |

Undvik: fler fasta kort i hörnen samtidigt som mission + planet + progress redan fyller högerkolumnen i lär-läge.

---

## Sammanfogad prioriteringslista (Composer + Claude)

**Hög**

1. Ta bort eller förenkla **dubbel `PlanetPanel` på desktop** (se ovan) — *kompletterar* Claude §8.
2. **XP-dubblering** mellan `XpBadge` och `ProgressPanel` (Claude §1–2).
3. **Mobil väg till faktakort** (Claude §3).
4. **Flikar / etiketter** i `PlanetPanel` på smal yta (Claude §4, §14).
5. Defensiv **quiz-state-reset** (Claude §5).

**Medel**

6. `MissionCard`: **både** header- och footer-destruktiva åtgärder — sekundär placering eller bekräftelse.
7. **Konstellations-sheet**: berättelse före eller vid vald stjärnbild (Claude §7).
8. **`text-[10px]`** → minst `text-xs` där innehållet bär information (Claude §10).
9. **Tom achievements-sektion** (Claude §11).
10. **Lägesaccent** och **ScaleComparison**-ledtext (Claude §12–13).

**Låg**

11. Scroll-signaler i `BottomSheet`, klickbar `XpBadge`, `prefers-reduced-motion`, quiz-stängknappens copy, `FactCard` maxbredd i extrema layouter (Claude §15–20).

---

## Slutsats

[`claude-ux-rapport.md`](./claude-ux-rapport.md) är en **bra grund**; den viktigaste **kodburna tillägget** från den här genomgången är att **hela `PlanetPanel` dupliceras på desktop**, vilket förstärker problemet med “rätt sak på rätt plats”. Textrutor är överlag **rimligt begränsade**; förbättringar handlar mer om **hierarki, dubbletter och mobil upptäckbarhet** än om enskilda superspåriga stycken. Att göra appen **roligare** handlar i första hand om **tydligare belöningsspår och färre konkurrerande informationspaneler**, inte om fler HUD-element.
