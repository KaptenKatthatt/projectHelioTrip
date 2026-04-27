# ProjectHelioTrip – Agentreferens

Detta dokument är den gemensamma sanningskällan för hur produkten ska fungera och se ut.
Alla agenter ska följa detta dokument vid implementation, refaktorering och buggrättning.

## 1) Produktmål

ProjectHelioTrip ska ge en tydlig, responsiv och visuellt stark upplevelse av solsystemet i 3D.
Användaren ska kunna utforska planeter med naturliga kamerakontroller i stil med moderna 3D-kartor.

## 2) Interaktionskrav (MVP)

### 2.1 Planetval

- Användaren ska kunna välja en planet via planetlistan i UI:t.
- Vald planet ska markeras visuellt i listan och i scenen.
- Kameran ska fokusera vald planet på ett mjukt och förutsägbart sätt.

### 2.2 Rotera vald planet (Google Earth-känsla)

- När en planet är vald och användaren klickar och håller på planeten ska planeten kunna roteras med musdrag.
- Horisontellt drag ska rotera runt planetens vertikala axel.
- Vertikalt drag ska rotera runt planetens horisontella axel.
- Rotationen ska kännas direkt och stabil (ingen hackighet eller oväntade hopp).
- När användaren släpper musknappen ska den aktiva manuella rotationen avslutas.

### 2.3 Zoom med scroll (dolly in/ut)

- Scrollhjulet ska dollya kameran in/ut mot vald planet.
- Zoom ska vara mjuk och ha tydliga min-/maxgränser för att undvika clipping och desorientering.
- Zoom ska behålla fokus på vald planet under hela dolly-rörelsen.

## 3) UX-principer

- Interaktioner ska vara intuitiva utan behov av instruktion för grundfunktioner.
- Kameraövergångar ska vara mjuka (ingen hård snap om det inte uttryckligen behövs).
- UI:t ska vara lugnt och stödja progression: välj planet -> utforska -> zooma -> rotera.
- Beteendet ska vara konsekvent mellan planeter: samma gester ska ge samma resultat.

## 4) Visuell riktning

- Estetiken ska vara realistisk men läsbar: texturer och ljus får vara dramatiska men får inte minska tydligheten.
- Vald planet ska alltid vara enkel att identifiera (highlight/outline/label beroende på implementation).
- Bakgrund och effekter ska stödja fokuset på planeten, inte stjäla uppmärksamhet.

## 5) Tekniska riktlinjer för agenter

- Stack: React + TypeScript + React Three Fiber + drei.
- Globalt state hanteras med zustand (inte React Context för global app-state).
- Prestanda i R3F är prioriterat:
  - Ingen onödig allokering i `useFrame`.
  - Memoisera tunga beräkningar.
  - Håll interaktionslogik deterministisk och enkel att felsöka.
- Undvik breaking changes i befintliga kontroller utan att uppdatera detta dokument.
- **Kodkommentarer ska alltid skrivas på engelska.** Detta gäller alla typer av kommentarer i källkod (`//`, `/* */`, JSDoc/TSDoc) i filer under `src/`, `api/`, `scripts/`, `e2e/` och övriga kodfiler. Användarvänd text (i18n-strängar, UI-texter) får självklart vara på svenska/engelska enligt lokalisering. Projektdokumentation (denna fil och andra `.md`) får vara på svenska.

## 6) Definition of Done per feature

En feature anses klar när:

- Beteendet följer relevanta krav i detta dokument.
- Beteendet är testat manuellt i appen (desktop, mus + scroll).
- Ingen regressionsbugg introduceras i befintlig kamera- eller planetinteraktion.
- Kodstil och struktur följer projektets regler.

## 7) Acceptance Criteria – Planetinteraktion (först att bygga klart)

1. När användaren väljer en planet i listan får planeten fokus i scenen.
2. När användaren klickar och håller på vald planet och drar musen roteras planeten i dragets riktning.
3. När användaren scrollar in/ut medan planeten är vald dolly-zoomar kameran mjukt med rimliga gränser.
4. Interaktionen känns stabil och förutsägbar utan oväntade kamerahopp.

## 8) Ändringspolicy

- Om beteendet i produkten avviker från detta dokument ska implementationen justeras, eller dokumentet uppdateras i samma arbete.
- Nya stora interaktionskrav ska läggas till som nya avsnitt med tydliga acceptance criteria.

---

Senast uppdaterad: 2026-04-24
