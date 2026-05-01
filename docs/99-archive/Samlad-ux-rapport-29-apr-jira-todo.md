# HelioTrip — Jira/TODO-underlag (29 apr)

Detta dokument är redo att brytas ner till Jira-ärenden. Varje punkt innehåller scope, prioritet, acceptanskriterier och beroenden.

---

## Epic UX-1: Informationshierarki och dubbletter

### UX-100 — Planet först: säkerställ fri planetyta i viewporten
- **Prioritet:** High
- **Typ:** UX/Layout
- **Problem:** Informationspaneler kan i vissa lägen dominera scenen och delvis täcka/trycka ner planeten.
- **Mål:** Planeten ska alltid ha tydlig visuell prioritet och fri interaktionsyta.
- **Scope:**
  - Definiera viewport-princip: planeten placeras högre upp när informationsdensiteten är hög.
  - Definiera HUD-safe area där paneler inte får konkurrera med planetens interaktionszon.
  - Säkerställ att användaren kan rotera planeten med god luft runt objektet.
- **Acceptanskriterier:**
  - Planeten överlappas inte visuellt av nedre informationsyta i kritiska vyer.
  - Användartest bekräftar att planeten upplevs som huvudfokus före panelerna.
  - Rotation och inspektion fungerar utan att paneler blockerar upplevelsen.
- **Beroenden:** Inga

### UX-101 — Konsolidera planetinformation på desktop
- **Prioritet:** High
- **Typ:** UX/UI Refactor
- **Problem:** Planetinfo exponeras i flera paneler samtidigt.
- **Mål:** En tydlig primär panel för aktiv planet.
- **Scope:**
  - Behåll en huvudpanel för planetinfo i desktoplayout.
  - Ta bort alternativt minimera sekundär panel till indikatornivå.
- **Acceptanskriterier:**
  - Endast en full planetpanel visas samtidigt på desktop.
  - Användartest: 5/5 testpersoner hittar planetfakta utan tvekan.
- **Beroenden:** Inga

### UX-102 — Reducera XP-dubblering mellan topbar och progresspanel
- **Prioritet:** High
- **Typ:** UX/UI Refactor
- **Problem:** XP presenteras redundant i två ytor.
- **Mål:** En detaljkälla + en komprimerad sammanfattning.
- **Scope:**
  - Definiera primär progressionvy.
  - Förenkla sekundär vy till mini-läge eller navigationslänk.
- **Acceptanskriterier:**
  - Ingen fullständig duplicering av samma XP-komponenter.
  - Visuell hierarki godkänd i designreview.
- **Beroenden:** UX-101 (rekommenderat)

### UX-103 — Förbättra vertikal prioritering i desktop-lärläge
- **Prioritet:** High
- **Typ:** Layout
- **Problem:** Högerkolumnen blir för lång med flera expanderade paneler.
- **Mål:** Viktigaste innehåll syns först, mindre kritiskt kan kollapsas.
- **Scope:**
  - Tydlig ordning mellan progression, planet och mission.
  - Definiera default expand/collapse per läge.
- **Acceptanskriterier:**
  - Kritisk panelinformation syns utan extra scroll på standardhöjd.
  - Scrollbarhet signaleras tydligt när innehåll överstiger höjd.
- **Beroenden:** UX-101, UX-102

---

## Epic UX-2: Mobil lärupptäckbarhet

### UX-201 — Snabbväg till faktakort från lärläget på mobil
- **Prioritet:** High
- **Typ:** Navigation UX
- **Problem:** Faktakort/quiz är svåra att hitta via nuvarande mobilflöde.
- **Mål:** Användaren hittar fakta på första försöket från lärläget.
- **Scope:**
  - Lägg till tydlig CTA/ledtext till fakta för vald planet.
  - Visa relevant tomt tillstånd när planet inte är vald.
- **Acceptanskriterier:**
  - Max två steg från lärflik till faktakort.
  - Upptäckbarhetstest: minst 80 % hittar vägen utan instruktion.
- **Beroenden:** Inga

### UX-202 — Förbättra PlanetPanel-flikar på smala ytor
- **Prioritet:** High
- **Typ:** UI polish
- **Problem:** Fliketiketter är trånga och delvis svårlästa.
- **Mål:** Flikar är tydliga och konsekventa i mobilbredd.
- **Scope:**
  - Kortare etiketter eller ikonlösning med tillgängliga labels.
  - Säkerställ visuellt aktivt läge i fliknavigeringen.
- **Acceptanskriterier:**
  - Ingen trunkering i målade mobilbredder.
  - Flikar uppfyller tillgänglighetskrav för label och fokus.
- **Beroenden:** UX-201 (valfritt)

---

## Epic UX-3: Läsbarhet och trygg interaktion

