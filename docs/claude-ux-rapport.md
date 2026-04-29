# HelioTrip — UX/UI-granskning
*Framtagen 2026-04-29 av Claude Sonnet 4.6 i rollen som frontend/UX-expert*

---

## Sammanfattning

HelioTrip har en tydlig och snygg grundestetik — glassmorfism mot rymdbakgrund fungerar väl. De senaste tilläggen (inlärningssystem, faktakort, quiz, XP) har däremot lagts ovanpå befintlig UI utan att helheten omarbetats. Resultatet är ett antal dubbleringar, dolda flöden och visuell trängsel som motarbetar det pedagogiska syftet.

Rapporten är organiserad efter prioritet: **Hög** (påverkar upplevelsen direkt), **Medel** (irriterande men blockerar inte), **Låg** (polish och finjustering).

---

## Hög prioritet

### 1. XP-data visas på två ställen simultant

**Problem:** XP-information dupliceras. `XpBadge` i topbaren visar titel + XP-tal + progress-bar. `ProgressPanel` i högerkolumnen (desktop) visar exakt samma sak — titel, XP-tal och progress-bar — plus ytterligare data. Användaren ser samma rad information två gånger inom 20 cm på skärmen.

**Konsekvens:** Visuellt brus. Användaren vet inte vilket av de två som är "sanningskällan".

**Förslag:** I desktop-läge bör `XpBadge` i topbaren döljas om `ProgressPanel` är synlig. Alternativt: gör `XpBadge` till en ren mini-indikator (bara titel, ingen bar) och låt `ProgressPanel` äga den detaljerade XP-vyn.

---

### 2. XpBadge:ns progress-bar är för liten för att vara läsbar

**Problem:** Progress-baren i `XpBadge` är 56 px bred (`w-14`). Att skilja 30 % fyllning från 40 % fyllning på 56 px är visuellt omöjligt — den kommunicerar ingen meningsfull information.

**Konsekvens:** Elementet tar plats utan att tillföra värde. Eleven ser en liten linje men förstår inte hur nära nästa titel de är.

**Förslag:** Antingen ta bort baren från `XpBadge` helt (spara den för `ProgressPanel`) eller gör baren bredare — minst 80–100 px för att ge meningsfull läsbarhet. En siffra ("340 / 500 XP") kommunicerar bättre på liten yta än en 56 px bar.

---

### 3. Faktakort och quiz är tre klick bort på mobil

**Problem:** På mobil är åtkomst till lärandeinnehåll för en specifik planet gömd djupt i navigationshierarkin:
1. Planet måste redan vara vald (eller användaren letar i 3D-scenen)
2. Planet-info-sheeten glider upp
3. Användaren måste manuellt byta till "Fakta"-fliken
4. Sedan "Testa dig själv"-knappen för quiz

Att trycka på "Lär"-tabben i bottomnaven öppnar ett sheet med `MissionCard` — inte faktakort. Lär-läget på mobil visar alltså missioner, inte det faktabaserade lärinnehållet.

**Konsekvens:** Faktakorten är det primära pedagogiska innehållet, men de kräver att användaren förstår att de måste navigera till en planet *och* byta flik. Ny användare hittar dem troligen inte.

**Förslag:** Lägg en snabblänk i "Lär"-sheeten: "Besök en planet för att se faktakort". Alternativt: visa de senast besökta planetens faktakort direkt i "Lär"-sheeten om en planet är aktiv.

---

### 4. PlanetPanel har tre flikar på en liten yta

**Problem:** PlanetPanel har nu flikarna `[Info] [Fakta] [Jämför storlek]` i ett segmenterat kontroll på `max-w-md` (448 px, ännu smalare på mobil). "Jämför storlek" är 13 tecken — på mobilskärmar trunkeras fliktexten.

**Konsekvens:** Flikarna klämmer ihop sig. Teckenstorlek `text-xs` på 3 flikar i 448 px fungerar, men i det mobilbottomsheet som är smalare (100 vw) är det trångt.

