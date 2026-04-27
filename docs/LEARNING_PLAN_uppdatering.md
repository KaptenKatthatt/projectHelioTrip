# HelioTrip — Pedagogisk utvecklingsplan

**Målgrupp:** Mellanstadiet (åk 4–6, 10–12 år) och högstadiet (åk 7–9, 13–16 år)  
**Syfte:** Gör lärandet om rymden roligt, nyfikenhetsbaserat och förankrat i läroplanen

---

## 1. Nuläge och problembild

Appen har idag:

- En fungerande rymdvisualiserare med planeter, månar, satelliter och stjärnbilder
- Tre spellägen (Utforska / Lär / Utmana) – men **Lär-läget saknar innehåll**
- Fem uppdrag av "besök-och-klicka"-typ utan pedagogiskt djup
- En `PlanetPanel` med bara torra fakta (avstånd, omlopps­tid, omkrets)
- 6 enkla achievements utan progression

Vad som saknas är **berättelsen, frågorna och nyfikenheten** – det som gör att ett barn faktiskt vill lära sig.

---

## 2. Pedagogisk vision

> "Inte plugga fakta om rymden – utan _resa_ genom den och förstå varför det ser ut som det gör."

Principerna:

| Princip                 | Vad det innebär i appen                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| **Kontext före fakta**  | Lär ut varför solen är stor _i relation till_ planeten du just landade på   |
| **Fråga före svar**     | Ställ en fråga, låt eleven utforska, ge svaret när hen hittar det           |
| **Rätt nivå, rätt tid** | Mellanstadiet: analogier och wow-fakta. Högstadiet: fysik, mönster, samband |
| **Liten bit i taget**   | Max 1–2 läropunkter per steg, aldrig mer än 3 meningar text åt gången       |
| **Belöna nyfikenhet**   | XP och titlar för att utforska _extra_, inte bara slutföra                  |

---

## 3. Funktionsidéer

### 3.1 Faktakort på planetpanelen (hög prioritet, låg komplexitet)

**Vad:** `PlanetPanel` utökas med ett flik-system: **Fakta** (nuvarande data) + **Lär dig mer** (pedagogiska kort).

Varje himmelskropp får 3–4 faktakort, t.ex. för Jupiter:

- 🌪️ _"Stormens öga"_ — Den stora röda fläcken är en storm som rasat i 350 år. Den är dubbelt så stor som hela jorden.
- 🌙 _"Månrika Jupiter"_ — Jupiter har 95 kända månar. De fyra största hittade Galileo 1610 med ett hemmagjort teleskop.
- ⚖️ _"Hur tung är du här?"_ — På Jupiter väger du 2,5× mer än på jorden. En 40-kilos elev väger 100 kg där.
- 🔴 _"Ingen mark att landa på"_ — Jupiter är en gasjätte. Det finns ingenstans att stå – du skulle sjunka in som i ett moln.

**Nivåmarkering:** Varje kort märks med en ikon:

- 🟢 Mellanstadiet (enkel analogi)
- 🔵 Högstadiet (mer exakt, med fysikförklaring)

**Teknisk implementation:**

```typescript
// src/lib/learning/bodyContent.ts
type FactCard = {
  id: string;
  bodyId: BodyId;
  icon: string;
  titleKey: string; // i18n-nyckel
  bodyKey: string; // i18n-nyckel
  level: 'middle' | 'upper' | 'both';
};
```

Alla texter i `en.ts` / `sv.ts` under `t.learn.cards.*`.

---

### 3.2 Äventyrsuppdrag med berättelse (hög prioritet, medel komplexitet)

**Vad:** En ny uppdragskategori med narrativ ram. Studenten spelar en rymdforskare som löser ett mysterium.

**Exempeluppdrag (mellanstadiet):** _"Vattenjakten"_

> Dr. Astra behöver vatten för sin rymdstation. Ryktet säger att is gömmer sig under ett av Jupiters månar. Kan du hjälpa henne?

Steg:

1. 🚀 Starta vid Solen – titta på hur liten Jupyter är härifrån
2. 📍 Flyg till Jupiter – läs faktakort om gasjätten
3. 🔍 Hitta Europa – läs om det underjordiska havet _(faktakort visas automatiskt)_
4. ❓ **Miniquiz:** "Vad tror forskarna finns under Europas isskorpa?" → tre svarsalternativ
5. 🏆 Klart! Dr. Astra tackar – du låser upp titeln "Vattenjägaren"