### UX-301 — Höj minsta informativa textstorlek
- **Prioritet:** Medium
- **Typ:** Accessibility/UX
- **Problem:** Informationsbärande text i 10 px.
- **Mål:** Bättre läsbarhet för målgruppen 10-16 år.
- **Scope:**
  - Inventera var `text-[10px]` används för innehåll med informationsvärde.
  - Höj till minst `text-xs` där relevant.
- **Acceptanskriterier:**
  - Ingen kritisk information renderas i 10 px.
  - QA godkänner läsbarhet på mobil och desktop.
- **Beroenden:** Inga

### UX-302 — Nedtona destruktiva mission-åtgärder
- **Prioritet:** Medium
- **Typ:** Interaction safety
- **Problem:** Avbryt/avsluta uppdrag är för framträdande.
- **Mål:** Minska oavsiktliga avbrott.
- **Scope:**
  - Flytta destruktiva actions till sekundär nivå.
  - Lägg bekräftelsesteg där påverkan är hög.
- **Acceptanskriterier:**
  - Destruktiva actions kan inte triggas oavsiktligt med ett misstagstap.
  - Analys visar minskad avbrottsfrekvens efter release.
- **Beroenden:** Inga

### UX-303 — QuizOverlay defensiv state-reset
- **Prioritet:** Medium
- **Typ:** Robustness UX
- **Problem:** Risk för state-läckage vid framtida dismiss-flöden.
- **Mål:** Ny quiz-session startar alltid rent.
- **Scope:**
  - Nollställ lokalt quiz-state vid nytt quiz-id/open-state.
- **Acceptanskriterier:**
  - Tidigare val/svar följer aldrig med till nytt quiz.
  - Reproducerbar testsekvens passerar stabilt.
- **Beroenden:** Inga

---

## Epic UX-4: Polering och retention

### UX-401 — Tydligare lägesfeedback (Utforska/Lär)
- **Prioritet:** Medium
- **Typ:** Visual feedback
- **Problem:** Aktivt läge är visuellt subtilt.
- **Mål:** Lägesstatus ska uppfattas direkt.
- **Scope:**
  - Justera accentstyrka och/eller kompletterande indikator.
- **Acceptanskriterier:**
  - Minst 90 % i intern test identifierar aktivt läge inom 2 sek.
- **Beroenden:** UX-101, UX-102 (rekommenderat)

### UX-402 — Förbättra tomma tillstånd och scrollsignaler
- **Prioritet:** Low
- **Typ:** UX polish
- **Problem:** Vissa tomma sektioner och scrollbara ytor kommunicerar svagt.
- **Mål:** Tydligare nästa steg och bättre orientering.
- **Scope:**
  - Dölj eller förbättra tomma achievements-lägen.
  - Lägg till visuella scroll-cues där innehåll fortsätter.
- **Acceptanskriterier:**
  - Inga tomma paneldelar utan syfte.
  - Scrollbara ytor kan upptäckas utan trial-and-error.
- **Beroenden:** Inga

### UX-403 — Mikrofeedback för progression
- **Prioritet:** Low
- **Typ:** Engagement
- **Problem:** Framsteg känns ibland statiska.
- **Mål:** Öka motivation utan extra paneler.
- **Scope:**
  - Kort feedback på XP/achievement/fakta-progress.
- **Acceptanskriterier:**
  - Feedback triggas konsekvent vid progression.
  - Ingen ny permanent HUD-ruta introduceras.
- **Beroenden:** UX-102

### UX-404 — Motion- och textbredds-polish för edge-cases
- **Prioritet:** Low
- **Typ:** Accessibility polish
- **Problem:** Reducerad motion och breda textfall kan förbättras.
- **Mål:** Stabil upplevelse i fler preferenser och vyer.
- **Scope:**
  - Säkerställ stöd för `prefers-reduced-motion`.
  - Sätt textmaxbredd för längre brödtexter i bredare layouter.
- **Acceptanskriterier:**
  - Motion reduceras korrekt när användaren valt detta.
  - Längre texter bryts i läsbar radlängd i tablet-landscape.
- **Beroenden:** Inga

---

## Epic UX-5: Retention och nyfikenhetsloopar

*Härleds från utökade förslag i `claude-ux-rapport.md` (spelglädje, längre sessioner, återkommande öppningar).*

### UX-405 — Ramverk för nyfikenhetsloopar (copy + triggers)
- **Prioritet:** Medium (efter kärn-UX-städ)
- **Typ:** Product / Content design
- **Mål:** Varje session ska kunna avslutas med en tydlig "öppen fråga" eller nästa steg.
- **Scope:** Definiera typer av hooks (uthållighet, mysterium, daglig, samlingslucka); koppla till befintliga händelser (planetval, tid, quiz).
- **Acceptanskriterier:** Minst tre återanvändbara hook-mallar dokumenterade; ingen ny permanent HUD-rad krävs för v1.
- **Beroenden:** UX-100, UX-101 (rekommenderat)

