# HelioTrip — Gemini UX/UI-rapport
*Framtagen 2026-04-29 av Gemini CLI i rollen som senior frontend- och UX-expert.*

---

## Övergripande intryck
HelioTrip är en visuellt imponerande applikation med en stark rymdkänsla. Glassmorfismen (glasaktiga paneler) skapar en modern och futuristisk estetik som passar temat perfekt. Inlärningssystemet är väl genomtänkt, men lider av "feature creep" där nya funktioner har lagts till utan att den övergripande layouten har balanserats om.

Här följer min analys baserad på dina specifika frågor och min expertgranskning.

---

## 1. Läsbarhet och Textbredd
**Fråga:** *Är där någon textruta som är för bred att läsa?*

**Analys:** 
Generellt är textrutorna väl begränsade (`max-w-sm` eller `max-w-md`), vilket ger en radlängd på ca 45–65 tecken. Detta är nära det gyllene snittet för läsbarhet (ca 66 tecken).

**Problem:** 
*   **Faktakorten:** I `FactCard` saknas en explicit maxbredd på själva brödtexten. Om komponenten skulle återanvändas i en bredare vy än den nuvarande sidopanelen skulle texten snabbt bli svårläst.
*   **About-dialogen:** Texten i `AboutDialog` ligger på gränsen. Den använder `max-w-md` (448px). Med `text-sm` (14px) blir raderna ibland lite för långa för att ögat enkelt ska hitta tillbaka till nästa rad.

**Förbättring:** 
*   Använd `max-w-prose` (vilket i Tailwind motsvarar ca 65ch) för alla längre textstycken. Det garanterar att texten aldrig blir för bred, oavsett skärmstorlek eller container.

---

## 1.5 Planetfokus och viewport-hierarki
**Fråga:** *Tar informationspanelerna för mycket uppmärksamhet jämfört med planeterna?*

**Analys:**
Ja, i vissa lägen blir den nedre informationsytan så dominant att planeten hamnar för nära panelen eller delvis upplevs täckt. Det motverkar appens kärnsyfte: att utforska solsystemet visuellt och interaktivt.

**Problem:**
*   **Visuell konkurrens:** Informationskortet drar fokus från planeten.
*   **Minskad manöveryta:** När planeten ligger för lågt blir det sämre "luft" runt objektet för rotation och observation.
*   **Upplevelseglapp:** Appen känns mer som en informationsdashboard än ett utforskningsverktyg.

**Förbättring:**
*   **Planet först-princip:** Definiera planeten som primärt fokusobjekt i viewporten.
*   **Dynamisk omkomposition:** När hög informationsdensitet visas, flytta planeten högre upp i bild för att behålla fri yta runt den.
*   **Safe area för 3D-objekt:** Sätt en nedre HUD-gräns där planetens interaktionszon inte ska överlappas.

---

## 2. Struktur och Placering
**Fråga:** *Är där verkligen rätt saker på rätt plats?*

**Analys:** 
Det finns en viss förvirring i den visuella hierarkin på desktop.

**Problem:**
*   **Dubbla Planetpaneler:** På desktop visas planetinformationen både uppe till vänster (kollapsad som default) och i den högra sidopanelen när en planet väljs. Detta är förvirrande. Var ska jag titta?
*   **XP-duplicering:** `XpBadge` i topbaren visar XP, och `ProgressPanel` i sidopanelen visar XP. Det tar upp onödig vertikal yta i sidopanelen.
*   **Wikipedia-knappen:** I `PlanetPanel` är Wikipedia-knappen nästan mer visuell dominant än de pedagogiska flikarna ("Fakta", "Jämför").

**Förbättring:**
*   **Konsolidera:** Ta bort den övre vänstra planetpanelen på desktop helt. Låt den högra sidopanelen vara den enda "sanningskällan" för aktivt objekt.
*   **Flytta XP:** Om `XpBadge` finns i topbaren (vilket den bör, som en global status), kan XP-sektionen i `ProgressPanel` göras betydligt mer kompakt eller döljas helt till förmån för achievements.

---

## 3. Informationsbrus och "Inforutor"
**Fråga:** *Är inforutor uppe i vissa ställen i appen som inte behöver vara där?*

**Analys:**
Appen är lite för hjälpsam med permanenta instruktioner.

**Problem:**
*   **FreeFlightHint & FreeFlightHelp:** Dessa rutor ligger ofta kvar för länge. När användaren väl har lärt sig hur man navigerar (vilket går fort i en interaktiv 3D-miljö) blir de bara i vägen för upplevelsen.
*   **"Pick a mission":** När man är i Lär-läge men inte har valt ett uppdrag, tar `MissionCard` upp stor plats bara för att säga "Välj ett uppdrag".

**Förbättring:**
*   **Kontextuell hjälp:** Gör `FreeFlightHint` "smart". Den bör tona ut helt efter 10 sekunders aktiv rörelse och bara komma tillbaka om användaren står stilla i mer än 1 minut.
*   **Progressivt avslöjande:** I stället för att visa hela `MissionCard` med en lista när inget uppdrag är valt, visa bara en liten badge: "5 uppdrag tillgängliga - [Välj]".

---

## 4. Att göra appen roligare (Utan rörighet)
**Fråga:** *Hur du skulle förbättra den och göra den mer rolig att använda, utan att göra den rörig?*

**Analys:**
För att öka "fun-factorn" utan att det blir rörigt bör vi fokusera på **micro-interactions** och **visuell feedback**.

**Förslag:**
1.  **Levande Lägesbyten:** När användaren byter mellan "Utforska" och "Lär", räcker det inte med en liten färglist. Gör en subtil animering av 3D-scenens efterbehandling (post-processing). I Lär-läge kan färgerna bli lite mer mättade eller en subtil "skanner-effekt" tona in över planeterna.
2.  **XP-Feedback:** När man klarar ett quiz eller låser upp en achievement, bör XP-siffran i topbaren "pulsera" eller visa en liten flytande text (`+50 XP`) som tonar ut. Det ger omedelbar dopaminrespons.
3.  **Interaktiva Faktakort:** Gör faktakorten i `FactCardDeck` klickbara/vändbara. Det skapar en känsla av fysiska samlarkort vilket gör det roligare att samla på kunskap.
4.  **Haptisk känsla på mobil:** Lägg till små vibrationer (om webbläsaren tillåter) eller mer elastiska "fjäder-animeringar" (spring physics) när man drar upp bottom sheets.
5.  **Stjärnbilds-berättelser:** `ConstellationStoryCard` är fantastiskt innehåll. Gör det mer framträdande genom att låta stjärnbilden "lysa upp" extra mycket i 3D-vyn när man läser dess historia.

---

## Sammanfattning av rekommenderade åtgärder

| Åtgärd | Typ | Effekt |
| :--- | :--- | :--- |
| **Ta bort övre planetpanel på desktop** | Layout | Minskar kognitiv belastning, renare UI. |
| **Gör XpBadge klickbar** | Interaktion | Snabbväg till framstegsdetaljer. |
| **Inför `max-w-prose` på text** | Läsbarhet | Bättre ergonomi för ögonen vid läsning. |
| **Kontextuella hjälprutor** | UX | Mindre visuellt brus efter "onboarding". |
| **Micro-animations för XP** | Gamification | Ökad glädje och feedback vid lärande. |
| **Visa alltid flikar i PlanetPanel** | Discovery | Gör det tydligt att det finns mer att upptäcka (även om de är låsta). |

---
*Rapporten är sammanställd med fokus på att bevara HelioTrips unika karaktär samtidigt som den görs mer professionell och engagerande.*
