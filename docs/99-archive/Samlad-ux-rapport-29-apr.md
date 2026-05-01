# HelioTrip — Samlad UX-rapport (29 apr)
*Sammanställd 2026-04-29 från tre rapporter: Claude, Gemini och Composer.*

---

## Syfte

Det här dokumentet slår ihop tidigare UX-analyser till en gemensam, prioriterad rapport utan dubbletter. Fokus ligger på:

- tydligare informationshierarki
- bättre upptäckbarhet av lärinnehåll
- högre läsbarhet
- roligare upplevelse utan ökad HUD-rörighet

---

## Övergripande bedömning

HelioTrip har stark visuell identitet och bra grundstruktur, men flera nya lärfunktioner har lagts ovanpå befintlig UI utan full ombalansering. Den största effekten blir duplicerad information, konkurrerande paneler och onödigt högt kognitivt brus, särskilt i desktop-lärläge och i mobilens lärflöden.

---

## Konsoliderad prioriteringslista

### Hög prioritet

0. **Planeten måste vara primärt fokus i viewporten**
   - I vissa lägen tar informationspaneler för stor visuell plats och kan trycka ner eller delvis täcka planeten.
   - **Risk:** appen upplevs som informationsyta i stället för ett utforskningsverktyg.
   - **Åtgärd:** inför en "planet först"-princip: flytta planeten högre upp när mycket HUD visas, skapa tydlig luft runt planeten och säkerställ att paneler inte överlappar planetens interaktionszon.

1. **Dubblerad planetinformation på desktop**
   - `PlanetPanel` förekommer i praktiken dubbelt när planet är vald (övre vänster + högerkolumn).
   - **Risk:** otydlig sanningskälla, splittrat fokus.
   - **Åtgärd:** behåll en primär panel (förslagsvis högerkolumn) och ersätt den andra med minimal indikator eller ta bort den.

2. **XP visas på flera ställen samtidigt**
   - `XpBadge` och `ProgressPanel` visar samma kärnstatus.
   - **Risk:** visuellt brus och redundans.
   - **Åtgärd:** låt en vy vara detaljkälla och den andra ett komprimerat summary-läge.

3. **Mobil: faktakort och quiz är svåra att hitta**
   - Lär-tabben leder främst till missioner, inte faktakort.
   - **Risk:** primärt pedagogiskt innehåll upptäcks sent.
   - **Åtgärd:** lägg in tydlig snabbväg/ledtext till fakta för vald planet direkt i lärsheet.

4. **PlanetPanel-flikar blir trånga på smala ytor**
   - Exempel: lång etikett för jämförelseflik.
   - **Risk:** sämre läsbarhet och upptäckbarhet.
   - **Åtgärd:** kortare etiketter (t.ex. "Storlek"), eller ikon + `aria-label`.

5. **QuizOverlay bör defensivt nollställa lokalt state vid nytt quiz**
   - Nuvarande beteende fungerar i dagens flöde, men är känsligt vid framtida refaktor.
   - **Risk:** gamla val/resultat följer med mellan quiz.
   - **Åtgärd:** reset i `useEffect` kopplad till quiz-id/open-state.

6. **Högerkolumn i lärläge blir för lång**
   - Progress, planetpanel och missionkort konkurrerar vertikalt.
   - **Risk:** viktiga delar hamnar utanför viewport utan tydlig scrollsignal.
   - **Åtgärd:** tydligare kollapslogik och bättre prioriteringsordning för paneler.

### Medel prioritet

7. **Destruktiva mission-åtgärder är för framträdande**
   - Avbryt/avsluta uppdrag ligger nära primära handlingar.
   - **Åtgärd:** nedtona, flytta sekundärt och/eller lägg bekräftelsesteg.

8. **För liten typografi på informationsbärande text**
   - `text-[10px]` används där innehåll behöver läsas tydligt.
   - **Åtgärd:** höj miniminivå till `text-xs` för informativa texter.

9. **Tomma tillstånd tar plats utan värde**
   - T.ex. achievements-sektion när inget är upplåst.
   - **Åtgärd:** dölj sektionen eller ersätt med kort motiverande CTA.

10. **Konstellationsberättelser hamnar för långt ner i mobilsheet**
    - Story-kort upptäcks sent när listan är lång.
    - **Åtgärd:** visa vald berättelse högre upp eller komprimera listan vid val.

11. **Lägesfeedback är för subtil**
    - Aktivt läge syns, men inte alltid tillräckligt tydligt.
    - **Åtgärd:** förstärk accent/indikator utan nya permanenta paneler.

12. **ScaleComparison saknar tydlig ledtext**
    - Knappgrupp utan introduktion kan upplevas som slumpmässig.
    - **Åtgärd:** lägg till enkel etikett, t.ex. "Jämför med:".