**Förslag:** Förkorta "Jämför storlek" till "Storlek" i `t.learn.ui.compareSize`. Alternativt: byt från textflikar till ikonflikar (Info-ikon, Boksymbol, Skala-ikon) med `aria-label` för tillgänglighet.

---

### 5. QuizOverlay-state nollställs inte vid extern dismiss

**Problem:** `QuizOverlay` håller lokalt state (`phase`, `attempts`, `selectedKey`, `showHint`, etc.). State nollställs *enbart* i `handleClose()`. Om `dismissQuiz()` anropas från store direkt (t.ex. av en mission-action) utan att passera `handleClose()`, kommer nästa quiz att öppnas med kvarstående state från förra sessionen.

**Konsekvens:** Användaren kan se en ny fråga med förra svarsalternativet fortfarande markerat, eller i "result"-phase utan att ha svarat.

**Förslag:** Nollställ lokalt state via `useEffect` på `pendingQuizId`-ändringar:
```tsx
useEffect(() => {
  if (!pendingQuizId) return;
  setPhase("question");
  setAttempts(0);
  setSelectedKey(null);
  setFillValue("");
  setShowHint(false);
  setEarnedStars(0);
  setWrongFeedback(false);
}, [pendingQuizId]);
```

---

### 6. Höger kolumn på desktop kan bli mycket lång i Lär-läge

**Problem:** I Lär-läge på desktop staplas tre panels i högerkolumnen vertikalt:
1. `ProgressPanel` (XP-bar + besökta + achievements)
2. `PlanetPanel` med 3 flikar (om planet är vald)
3. `MissionCard` (om aktiv mission)

Alla är expanderade som standard. Den totala höjden överstiger lätt 800 px — mer än vad som ryms på en 1080p-skärm. Scroll är möjlig via `overflow-y-auto pr-1`, men det är inte uppenbart för användaren att kolumnen scrollar.

**Konsekvens:** Nedre paneler (MissionCard) kan vara helt dolda utan att användaren vet om dem.

**Förslag:** `ProgressPanel` och `MissionCard` bör wrapas i `CollapsibleHudPanel` i högerkolumnen precis som `PlanetPanel` är det. `ProgressPanel` startar kollapsad i explore-läge, expanderad i lär-läge. `MissionCard` startar expanderad om mission är aktiv.

---

## Medel prioritet

### 7. ConstellationStoryCard syns inte direkt på mobil

**Problem:** I mobil-stars-sheeten visas `ConstellationList` överst och `ConstellationStoryCard` *under* listan. Sheeten är `max-h-[min(85dvh,32rem)]`. Om listan är lång (16 stjärnbilder) måste användaren scrolla ner till historiekortet — vilket troligen inte händer spontant.

**Förslag:** När en stjärnbild är vald, visa `ConstellationStoryCard` *överst* i sheeten (ovanför listan), eller använd en collapsed/expanded-lista som döljer de icke-valda när en är vald.

---

### 8. Den övre planetindikatorn på desktop är onödig

**Problem:** På desktop visas planettiteln i `CollapsibleHudPanel` övre vänstra hörnet *och* igen i `PlanetPanel` i högerkolumnen (med färgpunkt, data, flikar etc.). Den övre panelen defaultar till kollapsad och visar bara planetnamnet — samma information som rubriken i högerkolumnen.

**Konsekvens:** Duplicerat element som tar plats i övre vänster utan att tillföra unikt värde.

**Förslag:** Ta bort det övre `CollapsibleHudPanel` på desktop när högerkolumnen är synlig. Behåll det enbart om högerkolumnen inte finns (t.ex. medium-layout utan högerkolumn).

---

### 9. "Avbryt uppdrag"-knappen är för framträdande

**Problem:** I `MissionCard` finns "Avbryt uppdrag"-knappen synlig i botten av kortet, nästan lika prominent som steplistan. För en elev är "avbryt" sällan önskad handling — men den är alltid synlig.