**Exempeluppdrag (högstadiet):** _"Gravitationsslingans hemlighet"_

> Voyager 1 åkte förbi Jupiter 1979. Den använde gravitationskraft för att accelerera – utan att bränna ett enda gram extra bränsle. Hur?

Steg:

1. Hitta Voyager 1 (om implementerad som objekt) eller se dess bana
2. Titta på Jupiters gravitationspåverkan via tidsspolning
3. Faktakort om gravitationsslinga (Hohmann-transfer)
4. **Quiz:** Beräkningsfråga om deltaV (förenklad)
5. Unlock: "Banmekaniker"

**Teknisk implementation:**

```typescript
// src/lib/missions/missionDefinitions.ts — utökat format
type MissionStep = {
  // … befintliga fält …
  factCardId?: string; // Visar ett faktakort när steget nås
  quizId?: string; // Triggar ett quiz efter steget
  narrativeKey?: string; // Berättartext (karaktärens röst)
};
```

---

### 3.3 Miniquiz (medel prioritet, medel komplexitet)

**Vad:** Korta 1–3 fråge-quiz som dyker upp i slutet av ett uppdragssteg eller när man klickar "Testa dig själv" på ett faktakort.

**Frågetyper:**

1. **Flervalsfråga** — 3 alternativ, ett rätt. Omedelbar feedback.
2. **Skattningsfråga** — "Välj vilket som är störst" med en drag-to-order-lista
3. **Sant/Falskt** — Snabb, lätt att göra på mobil
4. **Fyll i luckan** — "Jupiter har **\_** kända månar" med sifferhjul

**Feedbackprincip:** Fel svar ger inte "Fel!" – det ger en ledtråd + möjlighet att svara igen:

> "Inte riktigt! Tips: Tänk på att Jupiter är _så stor_ att 1300 jordklot ryms i den."

**Poängsystem:**

- Rätt på första försöket: 3 stjärnor
- Rätt på andra försöket: 2 stjärnor
- Rätt på tredje försöket (visas rätt svar): 1 stjärna
- Stjärnor summeras till XP (se 3.6)

**Teknisk implementation:**

```typescript
// src/lib/learning/quiz.ts
type QuizQuestion = {
  id: string;
  type: 'multiple-choice' | 'rank-order' | 'true-false' | 'fill-in';
  bodyId?: BodyId;
  level: 'middle' | 'upper' | 'both';
  questionKey: string;
  options?: string[]; // i18n-nycklar
  correctAnswer: string | number;
  hintKey: string;
  explanationKey: string;
};

// Store-tillägg
quizResults: Record<string, { stars: number; attempts: number }>;
```

UI: Ny komponent `QuizCard.tsx` – dyker upp som ett bottom sheet på mobil, inline-panel på desktop.

---

### 3.4 Lärandevägar / Temauppdrag (medel prioritet, medel komplexitet)

**Vad:** Samlade "kursmoduler" som läraren kan tilldela klassen. Varje modul har 3–6 uppdrag som leder mot ett lärandemål.

**Förslag på moduler:**

| Modul                           | Nivå          | Lärandemål                                         | Antal uppdrag |
| ------------------------------- | ------------- | -------------------------------------------------- | ------------- |
| 🌞 **Solsystemet – en rundtur** | Mellanstadiet | Känna till alla 8 planeter + ordning + storlek     | 4             |
| 💧 **Vatten i rymden**          | Mellanstadiet | Förstå varför livet kan kräva vatten               | 3             |
| 🔭 **Galileos resa**            | Mellanstadiet | Historien om hur vi lärde oss om solsystemet       | 3             |
| 🌑 **Månars mångfald**          | Högstadiet    | Varför ser månar så olika ut (geologi, tyngdkraft) | 5             |
| ⚡ **Gravitationen styr allt**  | Högstadiet    | Keplers lagar, banmekanik, gravitationsslinga      | 5             |
| 🔴 **Mars – nästa stopp**       | Högstadiet    | Förutsättningar för Mars-kolonisering              | 4             |

