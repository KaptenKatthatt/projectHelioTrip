# Fas 3 Rapport: Detaljerad Implementationsanalys

## Syfte

Fas 3 fokuserar på att bygga en tydlig spel-loop ovanpå den tekniska basen från fas 1 och 2. Målet är att öka retention och lärande utan att tappa enkelheten i Explore-läget eller prestanda på mobil.

## Övergripande mål

- Skapa tydliga mål och progression för spelaren.
- Höja återspelningsvärde med checklist och achievements.
- Förstärka lärandet i kontext med kort, relevant pedagogik.
- Minska friktion mellan fri utforskning och uppdragsstyrning.

## Primära KPI:er för fas 3

- Mission start-rate
- Mission completion-rate
- Antal unika himlakroppar besökta per session
- Genomsnittlig sessionlängd
- Andel återvändande användare inom 7 dagar

## Scope i fas 3

1. Tre upplevelselägen

- Explore: fri utforskning utan krav
- Learn: guidade miniturer med korta förklaringar
- Challenge: uppdragsläge med tydliga mål och completion

2. Missionssystem v1

- Delmål med tydliga trigger-villkor
- Start, progression, completion och avbrott
- Eventdriven validering (inte per-frame)

3. Progression

- Discovery checklist (besökta kroppar)
- Achievements v1 (första planet, första måne etc.)
- Tydlig visuell feedback vid upplåsning

4. Pedagogik i kontext

- Korta mikrofakta i paneler
- Begrepp förklaras i rätt steg i Learn/Challenge
- Undvik informationsöverlastning

5. Delning

- Save/share-link med vytillstånd (objekt, tid, läge)
- Robust parse/restore med validering av query-parametrar

## Rekommenderat missionspaket v1

1. Solsystemstart

- Besök Jorden och Mars i ordning

2. Månar runt Jupiter

- Hitta Io, Europa och Ganymede

3. Tidsresa kort

- Byt till 30 dagar per sekund och observera positionsförändring

4. ISS-jakt

- Hitta ISS och håll fokus under kort tid

5. Storleksjämförelse

- Jämför Jupiter mot Jorden i informationspanelen

6. Konstellation-intro

- Fokusera två valda konstellationer

7. Distanskoll

- Identifiera kropp med störst distans till Jorden i sessionen

8. Fri flygning

- Aktivera free flight och återgå till cinematic utan fel

## Tekniska ändringar per område

### State och progression

- Utöka store med:
  - gameMode
  - activeMission
  - missionProgress
  - checklistState
  - achievementsState
- Rekommenderad fil: src/store/useStore.ts

### Missionsmotor

- Nytt modulområde för missionsdefinitioner och evaluator:
  - missionDefinitions
  - missionEvaluator
  - missionGuards
- Rekommenderad placering: src/lib/missions/

### HUD och navigation

- Lägesval i HUD
- Missionskort med steg/progress
- Smidig återgång till Explore
- Rekommenderade filer:
  - src/components/HUD.tsx
  - src/components/NavigationAccordion.tsx

### Pedagogisk panel

- Korta, kontextuella förklaringar i panelen
- I18n-uppdatering på svenska och engelska
- Rekommenderade filer:
  - src/components/PlanetPanel.tsx
  - src/i18n/locales/sv.ts
  - src/i18n/locales/en.ts

### Tid och mission-triggers

- Koppla mission-triggers till tidskontroller och simtillstånd
- Rekommenderade filer:
  - src/components/TimePlaybackControls.tsx
  - src/hooks/useTimeManager.ts

### Share-link

- Serialisera validerat tillstånd till URL
- Återställ vy på page load
- Rekommenderad fil:
  - src/App.tsx

### Analytics för iteration

- Nya events i klient
- Aggregering i backend
- Rekommenderade filer:
  - src/lib/analytics.ts
  - api/\_lib/analyticsStore.ts

## Nya analytics-events i fas 3

- mode_changed { mode }
- mission_started { mission_id }
- mission_step_completed { mission_id, step_id }
- mission_completed { mission_id, duration_s }
- checklist_progress { visited_count }
- achievement_unlocked { achievement_id }
- share_link_created { context_type }

## Leveransordning (sprintförslag)

### Sprint 1

- Lägesval Explore/Learn/Challenge
- Missionsmotor skeleton
- 2 enkla missioner

### Sprint 2

- Discovery checklist
- Achievements v1
- 3 till 4 missioner

### Sprint 3

- Pedagogikförstärkning
- Share-link
- Analyticsuppföljning i dashboard

## Definition of Done för fas 3

- Minst 5 färdiga missioner med validerade triggers
- Discovery checklist och minst 5 achievements fungerar och persisteras
- Learn-läge har minst 2 guidade turer på svenska och engelska
- Share-link återställer vy korrekt
- Inga regressioner i:
  - planetval
  - resa
  - zoom
  - free flight
  - konstellationsfokus
- Lint och unit är gröna
- Minst 1 e2e-test för missionflöde är grönt

## Risker och mitigering

1. För komplex state

- Mitigering: separerad missionsmotor och tydliga selectors

2. Otydlig UI-hierarki

- Mitigering: mode-specifik visning och strikt prioriterad informationsyta

3. Mobilprestanda

- Mitigering: eventdriven missionlogik, undvik tunga frame-loopar

4. Överpedagogik

- Mitigering: max 1 till 2 lärpunkter per steg, kort copy

## Beslutsstöd

### Progressionsmodell

- Option A: checklist + achievements (snabbast)
- Option B: kampanj med nivåer (högre innehållsarbete)
- Rekommendation: starta med A och expandera med data

### Edutainmentdjup

- Option A: mikrofakta i paneler
- Option B: längre narrativ guidning
- Rekommendation: kombinera A + 2 till 3 korta turer

### Delning/community

- Option A: share-link av vy/tid
- Option B: scenario sharing med import/export
- Rekommendation: starta med A och utvärdera B efter adoption

## Slutsats

Fas 3 bör levereras inkrementellt med tydlig instrumentering. Fokus bör ligga på en enkel men stark loop: välj läge, följ mål, lås upp progression, dela upplevelse. Detta ger maximal effekt på retention med kontrollerad teknisk risk.