### UX-406 — Tidsberoende belöning vid planet (uthållighet)
- **Prioritet:** Medium
- **Typ:** Gameplay / Learning
- **Mål:** Belöna att stanna kvar, inte bara att "landa".
- **Scope:** Efter X sekunder aktiv vid vald planet: upplås extra faktum eller Dr. Astra-linje; tydlig feedback.
- **Acceptanskriterier:** Beteendet är förutsägbart, inte frustrerande; respekterar `prefers-reduced-motion` om animation används.
- **Beroenden:** UX-405 (valfritt)

### UX-407 — Dagens utmaning (redaktionell pool)
- **Prioritet:** Medium
- **Typ:** Content + UI entry point
- **Mål:** Daglig anledning att öppna appen utan ny planetsim-kod.
- **Scope:** Pool med utmaningar som använder befintliga verktyg (position, jämför, tidshastighet); en entry point i HUD eller lärläge.
- **Acceptanskriterier:** Ny utmaning per kalenderdag; misslyckande gracefully om pool tom.
- **Beroenden:** UX-201 (valfritt, för synlighet)

### UX-408 — Diskret kollektiv statistik (social proof)
- **Prioritet:** Low
- **Typ:** Engagement (kräver data/analytics-policy)
- **Mål:** Känsla av att andra också utforskar, utan konton eller chat.
- **Scope:** Aggregerade veckosiffror eller "populärt faktakort" om data finns.
- **Acceptanskriterier:** Ingen PII; copy godkänd; kan stängas av eller döljas om data saknas.
- **Beroenden:** Analytics/beslut

### UX-409 — Stjärnkarta som samlingsalbum
- **Prioritet:** Low
- **Typ:** Feature polish
- **Mål:** Stjärnbilder känns som samlarobjekt med tydliga luckor.
- **Scope:** Fler lager (berättelse, observation/badge); visuell skillnad upptäckt/ej upptäckt.
- **Acceptanskriterier:** Användaren ser hur många som saknas; tillgänglighet för ikoner/labels.
- **Beroenden:** Inga

### UX-410 — Dr. Astra proaktivt narrativ
- **Prioritet:** Medium
- **Typ:** Narrative UX
- **Mål:** Personlig röst som reagerar på kontext, inte bara missioner.
- **Scope:** Triggers + copy-tabell; återanvänd `NarrativeMessage` eller motsvarande enligt design system.
- **Acceptanskriterier:** Inga spamliknande upprepningar; användaren kan ignorera utan att blockeras.
- **Beroenden:** UX-405

### UX-411 — Lär-streak (diskret)
- **Prioritet:** Low
- **Typ:** Gamification
- **Mål:** Stödja återkommande vanor utan att dominera UI.
- **Scope:** t.ex. dagar i rad med minst ett avslutat quiz; liten indikator; etisk copy (ingen skuld).
- **Acceptanskriterier:** Streak återställs tydligt dokumenterat; barnvänlig ton.
- **Beroenden:** UX-102 (valfritt)

### UX-412 — Schemalagda narrativa "rymdväder"-events
- **Prioritet:** Low
- **Typ:** Content + highlight
- **Mål:** Anledning att komma tillbaka en annan dag utan serverkrav.
- **Scope:** Veckoschema + faktakort/quiz + valfri planet-highlight.
- **Acceptanskriterier:** Event synligt i appen på rätt dag; inga falska vetenskapliga påståenden utan redaktionell granskning.
- **Beroenden:** UX-405

### UX-413 — Synlig kompletteringslista (alla kroppar)
- **Prioritet:** Medium
- **Typ:** Progress UX
- **Mål:** Luckor ska vara synliga för kompletteringsdrift.
- **Scope:** Lista/silhuetter för obesökta kroppar; koppling till `ProgressPanel` eller egen vy.
- **Acceptanskriterier:** Användaren kan namnge minst tre kroppar de inte besökt utan att gissa.
- **Beroenden:** UX-102 (valfritt)

---

## Rekommenderad sprintplan

### Sprint 1
- UX-100, UX-101, UX-102, UX-201

### Sprint 2
- UX-202, UX-103, UX-301, UX-302

### Sprint 3
- UX-303, UX-401, UX-402

### Sprint 4
- UX-403, UX-404

### Sprint 5 (retention — efter kärn-UX)
- UX-405, UX-407, UX-410, UX-413 (start); därefter UX-406, UX-409, UX-411, UX-412, UX-408 enligt kapacitet och data

---

## Definition of Done (för hela initiativet)

- Dubbletter i kärn-UI borttagna eller tydligt motiverade.
- Mobilväg till faktakort/quiz uppfyller upptäckbarhetsmål.
- Informativ text uppfyller miniminivå för läsbarhet.
- Inga regressionsbuggar i quiz-state vid upprepade sessioner.
- Designreview och QA-signoff genomförda.