En modul visas som en "karta" i gränssnittet där eleven ser nästa låsta uppdrag, sin progress och ett slutpris (titel + animation).

---

### 3.5 Skalvisualiserare (hög pedagogisk effekt, medel komplexitet)

**Vad:** Interaktiv jämförelsevy – "Hur stor är Jupiter jämfört med Jorden?"

Eleven klickar på en knapp i `PlanetPanel`: **"Jämför storlek"**. Appen zoomar ut/visar en overlay med proportionellt ritade cirklar.

**Exempel:**

- Solen vs. Jupiter: "1302 Jupiters ryms i Solen"
- Jupiter vs. Jorden: "1321 Jordar ryms i Jupiter"
- Euopa vs. Månen: "Europa är ungefär lika stor som vår Måne"

Tekniskt: SVG-overlay i scenen, radier beräknade från `meanRadiusKm` som redan finns i body-data.

---

### 3.6 XP och titlar – gamifierad progression (hög motivation, låg komplexitet)

**Vad:** Ersätt de 6 enkla achievement-flaggorna med ett XP-system med titlar som ger status och identitet.

**XP-källor:**

- Besöka en ny himmelskropp: +10 XP
- Slutföra ett uppdragssteg: +15 XP
- Quiz – rätt svar 3 stjärnor: +30 XP
- Quiz – rätt svar 2 stjärnor: +20 XP
- Slutföra ett helt uppdrag: +50 XP
- Slutföra en lärandeväg: +150 XP
- Utforska en stjärnbild: +20 XP

**Titlar (låses vid XP-gränser):**

| XP   | Titel (SV)         | Titel (EN)          |
| ---- | ------------------ | ------------------- |
| 0    | Nybörjare          | Rookie              |
| 100  | Stjärntittare      | Stargazer           |
| 300  | Rymdutforskare     | Space Explorer      |
| 600  | Astronomiassistent | Astronomy Cadet     |
| 1000 | Rymdforskare       | Space Scientist     |
| 2000 | Solsystemsexpert   | Solar System Expert |
| 3500 | Galaktisk Guide    | Galactic Guide      |

Titeln visas i `ProgressPanel` och som en diskret badge i HUD.

```typescript
// Store-tillägg
xp: number;
title: TitleId;
```

---

### 3.7 Stjärnbildsberättelser (medel prioritet, låg komplexitet)

**Vad:** Nuvarnade `ConstellationViewControls` visar bara stjärnornas namn. Lägg till ett "Berättelse"-kort som öppnas när eleven fokuserar en stjärnbild.

Innehåll per stjärnbild:

- **Mytologisk berättelse** (2–3 meningar, åldersanpassad)
- **Hur man hittar den** ("Sök efter de tre stjärnorna i ett rät" för Orion)
- **Bästa årstid att se den** ("Synlig i Sverige december–mars")
- **Intressant fakta** ("Betelgeuse kan explodera som en supernova inom 100 000 år")

Flikar: **Berättelse | Hitta den | Kul fakta**

---

### 3.8 Lärarläge / Klassrumsvy (framtida fas, hög värde för läraren)

**Vad:** En separat vy för lärare att se klassens progress och dela uppdrag.

Funktioner:

- Dela en "klasskod" – elever skriver in koden och får samma lärandeväg tilldelad
- Aggregerad vy: hur många elever har klarat varje steg
- Läraren kan "låsa" appen till en specifik modul under lektionen
- Exportera progress som CSV för betygsdokumentation

**Teknisk fotnot:** Kräver backend (user auth + databas). Kan byggas med Supabase eller Firebase. Är ett eget projekt – bör inte påbörjas förrän offline-innehållet är stabilt.

---

## 4. Prioriteringslista

Rangordnad efter **pedagogiskt värde × implementationshastighet**:

| #   | Funktion                           | Svårighetsgrad | Tid (estimat) | Fas |
| --- | ---------------------------------- | -------------- | ------------- | --- |
| 1   | Faktakort i PlanetPanel            | Låg            | 2–3 dagar     | MVP |
| 2   | XP + titlar                        | Låg            | 1–2 dagar     | MVP |
| 3   | Miniquiz (flerval + sant/falskt)   | Medel          | 3–4 dagar     | MVP |
| 4   | Äventyrsuppdrag × 2 (ett per nivå) | Medel          | 3–4 dagar     | MVP |
| 5   | Skalvisualiserare                  | Medel          | 2–3 dagar     | V2  |
| 6   | Stjärnbildsberättelser             | Låg            | 2 dagar       | V2  |
| 7   | Lärandevägar (modulkarta)          | Hög            | 5–7 dagar     | V2  |
| 8   | Lärarläge / Klassrumsvy            | Mycket hög     | 2–3 veckor    | V3  |

---

## 5. Innehållsstrategi

### Vad behöver skrivas?

För MVP-fasen behöver följande textinnehåll produceras (på svenska + engelska):

- **Faktakort:** 4 kort × 15 himmelskroppar = ~60 kort
- **Quizfrågor:** 3–5 frågor × 15 himmelskroppar = ~60 frågor
- **Äventyrsuppdrag:** 2 berättelser × 5 steg × 2 språk = ~20 textblock
- **Stjärnbildsberättelser:** 12 stjärnbilder × 3 flikar × 2 språk = ~72 texter

Alla texter skrivs som i18n-nycklar i `src/i18n/locales/sv.ts` och `en.ts`.

### Ton och språk

| Målgrupp      | Ton                                                               | Exempel                                                           |
| ------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| Mellanstadiet | Berättande, "wow-faktaaktig", analogier med vardagen              | "Jupiters storm är lika gammal som Sverige blev ett land!"        |
| Högstadiet    | Mer exakt, ger fysikaliska förklaringar, inga "barniga" analogier | "Europas tidvattenvärme orsakas av Jupiters gravitationsgradient" |

---

## 6. Teknisk arkitektur – sammanfattningv

### Nya filer att skapa

```
src/lib/learning/
  bodyContent.ts        # Faktakort-definitioner per himmelskropp
  quiz.ts               # Quiz-frågor + typer
  learningPaths.ts      # Moduler / lärandevägar
  xp.ts                 # XP-beräkning + titellogik

src/components/
  FactCard.tsx          # Faktakort-komponent
  QuizCard.tsx          # Quizkomponent (flerval, sant/falskt)
  ScaleComparison.tsx   # Skalvisualiserare
  ConstellationStory.tsx # Berättelsekort för stjärnbilder
  LearningPathMap.tsx   # Modulkarta
```

### Tillägg i befintliga filer

| Fil                                | Tillägg                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| `src/store/useStore.ts`            | `xp`, `title`, `quizResults`, `activeLearningPath`         |
| `src/components/PlanetPanel.tsx`   | Fliksystem med faktakort-fliken                            |
| `src/components/ProgressPanel.tsx` | Titel + XP-bar                                             |
| `src/lib/missions/types.ts`        | `factCardId?`, `quizId?`, `narrativeKey?` på `MissionStep` |
| `src/i18n/locales/sv.ts` + `en.ts` | `t.learn.cards.*`, `t.learn.quiz.*`, `t.learn.xp.*`        |

### Inga nya designtokens

Alla nya komponenter följer befintliga mönster i `DESIGN_SYSTEM.md`:

- Faktakort: `bg-white/5 rounded-2xl p-3` (samma som `BottomSheet`-innehåll)
- Quiz-knappar: befintlig `HudIconButton` eller `secondary`-knappstil
- XP-bar: `bg-emerald-500/30` progress-bar (samma gröna accent som i appen idag)

---

## 7. Prototyp-prioritet: "Vattenjakten" + faktakort

**Rekommenderat första steg:**

1. Lägg till 4 faktakort för **Europa** (Jupiters is-måne med underjordiskt hav)
2. Skapa ett äventyrsuppdrag "Vattenjakten" som låter eleven besöka Europa och tar upp ett faktakort automatiskt
3. Lägg till ett sant/falskt-quiz som avslutar uppdraget
4. Ge XP och titeln "Vattenjägaren" vid completion

Detta är liten, avgränsad feature som demonstrerar hela flödet — faktakort → narrativ → quiz → belöning — utan att kräva att all content är klar.

---

_Plan framtagen 2026-04-27. Revidera när innehållsproduktion startar._