### Låg prioritet

13. **Svaga scroll-signaler i sheets/paneler**
    - **Åtgärd:** gradient-fade/overscroll-cues där relevant.

14. **`XpBadge` kan vara klickbar snabbväg**
    - **Åtgärd:** öppna/fokusera progressdetaljer från badgen.

15. **Textbredd i edge-cases**
    - Generellt bra nivå idag, men i bredare/liggande vyer kan vissa texter bli långa.
    - **Åtgärd:** överväg `max-w-prose` för längre brödtext.

16. **Motion tillgänglighet**
    - **Åtgärd:** säkerställ `prefers-reduced-motion` på centrala animationer.

---

## Läsbarhet: samlad slutsats

- Inga kritiska "för breda textrutor" i standardlayout.
- Största läsbarhetsproblemet är snarare **för liten text** än för bred text.
- Vissa edge-cases (tablet-landscape/bredare container) kan förbättras med textmaxbredd på längre stycken.

---

## Roligare upplevelse och längre speltid (retention)

*Källa: utökad analys i `claude-ux-rapport.md` — "Hur hade jag gjort appen roligare och svårare att lämna?"*

**Gemensam designprincip:** skapa en **fråga du vill ha svar på innan du lämnar appen** — narrativ, social, samlings- eller tidsbunden. Fakta blir då *svaret* på nyfikenheten, inte bara text att läsa.

### A. Snabba förbättringar utan ny HUD-rörighet

1. **Tydlig belöningsfeedback** — pulsering eller kort `+XP` vid quiz, fakta och achievements.
2. **Mikrointeraktioner vid lägesbyte** — tydlig men diskret skillnad mellan Utforska och Lär.
3. **Smarta hjälprutor** — kontextuell hjälp som tonar ut när flödet behärskas.
4. **Inspirerande tomma tillstånd** — motiverande nästa steg i stället för passiva "inget här ännu".

### B. Nyfikenhetsloopar och djupare engagemang

5. **Öppna loopar i copy och triggers** — korta ledtrådar som lockar till *ett steg till* (t.ex. hemligheter vid längre vistelse, mysterier mellan planeter, diskreta besöksstatistik om ni har data).

6. **Belöna uthållighet, inte bara ankomst** — tidsberoende upplåsning (t.ex. extra faktum efter 30–60 s kvar vid planet) så det lönar sig att stanna, inte bara "stämpla av".

7. **Dagens utmaning** — en pool med redaktionella frågor/observationer som roterar dagligen och använder befintlig data (positioner, jämförverktyg, tidshastighet). Ger **daglig anledning att öppna appen**.

8. **Kollektiv utforskning (lättvikt)** — utan chat eller tunga konton: diskreta rader som "många besökte X den här veckan" / populärt faktakort, om analytics tillåter.

9. **Stjärnkartan som samlingsalbum** — fler lager per stjärnbild (form, berättelse, valfri observation/badge); oupptäckta halvtransparenta — **Pokédex-känsla** utan ny huvudvy.

10. **Dr. Astra som narrativ motor** — proaktiva repliker vid zoom, milstolpar, lägesbyte (bygg på `NarrativeMessage` / strängdata — låg teknisk kostnad, hög personlighet).

11. **Streak för lärandevanor** — diskret räknare (t.ex. dagar i rad med minst ett avslutat quiz); stark retention-mekanik om den balanseras etiskt.

12. **Planeter som "händer"** — schemalagda narrativa **rymdväder**-events (veckodag + copy + ev. quiz + visuell highlight på planet), utan krav på realtidsbackend.

13. **Synliga luckor** — checklista över alla kroppar med tydliga "saknas"-silhuetter; **kompletteringsdrift** starkare än bara "besökt 15/18".

---

## Rekommenderad implementeringsordning

1. Eliminera dubbla paneler och XP-dubletter.
2. Förbättra mobilens väg till faktakort/quiz.
3. Höj läsbarhet (`text-xs`-golv) och justera destruktiva actions.
4. Förstärk lägesfeedback och mikrobelöningar.
5. Polera low-priority tillgänglighet och edge-cases.
6. **Retention:** börja med A (mikrofeedback + tomma tillstånd), sedan **Dagens utmaning** och **Dr. Astra**-triggers; utöka med uthållighetsbelöningar, streak och samlingsalbum när grunden sitter.

---

## Kort slutsats

Den största vinsten kommer inte från fler komponenter, utan från att förenkla hierarkin: en tydlig informationskälla per område, snabbare väg till lärinnehåll och bättre feedback när användaren gör rätt saker. **Därefter** kan retention byggas med nyfikenhetsloopar, återkommande utmaningar och tydliga "saknas"-mål — så appen känns som utforskning och mysterium, inte bara informationspaneler.