**Konsekvens:** Risk för att eleven klickar "Avbryt" av misstag, vilket återställer progressen.

**Förslag:** Dölj knappen bakom ett sekundärt steg — till exempel ett litet texttryck: `"Avbryt uppdraget"` i `text-[10px] text-white/40` som kräver ett klick till (confirm-dialog) eller gör den till en nedtonad länk längst ner.

---

### 10. `text-[10px]` används på för många ställen

**Problem:** Koden innehåller `text-[10px]` på flera semantiskt viktiga ställen:
- "XP till nästa titel" i `ProgressPanel`
- Sektionsrubriker i `ProgressPanel` och `MissionCard` ("AKTIV MISSION", "VÄLJ UPPDRAG")
- Döljd progress-text i `XpBadge`

10 px text är svårläst för alla, men riktar sig till elever 10–16 år där läsförmågan varierar. Legibility-riktlinjer (WCAG) rekommenderar minst 12 px för brödtext, 11 px för sekundär info.

**Förslag:** Höj minimum till `text-xs` (12 px) för all text som bär information. Reservera `text-[10px]` för rent dekorativa etiketter (t.ex. "AKTIV MISSION"-badges) som är uppbackade av kontext.

---

### 11. `ProgressPanel` visar tomma achievements-sektionen

**Problem:** I början av en session (0 achievements unlockade) visar `ProgressPanel` ett achievements-avsnitt med texten "Inga prestationer upplåsta." Det tar plats men ger inget värde.

**Konsekvens:** Panelen ser halvfärdig ut. Eleven ser ett tomt avsnitt som minner dem om vad de inte har gjort.

**Förslag:** Dölj achievements-sektionen helt när `unlockedSet.size === 0`. Visa den bara när det finns något att visa.

---

### 12. GameModeSwitcher i bottombar och mobilnav är överlappande

**Problem:** På desktop finns `GameModeSwitcher` i `HudControlRailRegion` (bottom center). På mobil finns lägesbyte inbyggt i `MobileBottomNav`-flikarna. Men det finns ingen tydlig visuell länk mellan lägesbyten och var man "befinner sig". En användare som byter till "Lär"-läge via bottombar på desktop ser knappt accentranden — den är 2 px hög och `opacity-70`.

**Förslag:** Gör accentranden 3–4 px hög och `opacity-100`. Alternativt: visa ett mer distinkt visuellt lägesindikator (t.ex. en liten chip i topbaren: `[● Lär-läge]`).

---

### 13. ScaleComparison-knapparna saknar kontext

**Problem:** Jämförelseknapparna i `ScaleComparison` visar bara planetnamn: `[Solen] [Jupiter] [Mars]` (Earth filtreras bort om aktiv). Det är oklart *varför* man väljer dessa och inte andra planeter.

**Förslag:** Lägg till en ledtext ovanför knapparna: `"Jämför med:"` / `"Compare with:"` som förklarar vad knapparna gör. Annars ser det ut som slumpmässiga knappar.

---

### 14. Planet-info-sheeten på mobil har ingen indikation om flikar

**Problem:** Planet-info-sheeten glider upp med "Info"-fliken aktiv. Flikarna (`[Info] [Fakta] [Jämför storlek]`) är bara synliga i Lär/Uppdrag-läge. I Utforska-läge syns bara Info-innehållet — inga flikar, inget som indikerar att mer innehåll finns om du byter läge.

**Konsekvens:** En elev i Utforska-läge ser planet-data men får aldrig veta att det finns faktakort om de inte av ren slump byter läge.

**Förslag:** Visa alltid flikarna (Info / Fakta / Jämför) men gråa ut Fakta och Jämför i Utforska-läge med en liten tooltip: "Byt till Lär-läge för att se faktakort." Alternativt: byt läge automatiskt när eleven klickar på en nedtonad flik.

---

## Låg prioritet

### 15. `BottomSheet`-scrollbar syns inte

