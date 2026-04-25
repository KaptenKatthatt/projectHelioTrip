# Fas 3 Rapport: Detaljerad Implementationsanalys

## Syfte
Fas 3 fokuserar pa att bygga en tydlig spel-loop ovanpa den tekniska basen fran fas 1 och 2. Malet ar att oka retention och larande utan att tappa enkelheten i Explore-laget eller prestanda pa mobil.

## Overgripande mal
- Skapa tydliga mal och progression for spelaren.
- Hoja aterspelningsvarde med checklist och achievements.
- Forstarka larandet i kontext med kort, relevant pedagogik.
- Minska friktion mellan fri utforskning och uppdragsstyrning.

## Primara KPIer for fas 3
- Mission start-rate
- Mission completion-rate
- Antal unika himlakroppar besokta per session
- Genomsnittlig sessionlangd
- Andel atervandande anvandare inom 7 dagar

## Scope i fas 3
1. Tre upplevelselagen
- Explore: fri utforskning utan krav
- Learn: guidade miniturer med korta forklaringar
- Challenge: uppdragslage med tydliga mal och completion

2. Missionssystem v1
- Delmal med tydliga trigger-villkor
- Start, progression, completion och avbrott
- Eventdriven validering (inte per-frame)

3. Progression
- Discovery checklist (besokta kroppar)
- Achievements v1 (forsta planet, forsta mane etc.)
- Tydlig visuell feedback vid upplasning

4. Pedagogik i kontext
- Korta mikrofakta i paneler
- Begrepp forklaras i ratt steg i Learn/Challenge
- Undvik informationsoverlastning

5. Delning
- Save/share-link med vytilstand (objekt, tid, lage)
- Robust parse/restore med validering av query-parametrar

## Rekommenderat missionspaket v1
1. Solsystemstart
- Besok Jorden och Mars i ordning

2. Manar runt Jupiter
- Hitta Io, Europa och Ganymede

3. Tidsresa kort
- Byt till 30 dagar per sekund och observera positionsforandring

4. ISS-jakt
- Hitta ISS och hall fokus under kort tid

5. Storleksjamforelse
- Jamfor Jupiter mot Jorden i informationspanelen

6. Konstellation-intro
- Fokusera tva valda konstellationer

7. Distanskoll
- Identifiera kropp med storst distans till Jorden i sessionen

8. Fri flygning
- Aktivera free flight och aterga till cinematic utan fel

## Tekniska andringar per omrade
### State och progression
- Utoka store med:
  - gameMode
  - activeMission
  - missionProgress
  - checklistState
  - achievementsState
- Rekommenderad fil: src/store/useStore.ts

### Missionsmotor
- Nytt modulomrade for missionsdefinitioner och evaluator:
  - missionDefinitions
  - missionEvaluator
  - missionGuards
- Rekommenderad placering: src/lib/missions/

### HUD och navigation
- Lageval i HUD
- Missionskort med steg/progress
- Smidig atergang till Explore
- Rekommenderade filer:
  - src/components/HUD.tsx
  - src/components/NavigationAccordion.tsx

### Pedagogisk panel
- Korta, kontextuella forklaringar i panelen
- I18n-uppdatering pa svenska och engelska
- Rekommenderade filer:
  - src/components/PlanetPanel.tsx
  - src/i18n/locales/sv.ts
  - src/i18n/locales/en.ts

### Tid och mission-triggers
- Koppla mission-triggers till tidskontroller och simtillstand
- Rekommenderade filer:
  - src/components/TimePlaybackControls.tsx
  - src/hooks/useTimeManager.ts

### Share-link
- Serialisera validerat tillstand till URL
- Aterstall vy pa page load
- Rekommenderad fil:
  - src/App.tsx

### Analytics for iteration
- Nya events i klient
- Aggregering i backend
- Rekommenderade filer:
  - src/lib/analytics.ts
  - api/_lib/analyticsStore.ts

## Nya analytics-events i fas 3
- mode_changed { mode }
- mission_started { mission_id }
- mission_step_completed { mission_id, step_id }
- mission_completed { mission_id, duration_s }
- checklist_progress { visited_count }
- achievement_unlocked { achievement_id }
- share_link_created { context_type }

## Leveransordning (sprintforslag)
### Sprint 1
- Lageval Explore/Learn/Challenge
- Missionsmotor skeleton
- 2 enkla missioner

### Sprint 2
- Discovery checklist
- Achievements v1
- 3 till 4 missioner

### Sprint 3
- Pedagogikforstarkning
- Share-link
- Analyticsuppfoljning i dashboard

## Definition of Done for fas 3
- Minst 5 fardiga missioner med validerade triggers
- Discovery checklist och minst 5 achievements fungerar och persisteras
- Learn-lage har minst 2 guidade turer pa svenska och engelska
- Share-link aterstaller vy korrekt
- Inga regressioner i:
  - planetval
  - resa
  - zoom
  - free flight
  - konstellationsfokus
- Lint och unit ar grona
- Minst 1 e2e-test for missionflode ar gront

## Risker och mitigering
1. For komplex state
- Mitigering: separerad missionsmotor och tydliga selectors

2. Otydlig UI-hierarki
- Mitigering: mode-specifik visning och strikt prioriterad informationsyta

3. Mobilprestanda
- Mitigering: eventdriven missionlogik, undvik tunga frame-loopar

4. Overpedagogik
- Mitigering: max 1 till 2 larpunkter per steg, kort copy

## Beslutsstöd
### Progressionsmodell
- Option A: checklist + achievements (snabbast)
- Option B: kampanj med nivaer (hogre innehallsarbete)
- Rekommendation: starta med A och expandera med data

### Edutainmentdjup
- Option A: mikrofakta i paneler
- Option B: langre narrativ guidning
- Rekommendation: kombinera A + 2 till 3 korta turer

### Delning/community
- Option A: share-link av vy/tid
- Option B: scenario sharing med import/export
- Rekommendation: starta med A och utvardera B efter adoption

## Slutsats
Fas 3 bor levereras inkrementellt med tydlig instrumentering. Fokus bor ligga pa en enkel men stark loop: valj lage, folj mal, las upp progression, dela upplevelse. Detta ger maximal effekt pa retention med kontrollerad teknisk risk.
