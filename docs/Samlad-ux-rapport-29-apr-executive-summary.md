# HelioTrip — Executive Summary (29 apr)

## Målet i en mening
HelioTrip har stark visuell kvalitet och bra pedagogisk potential, men UX-effekten hämmas av dubblerad information, otydlig hierarki och svag upptäckbarhet av lärinnehåll på mobil.

## Nuvarande läge

- Appen upplevs modern och tematisk med tydlig rymdkänsla.
- Lärfunktioner (fakta, quiz, progression) finns, men presenteras ibland i konkurrerande ytor.
- Resultatet blir högre kognitiv belastning än nödvändigt, särskilt i desktop-lärläge.

## Viktigaste problemen (affärs- och upplevelsepåverkan)

1. **Dubbla informationskällor för samma sak**
   - Planetinfo och XP syns i flera paneler samtidigt.
   - Påverkan: osäkerhet om var användaren ska titta, ökat visuellt brus.

2. **Planeten får för lite visuell prioritet i viewporten**
   - I svaga lägen hamnar planeten för nära eller delvis bakom informationsytor.
   - Påverkan: utforskningseffekten minskar och interaktion runt planeten blir sämre.

3. **Mobilflödet till pedagogiskt innehåll är för djupt**
   - Faktakort och quiz kräver flera steg och är svåra att upptäcka från lärläget.
   - Påverkan: lägre användning av kärninnehåll, sämre lärutbyte.

4. **Läsbarhetsfriktion i små typstorlekar**
   - Informationsbärande text i 10 px är svår att läsa för målgruppen.
   - Påverkan: ökad mental trötthet, sämre tillgänglighet.

5. **Desktopkolumnen i lärläge blir överlastad**
   - Flera stora paneler konkurrerar vertikalt.
   - Påverkan: viktiga funktioner hamnar utanför viewport och upptäcks sent.

## Strategisk riktning

Fokusera på **färre, tydligare informationsytor** i stället för fler komponenter:

- en primär källa per informationsdomän (planet, progression, mission)
- snabbare väg till fakta/quiz på mobil
- bättre läsbarhet som standard
- tydlig men diskret feedback när användaren gör framsteg

## Rekommenderad plan i 3 faser

### Fas 1: Rensa hierarkin (högst effekt, låg risk)
- ta bort eller minimera dubbla planetpaneler
- reducera XP-dubblering mellan topbar och progresspanel
- säkra "planet först"-komposition så planeten ligger högre med fri yta när HUD är tät
- gör mobilens väg till faktakort/quiz direkt och tydlig

### Fas 2: Öka tydlighet och trygghet
- höj min-typografi till läsbar nivå för informativ text
- nedtona destruktiva mission-aktioner och lägg bekräftelse där relevant
- förbättra synlighet för scrollbara ytor och aktivt läge

### Fas 3: Höj retention utan HUD-rörighet
*Utökad enligt `claude-ux-rapport.md` — spelpsykologi och "nästa intressanta steg".*

**Grundprincip:** skapa en **öppen fråga** innan användaren lämnar (nyfikenhetsloop). Fakta är svaret — inte bara innehåll att scrolla igenom.

**Snabba vinster (befintliga ytor):**
- mikrofeedback vid XP, quiz och achievements
- kontextuella hjälprutor som tonar ut efter onboarding
- tydligare läges- och framstegskänsla

**Djupare engagemang (prioritera efter Fas 1–2):**
- **uthållighetsbelöningar** vid planet (t.ex. extra faktum efter att man stannat kvar en stund) — motverkar enbart "stämpla av"
- **Dagens utmaning** från en redaktionell pool (befintlig data, daglig anledning att öppna appen)
- **lättvikt social proof** om data finns (t.ex. populära besök/faktakort) — utan chat eller tunga konton
- **stjärnkarta som samlingsalbum** (fler lager per stjärnbild, tydliga "saknas")
- **Dr. Astra proaktivt** — korta repliker vid kontext (zoom, milstolpar, lägesbyte); bygger personlig konversation
- **streak** för lärandevanor (diskret; balansera etiskt)
- **schemalagda narrativa events** ("rymdväder" per veckodag + ev. quiz + highlight på planet)
- **synlig kompletteringslista** över alla kroppar (luckor driver starkare motivation än bara en siffra)

## Förväntat utfall

- snabbare orientering i UI
- högre upptäckbarhet av lärfunktioner
- bättre läsbarhet för målgruppen
- mer motiverande progression utan visuellt överflöd
- **längre och återkommande användning** när nyfikenhet, rutin och små belöningar förstärker utforskningen

## Beslutsunderlag

Det här är en konsolidering av tre separata UX-granskningar (Claude, Gemini, Composer) med dubbletter borttagna och prioriteringar harmoniserade. Retention-avsnittet i Claude-rapporten är infört i denna sammanfattning som produkt- och redesign-underlag.