`BottomSheet` har `overflow-y-auto pr-1` på sin innehållsdiv, men inga visuella cues om att innehållet är scrollbart. `pr-1` är enbart ett gap för scrollbaren — iOS döljer scrollbaren. Lägg till `overscroll-contain` och eventuellt en gradient-fade i botten för att signalera mer innehåll.

### 16. XpBadge är inte klickbar

`XpBadge` i topbaren visar information men är inte interaktiv. En klick skulle logiskt öppna `ProgressPanel` (mobil) eller scrolla till den (desktop). Missad möjlighet att göra ett passivt element aktivt.

### 17. Faktakortens brödtext kan bli lång utan maxbredd

`FactCard` saknar `max-w` och `leading-relaxed` på en `text-xs`-text. På desktop i `max-w-sm`-kolumnen är det hanterbart, men i ett fullbredsscenario (om kortet någonsin visas bredare) kan radlängden bli svårläst (>75 tecken per rad).

### 18. QuizResult-knappen återanvänder `t.ui.aboutClose` ("Stäng")

Stängknappen i quiz-result-fasen använder `t.ui.aboutClose` som troligen är "Stäng" — en sträng för "About"-dialogen. Semantiskt borde quiz-stängknappen heta "Klar" / "Done" eller "Fortsätt" / "Continue" för att signalera att resultatet är accepterat.

### 19. `ConstellationStoryCard` hanterar inte korta/tomma berättelser

Om en berättelse är tom eller mycket kort ser kortet konstigt ut (litet kort med mycket tomrum). Lägg till en `min-h` eller en fallback-text.

### 20. Ingen `prefers-reduced-motion`-respekt i mode-accentfärdsövergångarna

`transition-all duration-500` på accentranden respekterar inte `prefers-reduced-motion`. Lägg till `motion-reduce:transition-none` konsekvent på alla animerade element (quiz-overlay, mode-accent, progress-bars).

---

## Sammanfattningstabell

| # | Problem | Prioritet | Komponent | Åtgärd |
|---|---|---|---|---|
| 1 | XP duplicerat i topbar + sidebar | Hög | XpBadge + ProgressPanel | Ta bort en av de två |
| 2 | XpBadge progress-bar för liten | Hög | XpBadge | Bredda till 100 px eller ta bort |
| 3 | Faktakort är 3 klick bort på mobil | Hög | HudDetailRegion | Exponera direktväg i "Lär"-sheet |
| 4 | 3 flikar i PlanetPanel trångt | Hög | PlanetPanel | Förkorta fliktexter eller ikonflikar |
| 5 | QuizOverlay-state nollställs inte externt | Hög | QuizOverlay | Lägg till useEffect på pendingQuizId |
| 6 | Höger kolumn för lång i Lär-läge | Hög | HudPrimaryNavRegion | Wrapа panels i CollapsibleHudPanel |
| 7 | ConstellationStoryCard dold under scroll | Medel | HudDetailRegion | Flytta berättelsekortet till toppen |
| 8 | Övre planetindikator på desktop onödig | Medel | HudPrimaryNavRegion | Ta bort övre CollapsibleHudPanel |
| 9 | "Avbryt uppdrag" för framträdande | Medel | MissionCard | Gör till sekundärt textelement |
| 10 | text-[10px] för liten | Medel | Flera | Höj minimum till text-xs |
| 11 | Tomma achievements tar plats | Medel | ProgressPanel | Dölj sektionen när tom |
| 12 | Accentrand 2 px för diskret | Medel | HudTopBarRegion | 3–4 px, opacity-100 |
| 13 | ScaleComparison-knappar saknar ledtext | Medel | ScaleComparison | Lägg till "Jämför med:" label |
| 14 | Flikar osynliga i Utforska-läge | Medel | PlanetPanel | Visa nedtonade flikar alltid |
| 15 | BottomSheet scroll-cue saknas | Låg | BottomSheet | Gradient-fade + overscroll-contain |
| 16 | XpBadge inte klickbar | Låg | XpBadge | Lägg till onClick → ProgressPanel |
| 17 | Faktakort saknar maxbredd | Låg | FactCard | Lägg till max-w för brödtext |
| 18 | QuizResult-knapp heter "Stäng" | Låg | QuizOverlay | Byt till "Fortsätt" / "Continue" |
| 19 | Tomma berättelser i ConstellationStoryCard | Låg | ConstellationStoryCard | Fallback-text |
| 20 | prefers-reduced-motion saknas | Låg | Flera | motion-reduce:transition-none |

