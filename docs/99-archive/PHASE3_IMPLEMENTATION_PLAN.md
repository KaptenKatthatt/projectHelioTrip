# Fas 3 Implementationsplan

## Syfte

Den här planen bryter ned fas 3 till konkreta implementationsteg ovanpå nuvarande kodbas. Fokus är att införa spel-loop, progression och delning utan att skapa regressioner i Explore-läget, free flight eller mobilprestanda.

## Nuläge i kodbasen

- Globalt app-state ligger i `src/store/useStore.ts` och innehåller redan navigation, aktiv himlakropp, tid, språk och konstellationsfokus.
- HUD:en byggs i `src/components/HUD.tsx` och använder redan olika mönster för desktop och mobil, inklusive `CollapsibleHudPanel`, `NavigationAccordion` och `FreeFlightMobileControls`.
- Tidslogiken körs i `src/hooks/useTimeManager.ts` och ska fortsatt vara analytisk per frame, medan missionslogik måste vara eventdriven.
- Analytics-klienten i `src/lib/analytics.ts` och aggregation i `api/_lib/analyticsStore.ts` är etablerade och bör utökas istället för att ersättas.
- `src/App.tsx` är rätt plats för share-link restore och init av vyrelaterat sessionstate.

## Arkitekturprinciper

1. Missionsvalidering ska vara eventdriven och selector-baserad, inte knuten till render-loop eller `useFrame`.
2. Explore-läget ska fortsätta fungera även om missionssystemet inte är aktivt.
3. Mobil och desktop ska dela samma domänlogik, men med olika informationsdensitet och panelbeteende.
4. Progression ska persisteras separat från ren vy-state så att share-links inte oavsiktligt skriver över spelarens långsiktiga framsteg.
5. Varje sprint ska lämna appen i ett körbart läge med gröna lint-, unit- och minst relevanta regressionskontroller.

## Föreslagen leveransordning

### Sprint 1: Lägen och missionsmotor-bas

Mål: introducera nya lägen utan att bryta nuvarande navigation.

- Utöka store i `src/store/useStore.ts` med:
  - `gameMode: 'explore' | 'learn' | 'challenge'`
  - `activeMissionId: string | null`
  - `missionProgress`
  - `visitedBodies`
  - `unlockedAchievements`
  - `shareViewStateVersion`
- Lägg ny domänmodul i `src/lib/missions/`:
  - `types.ts`
  - `missionDefinitions.ts`
  - `missionEvaluator.ts`
  - `missionGuards.ts`
  - `missionFacts.ts`
- Definiera ett litet antal domän-events som missionsmotorn lyssnar på:
  - body focused
  - body viewed
  - time scale changed
  - navigation mode changed
  - constellation focused
  - view restored from share link
- Implementera selectors och actions i store för:
  - byte av läge
  - start/avbryt mission
  - markera missionsteg som klart
  - återgå till Explore från alla lägen
- Lägg in första två missionerna från rapporten:
  - Solsystemstart
  - Månar runt Jupiter

### Sprint 2: Progression och UX-loop

Mål: göra framsteg synligt, begripligt och persistent.

- Bygg discovery checklist och achievements i store och i ny UI-modul under `src/components/`.
- Visa progression i HUD som separata vyer för:
  - aktiv mission
  - checklist-status
  - senaste upplåsning
- Lägg till achievement-regler för minst:
  - första planet
  - första måne
  - första constellation-focus
  - första free-flight-växling
  - första färdiga mission
- Utöka analytics med:
  - `mode_changed`
  - `mission_started`
  - `mission_step_completed`
  - `mission_completed`
  - `checklist_progress`
  - `achievement_unlocked`
- Utöka `api/_lib/analyticsStore.ts` så att nya eventnamn kan aggregeras utan specialfall i senare sprintar.

### Sprint 3: Pedagogik, share-link och polish

Mål: knyta ihop lärande, delning och retention.

- Lägg mikrofakta och stegvis pedagogik i `src/components/PlanetPanel.tsx` och nya översättningsnycklar i i18n.
- Skapa Learn-flöden som återanvänder missionsmotorn men med pedagogiskt copy-fokus snarare än strikt completion-pressure.
- Implementera serialisering i `src/App.tsx` för:
  - aktiv kropp
  - simtid
  - time scale
  - game mode
  - aktiv mission när relevant
  - navigation mode om restore är säker
- Lägg robust parse/restore med whitelistad validering och fallback till Explore.
- Lägg minst ett e2e-test för missionflöde och ett för share-link restore.

## Arbetsströmmar

### 1. State och persistens

Primära filer:

- `src/store/useStore.ts`
- eventuellt ny hjälpare i `src/store/` för selectors eller persist-mappning

Genomförande:

- Behåll nuvarande simulation state som bas och lägg progression i en tydligt avgränsad slice i samma Zustand-store eller i separat store om komplexiteten växer snabbt.
- Persistens bör delas upp i minst två grupper:
  - preferenser: språk och eventuellt UI-inställningar
  - progression: checklista, achievements, avslutade missioner
- Undvik att persistera transient state som `isTraveling`, aktiv animation eller mellanliggande missionsteg som bara gäller pågående session om det inte finns tydligt produktkrav.

Rekommendation:

- Börja i befintlig store för snabb leverans.
- Bryt ut missionsdomänen först när actions/selectors blir svåra att testa isolerat.

### 2. Missionsmotor

Primära filer:

- `src/lib/missions/missionDefinitions.ts`
- `src/lib/missions/missionEvaluator.ts`
- `src/lib/missions/missionGuards.ts`

Genomförande:

- Definiera missioner deklarativt: id, mode-support, steg, trigger-typer, completion copy.
- Låt evaluatorn ta emot explicita app-events och nuvarande snapshot från store.
- Returnera ett rent resultatobjekt från evaluatorn, till exempel:
  - nya steg klara
  - mission klar
  - achievement ska låsas upp
  - analytics-events att skicka
- Missioner ska inte läsa UI-komponenter direkt och inte vara beroende av renderordning.

Teknisk riktning:

- Lägg en tunn dispatch-funktion i UI/store-actions som både uppdaterar state och pingar evaluatorn.
- Exempel: `travelTo`, `focusSkyTarget`, `setTimeScale`, `setNavigationMode` och share-link restore ska kunna mata samma evaluator.

### 3. HUD, navigation och desktop-flöde

Primära filer:

- `src/components/HUD.tsx`
- `src/components/NavigationAccordion.tsx`
- nya komponenter som `GameModeSwitcher.tsx`, `MissionCard.tsx`, `ProgressPanel.tsx`

Genomförande:

- Lägg till en tydlig mode-switcher med Explore, Learn och Challenge.
- Visa endast en primär uppgift åt gången i Challenge.
- I Learn ska aktiv guidning prioriteras före checklist-detaljer.
- Explore ska kunna gömma missionskort helt för att bevara dagens rena UI.
- NavigationAccordion ska kunna visa mode-relaterade shortcuts utan att tränga undan planet- och konstellationsval.

Desktop-riktlinje:

- Aktiv mission och progression kan visas samtidigt i högerkolumnen när planetpanelen inte dominerar utrymmet.
- Återgång till Explore ska vara ett singelklick från alla lägen.

### 4. Mobil-läge

Primära filer:

- `src/components/HUD.tsx`
- `src/components/NavigationAccordion.tsx`
- `src/components/TimePlaybackControls.tsx`
- `src/components/FreeFlightMobileControls.tsx`
- nya komponenter som `MobileMissionTray.tsx` eller återanvändning av `CollapsibleHudPanel`

Genomförande:

- Mobil ska inte spegla desktop-layouten. Den ska prioritera en aktiv uppgift, ett tydligt nästa steg och stora touch-ytor.
- Mode-switcher placeras nära befintliga nederkontroller, där användaren redan växlar flygläge och tid. Den ska vara nåbar med tummen och ha max tre tydliga val.
- Aktiv mission visas som en kollapsbar panel eller tray med:
  - missionnamn
  - nuvarande steg
  - enkel progressindikator
  - knapp för avbryt eller tillbaka till Explore
- Checklist och achievements ska inte ligga öppna permanent på mobil. Visa i stället:
  - kompakt sammanfattning i HUD
  - full vy i expanderad panel
  - kort toast/feedback när något låses upp
- Planetpanel, missionpanel och navigation får inte konkurrera samtidigt om samma vertikala yta. På mobil ska max en informationspanel vara expanderad åt gången.
- Free flight-mobilkontrollerna måste fortsatt få nedersta prioritet i fri flygning. Missionspanel ska därför:
  - auto-kollapsa när `navigationMode === 'free'`
  - undvika overlay över joystick-zonen
  - återöppnas när användaren går tillbaka till cinematic
- Tidskontroller på mobil bör förenklas om mode-switcher och missionsstatus tar mer plats. Prioritera färre presets eller horisontell scroll framför att minska touchyta.

Mobilacceptans:

- En användare ska kunna starta, följa och avsluta en mission med en hand i portrait-läge.
- Inga paneler får blockera play/pause, reset eller free-flight-joysticks.
- Ingen ny missionlogik får skapa märkbar jank på smala enheter.

### 5. Pedagogik i paneler

Primära filer:

- `src/components/PlanetPanel.tsx`
- `src/i18n/translations.ts`
- relevanta locale-filer under `src/i18n/locales/`

Genomförande:

- Lägg in kort mikrofakta per missionsteg eller kroppstyp.
- Visa högst 1 till 2 lärpunkter per steg.
- Återanvänd befintlig panelstruktur och lägg till ett separat block för "Varför detta spelar roll" i Learn-läget.
- Copy ska kunna döljas i Explore så att panelen förblir snabb att scanna.

### 6. Tidstriggers och simhändelser

Primära filer:

- `src/components/TimePlaybackControls.tsx`
- `src/hooks/useTimeManager.ts`

Genomförande:

- Missioner som beror på tid ska triggas när användaren ändrar `timeScale` eller när en tidsrelaterad observation explicit startas.
- Lägg inte missionslogik inne i `useFrame`.
- Om en mission kräver att något observeras under tid, använd ett kontrollerat session-event eller tidsstämplad mission-state, inte per-frame pollning.

### 7. Share-link

Primära filer:

- `src/App.tsx`
- eventuellt nya hjälpare i `src/lib/` för serialisering och parsing

Genomförande:

- Introducera en versionerad query-serialisering, exempelvis `?view=...&mode=...&t=...`.
- Tillåt endast kända body-id:n, modes, navigation-modes och säkra numeriska tidsvärden.
- Restore ska ske efter att appen initierats men före första större användarinteraktion.
- Om restore-innehåll är ofullständigt eller ogiltigt ska appen falla tillbaka till nuvarande default-beteende utan fel i konsolen.

Mobilkrav för share-link:

- Restore ska inte öppna flera paneler samtidigt på smala skärmar.
- Om en delad länk kommer in i free flight på mobil ska UI fortfarande lämna joystick-zonen fri.

### 8. Analytics och backend

Primära filer:

- `src/lib/analytics.ts`
- `api/_lib/analyticsStore.ts`
- eventuellt admin-sidan under `src/admin/`

Genomförande:

- Lägg till typed eventnamn både i klient och backend i samma ändring för att undvika mismatch.
- Se till att payload-normalisering stödjer `mission_id`, `step_id`, `achievement_id`, `mode` och `context_type`.
- Dashboarden bör kunna följa minst:
  - startade missioner per dag
  - slutförandegrad per mission
  - share-link usage
  - mode-fördelning

## Rekommenderad teknisk sekvens

1. Utöka store med `gameMode` och tomma missions/progression-strukturer.
2. Lägg till typed analytics-events för fas 3 så instrumentering finns från början.
3. Skapa missionsdefinitioner och evaluator med två enkla missioner.
4. Koppla evaluatorn till befintliga actions: kroppsval, tidsbyte, navigation-läge.
5. Lägg in mode-switcher och missionkort i HUD på desktop.
6. Anpassa samma flöde för mobil med kollapsbara paneler och fri yta för joystick.
7. Lägg till checklista och achievements.
8. Lägg till pedagogiskt innehåll i Learn.
9. Implementera share-link serialisering och restore.
10. Avsluta med e2e, regressionspass och analyticsverifiering.

## Teststrategi

### Unit

- Lägg tester för `missionEvaluator` med rena input/output-fall.
- Testa store-actions som byter mode, startar mission och markerar progression.
- Testa share-link parsing med giltiga och ogiltiga query-parametrar.

### Component

- Lägg tester för mode-switcher, missionkort och mobil panelprioritering.
- Verifiera att mobil endast visar en expanderad informationsyta åt gången.

### E2E

- Challenge-mission: start, steg, completion.
- Learn-läge: öppna guidning, gå vidare mellan steg.
- Share-link: skapa eller återställ vy och kontrollera att rätt kropp, tid och mode öppnas.
- Mobil viewport: verify att missionflöde inte blockerar tidkontroller eller free-flight-joystick.

## Risker att aktivt bevaka

1. Store-komplexitet växer för snabbt.
2. Mobil-HUD blir överfull när missioner, planetpanel och free flight samsas.
3. Share-link restore råkar skriva över långsiktig progression.
4. Analytics-event införs bara i klient eller bara i backend.
5. Missionslogik börjar leva i komponenter i stället för i en testbar domänmodul.

## Definition of Ready för implementation

- Branch för fas 3 är skapad.
- Den här planen är accepterad som arbetsordning.
- Två initiala missioner är valda för sprint 1.
- I18n-nyckelstruktur för Learn och Challenge är beslutad.
- Det är bestämt om progression ska leva i samma Zustand-store eller i separat slice/store.

## Praktisk startpunkt

Första konkreta implementationen bör vara:

1. Store-utökning med `gameMode`, `activeMissionId` och tom progression.
2. Typed analytics-events för `mode_changed` och `mission_started`.
3. Två deklarativa missioner och en minimal evaluator.
4. Enkel mode-switcher i HUD.
5. Mobilvariant där missionkortet är kollapsbart och auto-kollapsar i free flight.