---

## Hur hade jag gjort appen roligare och svårare att lämna?

Det här avsnittet handlar inte om buggar eller UX-fel — utan om de psykologiska mekanismer som gör att man stannar kvar. Speldesign, narrativ dragkraft och "the next interesting thing".

---

### Den stora saknade ingrediensen: nyfikenhetsloopar

Appen är idag **faktabaserad** — du flyger dit, läser, quizzas, flyger vidare. Det saknas en aktiv **fråga som drar dig framåt** innan du ens hittat svaret. Spel som Pokémon, Duolingo och Minecraft delar alla samma grundmekanism: du lockas att ta *ett steg till* för att stänga en öppen loop.

Exempel på öppna loopar som hade fungerat i HelioTrip:

- "Jupiter har en hemlighet du inte hittat än — den syns om du stannar tillräckligt länge."
- "Två planeter delar en mystisk koppling. Vilka?"
- "Du är den 1 254:e besökaren av Titan. Bara 12 % har hittat vad som gömmer sig under ytan."

---

### 1. Planeter som belönar uthållighet — inte bara besök

**Nu:** XP och faktakort låses upp direkt när du *anländer* till en planet.

**Problemet:** Det finns ingen anledning att *stanna*. Spelet är ett stämpelkort — besök, samla, gå vidare.

**Förslaget:** Lägg till tidsberoende upplåsningar. Låt faktakortens djupaste nivå (eller ett "hemligt faktum") kräva att planeten är aktiv i 30–60 sekunder. Dr. Astra säger: *"Håll ögonen på Jupiters stormögon — det tar en stund..."* Sedan dyker ett specialkort upp. Eleven lämnar inte förrän de sett det.

Det handlar om att skapa **tålamodets belöning** — en känsla av att det lönar sig att vara kvar.

---

### 2. Dagliga utmaningar med roterande tema

**Nu:** Missioner är statiska och slutförs en gång.

**Förslaget:** En "Dagens utmaning" — en ny fråga, observation eller jämförelse varje dag, genererad från ett pool-system:

- "Idag: Hitta den planet som är närmast Solen just *nu* (inte i genomsnitt — faktiska positioner)."
- "Idag: Vilken är störst — Ganymede eller Merkurius? Flyg dit och kolla med Jämför-verktyget."
- "Idag: Sätt tidshastigheten till 365× och se vem som hinner runt Solen först."

Ingen ny kod för planeterna — frågorna är redaktionellt skrivna och hämtar svar ur befintliga data. Men de skapar en **daglig anledning att öppna appen**.

---

### 3. Kollektiv utforskning — "Vad andra hittade"

**Nu:** Appen är helt enspelarupplevelse utan känsla av community.

**Förslaget:** Ett minimalt socialt lager utan konton eller chat. Visa diskret:

- "127 elever besökte Europa den här veckan."
- "Populäraste faktakort just nu: ☄️ Jupiters stormar."
- "3 av dina klasskamrater har startat Vattenjakten."

Inget behöver vara realtid — det kan vara veckovisa siffror från ett enkelt analytics-aggregat. Men det skapar **social proof** och FOMO: *"Om 127 besökte Europa den här veckan är det förmodligen värt att kolla."*

---

### 4. Stjärnkartan som samlarobjekt

**Nu:** Stjärnbilder är navigationsverktyg — du väljer dem, ser berättelsen, stänger.

**Förslaget:** Gör stjärnkartan till ett **samlingsalbum**. Varje stjärnbild har tre lager att "avslöja":
1. Formen (syns alltid)
2. Berättelsen (låses upp när du hittat den)
3. En dold observation (t.ex. "Sett Orion en klar vinternatt? Markera det" → badge)

Visuellt: oupptäckta stjärnbilder är halvtransparenta med ett frågetecken. Upplåsta lyser tydligare. Det skapar en Pokédex-känsla — du ser hur många du saknar och lockas att fylla i dem.

---

### 5. Dr. Astras röst som narrativ motor

**Nu:** Dr. Astra nämns i i18n-nycklarna men implementeras inte som en aktiv karaktär. `NarrativeMessage`-komponenten är specificerad i designdokumentet men inte renderad.

**Förslaget:** Dr. Astra dyker upp proaktivt, inte bara i missioner. Exempel:

- När du zoomar in nära solen: *"Kom inte för nära — men du är nyfiken, eller hur? Bra."*
- När du besökt 5 planeter: *"Du har redan utforskat mer än de flesta. Jag börjar bli imponerad."*
- När du byter till Utforska-läge efter en quiz: *"Bra jobbat. Ta en paus och titta på planeterna ett tag."*

Karaktärsrepliker kostar ingenting att implementera tekniskt (de är bara strängar i ett data-objekt). Men de gör appen **personlig**. Eleven känner att någon ser vad de gör. Det är svårare att lämna en konversation än ett informationssystem.

---

### 6. "Streak"-mekanik för lärandevanor

**Nu:** XP och titlar mäter total insats, men inte regularitet.

**Förslaget:** Lägg till en diskret streak-räknare — antal dagar i rad du öppnat appen och slutfört minst en quiz. Visas som en liten flamma-ikon i topbaren: 🔥 7.

Streaks är en av de mest beforskade retention-mekanismerna (Duolingo-effekten). Nyckeln är att de skapar en *förlust* att undvika snarare än en vinst att sträva mot — "Jag vill inte bryta min 7-dagarsstreak" är starkare motivation än "Jag vill ha 8 dagars streak".

Tekniskt: bara ett datum i localStorage, en jämförelse mot today och yesterday.

---

### 7. Planeter som "händer" — inte bara är

**Nu:** Planeterna orbiterar. Det är vackert. Men ingenting händer.

**Förslaget:** Schemalagda "rymdväder"-events. Inte simulerade fysikalt — bara narrativt:

- Måndag: "Jupiterstormen är på sitt maximum idag."
- Onsdag: "Saturnus ringar syns i perfekt vinkel just nu."
- Lördag: "Solvindarna är starka idag — kika på kometen."

Varje event är ett faktakort med datum-tagg, ett enkelt quiz-question och en visuell highlight (accentfärgad pulsering på planeten i fråga). Det skapar **anledning att öppna appen på tisdag** för att se vad som hänt — utan att kräva server eller realtidsdata.

---

### 8. Kompletteringspress via synliga luckor

**Nu:** `ProgressPanel` visar "Besökta: 4/18" och senast besökta. Men planeter du *inte* besökt är osynliga — de listas inte.

**Förslaget:** Visa en checklist med alla 18 kroppar, de obesökta som halvtransparenta silhuetter med namn. "Du saknar: Triton, Pluto, Titan, ISS."

Det är ett välkänt designmönster: **synliga luckor driver kompletteringsdrift**. Att se att man saknar exakt 3 av 18 är mycket starkare motivation än att veta att man besökt 15.

---

### Designprincip bakom allt ovan

Alla åtta punkterna delar en gemensam logik:

> **Skapa en fråga du vill ha svar på *innan* du lämnar appen.**

Antingen är frågan narrativ ("vad döljer Dr. Astra?"), social ("vad hittade de andra?"), samlingsmässig ("vad saknar jag?") eller temporal ("vad händer imorgon?"). Faktakunskapen är inte slutmålet — den är *svaret* på en fråga eleven redan är nyfiken på. Det är skillnaden mellan att läsa en lärobok och att läsa ett mysterium där läroboken råkar innehålla ledtrådarna.
