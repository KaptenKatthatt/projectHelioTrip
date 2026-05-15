import type { BodyId } from '../bodies';
import { SUN_FACT_CARDS } from './factCardData/sun';
import { MERCURY_FACT_CARDS } from './factCardData/mercury';
import { VENUS_FACT_CARDS } from './factCardData/venus';
import { EARTH_FACT_CARDS } from './factCardData/earth';
import { MARS_FACT_CARDS } from './factCardData/mars';
import { JUPITER_FACT_CARDS } from './factCardData/jupiter';
import { SATURN_FACT_CARDS } from './factCardData/saturn';

export type FactCardLevel = 'middle' | 'upper' | 'both';

export type FactCard = {
  readonly id: string;
  readonly bodyId: BodyId;
  readonly icon: string;
  readonly level: FactCardLevel;
  readonly title: { readonly sv: string; readonly en: string };
  readonly body: { readonly sv: string; readonly en: string };
};

const FACT_CARDS: ReadonlyArray<FactCard> = [
  ...SUN_FACT_CARDS,
  ...MERCURY_FACT_CARDS,
  ...VENUS_FACT_CARDS,
  ...EARTH_FACT_CARDS,
  ...MARS_FACT_CARDS,
  ...JUPITER_FACT_CARDS,
  ...SATURN_FACT_CARDS,
  // URANUS
  {
    id: 'uranus_tilt',
    bodyId: 'uranus',
    icon: '🔄',
    level: 'both',
    title: { sv: 'En planet som ligger ner', en: 'A planet lying on its side' },
    body: {
      sv: 'Uranus lutar 98 grader — planeten kretsar nästan på sidan. Det innebär att varje pol har 42 år av konstant solsken följt av 42 år av totalt mörker.',
      en: 'Uranus tilts 98 degrees — the planet essentially orbits on its side. This means each pole has 42 years of constant sunlight followed by 42 years of total darkness.',
    },
  },
  {
    id: 'uranus_ice_giant',
    bodyId: 'uranus',
    icon: '🌊',
    level: 'middle',
    title: { sv: 'Is som inte är is', en: "Ice that isn't really ice" },
    body: {
      sv: 'Uranus kallas en "isjätte" — men under gasskiktet finns inte vanlig is utan ett hav av supervarm, superkomprimerat vatten och ammoniak under extremt tryck.',
      en: 'Uranus is called an "ice giant" — but beneath the gas layer isn\'t regular ice but a sea of super-hot, super-compressed water and ammonia under extreme pressure.',
    },
  },
  {
    id: 'uranus_colour',
    bodyId: 'uranus',
    icon: '🔵',
    level: 'middle',
    title: { sv: 'Varför är Uranus blågrön?', en: 'Why is Uranus blue-green?' },
    body: {
      sv: 'Uranus blågrön färg kommer från metan i atmosfären, som absorberar rött ljus och reflekterar blått och grönt.',
      en: "Uranus's blue-green colour comes from methane in the atmosphere, which absorbs red light and reflects blue and green.",
    },
  },
  {
    id: 'uranus_quiet',
    bodyId: 'uranus',
    icon: '🌀',
    level: 'upper',
    title: { sv: 'Förvånansvärt lugn', en: 'Surprisingly calm' },
    body: {
      sv: 'Trots att Uranus är en gasjätte är den förvånansvärt slät och saknar tydliga stormmönster jämfört med Jupiter och Saturnus. Varför är ännu inte klarlagt.',
      en: 'Despite being a gas giant, Uranus is surprisingly featureless and lacks clear storm patterns compared to Jupiter and Saturn. Why this is the case is still not fully understood.',
    },
  },

  // NEPTUNE
  {
    id: 'neptune_winds',
    bodyId: 'neptune',
    icon: '🌬️',
    level: 'both',
    title: {
      sv: 'Starkaste vindarna i solsystemet',
      en: 'The strongest winds in the solar system',
    },
    body: {
      sv: 'Neptunus har de starkaste vindarna av alla planeter — upp till 2 100 km/h. Det är märkligt eftersom Neptunus är så långt från Solen och tar emot lite energi.',
      en: 'Neptune has the strongest winds of any planet — up to 2,100 km/h. This is puzzling because Neptune is so far from the Sun and receives little energy.',
    },
  },
  {
    id: 'neptune_blue',
    bodyId: 'neptune',
    icon: '🔵',
    level: 'middle',
    title: { sv: 'Den blåaste planeten', en: 'The bluest planet' },
    body: {
      sv: 'Neptunus är den djupblåaste planeten i solsystemet. Precis som Uranus beror det på metan i atmosfären — men Neptunus är tydligt mörkare blå.',
      en: "Neptune is the most intensely blue planet in the solar system. Like Uranus it's due to methane in the atmosphere — but Neptune is noticeably darker blue.",
    },
  },
  {
    id: 'neptune_voyage',
    bodyId: 'neptune',
    icon: '🛤️',
    level: 'middle',
    title: { sv: '12 år för att nå dit', en: '12 years to get there' },
    body: {
      sv: 'Det tog rymdsonden Voyager 2 tolv år att nå Neptunus efter att den lämnade Jorden 1977. Den flög förbi 1989 och är fortfarande den enda sond som besökt planeten.',
      en: 'It took the Voyager 2 spacecraft twelve years to reach Neptune after leaving Earth in 1977. It flew past in 1989 and remains the only spacecraft ever to have visited the planet.',
    },
  },
  {
    id: 'neptune_triton',
    bodyId: 'neptune',
    icon: '🌑',
    level: 'both',
    title: { sv: 'Bakvänd måne', en: 'A backwards moon' },
    body: {
      sv: 'Neptunus största måne Triton rör sig bakvänt — motsatt Neptunus rotation. Det tyder på att Triton inte bildades runt Neptunus utan fångades in från det yttre solsystemet.',
      en: "Neptune's largest moon Triton orbits backwards — opposite to Neptune's rotation. This suggests Triton didn't form around Neptune but was captured from the outer solar system.",
    },
  },

  // PLUTO
  {
    id: 'pluto_dwarf',
    bodyId: 'pluto',
    icon: '🌑',
    level: 'both',
    title: { sv: 'Inte längre en planet', en: 'No longer a planet' },
    body: {
      sv: 'Pluto klassades som planet från 1930 till 2006, då astronomerna omdefinierade "planet". Pluto har inte rensat sin omloppsbana på andra objekt och är nu en dvärgplanet.',
      en: 'Pluto was classed as a planet from 1930 until 2006, when astronomers redefined "planet." Pluto hasn\'t cleared its orbit of other objects — so it\'s now a dwarf planet.',
    },
  },
  {
    id: 'pluto_heart',
    bodyId: 'pluto',
    icon: '🏔️',
    level: 'middle',
    title: { sv: 'Hjärtat på Pluto', en: "Pluto's heart" },
    body: {
      sv: 'Pluto har ett gigantiskt hjärtformat område av ren kväveseis kallat Tombaugh Regio. Det hittades av rymdsonden New Horizons 2015 — 85 år efter att Pluto upptäcktes.',
      en: 'Pluto has a giant heart-shaped region of pure nitrogen ice called Tombaugh Regio. It was discovered by the New Horizons spacecraft in 2015 — 85 years after Pluto itself was found.',
    },
  },
  {
    id: 'pluto_cold',
    bodyId: 'pluto',
    icon: '❄️',
    level: 'middle',
    title: { sv: 'Nästan absolut nollpunkt', en: 'Almost absolute zero' },
    body: {
      sv: 'Temperaturen på Pluto är ungefär –230 °C. Absoluta nollpunkten — kallaste möjliga temperaturen — är –273 °C. Pluto är alltså bara 43 grader från det fysikaliska bottnet.',
      en: 'The temperature on Pluto is about –230 °C. Absolute zero — the coldest possible temperature — is –273 °C. So Pluto is just 43 degrees away from the physical bottom.',
    },
  },
  {
    id: 'pluto_new_horizons',
    bodyId: 'pluto',
    icon: '🔭',
    level: 'upper',
    title: { sv: 'Den sista att besökas', en: 'The last to be visited' },
    body: {
      sv: 'New Horizons lämnade Jorden 2006 och flög förbi Pluto i juli 2015 — en resa på 9,5 år. Bilderna visade en förvånansvärt aktiv värld med berg, slätter och atmosfär.',
      en: 'New Horizons left Earth in 2006 and flew past Pluto in July 2015 — a 9.5-year journey. The images revealed a surprisingly geologically active world with mountains, plains, and an atmosphere.',
    },
  },

  // MOON
  {
    id: 'moon_locked',
    bodyId: 'moon',
    icon: '🌕',
    level: 'middle',
    title: { sv: 'Varför ser vi alltid samma sida?', en: 'Why do we always see the same side?' },
    body: {
      sv: 'Månen roterar precis lika snabbt som den kretsar runt Jorden, så vi ser alltid samma sida. Det kallas "låst rotation" och uppstår när tyngdkraften saktar ner ett objekts snurr.',
      en: 'The Moon rotates at exactly the same speed as it orbits Earth, so we always see the same face. This is called "tidal locking" and happens when gravity gradually slows an object\'s spin over time.',
    },
  },
  {
    id: 'moon_tides',
    bodyId: 'moon',
    icon: '🌊',
    level: 'middle',
    title: { sv: 'Månens drag skapar tidvatten', en: "The Moon's pull creates tides" },
    body: {
      sv: 'Månens gravitation drar i Jordens hav och skapar tidvatten — havet höjs och sänks upp till tolv meter vid vissa kuster.',
      en: "The Moon's gravity pulls on Earth's oceans, creating tides — the sea rises and falls by up to twelve metres at some coasts.",
    },
  },
  {
    id: 'moon_visited',
    bodyId: 'moon',
    icon: '🚀',
    level: 'middle',
    title: {
      sv: 'Det enda stället utanför Jorden vi besökt',
      en: 'The only place beyond Earth humans have visited',
    },
    body: {
      sv: 'Månen är det enda himmelsobjektet utanför Jorden där människor har landat. Neil Armstrong och Buzz Aldrin klev ner den 20 juli 1969. Totalt tolv astronauter har gått på Månen.',
      en: 'The Moon is the only celestial body beyond Earth where humans have landed. Neil Armstrong and Buzz Aldrin stepped down on July 20, 1969. Twelve astronauts in total have walked on the Moon.',
    },
  },
  {
    id: 'moon_origin',
    bodyId: 'moon',
    icon: '💥',
    level: 'upper',
    title: { sv: 'Månens våldsamma ursprung', en: "The Moon's violent origin" },
    body: {
      sv: 'Månen bildades troligtvis när en Mars-stor kropp kraschade in i den unga Jorden för 4,5 miljarder år sedan. Debriset kastades ut i omloppsbana och klumpade ihop sig till vår Måne.',
      en: 'The Moon most likely formed when a Mars-sized body smashed into the young Earth 4.5 billion years ago. The debris was thrown into orbit and clumped together to form our Moon.',
    },
  },

  // IO
  {
    id: 'io_volcanoes',
    bodyId: 'io',
    icon: '🌋',
    level: 'both',
    title: {
      sv: 'Mest vulkanisk kropp i solsystemet',
      en: 'The most volcanically active body in the solar system',
    },
    body: {
      sv: 'Io är den mest vulkaniskt aktiva kroppen i hela solsystemet. Det pågår alltid aktiva utbrott — hundratals vulkaner syns ibland simultant från rymden.',
      en: 'Io is the most volcanically active body in the entire solar system. There are always active eruptions — hundreds of volcanoes can sometimes be seen simultaneously from space.',
    },
  },
  {
    id: 'io_tidal_heating',
    bodyId: 'io',
    icon: '🔥',
    level: 'upper',
    title: { sv: 'Uppvärmd av tidvattenkrafter', en: 'Heated by tidal forces' },
    body: {
      sv: 'Ios vulkanism orsakas av Jupiters gravitationskrafter som ständigt knådar och tänjer på månens inre — som att böja ett gem fram och tillbaka tills det blir varmt.',
      en: "Io's volcanism is caused by Jupiter's gravity constantly kneading and stretching the moon's interior — like bending a paperclip back and forth until it gets warm.",
    },
  },
  {
    id: 'io_sulphur',
    bodyId: 'io',
    icon: '🌈',
    level: 'middle',
    title: { sv: 'En mångfärgad svavelyta', en: 'A multicoloured sulphur surface' },
    body: {
      sv: 'Ios yta täcks av svavel i många färger — gult, orange, rött och svart — beroende på vilken temperatur svavlet stelnat vid.',
      en: "Io's surface is covered in sulphur in many colours — yellow, orange, red and black — depending on the temperature at which it solidified.",
    },
  },
  {
    id: 'io_radiation',
    bodyId: 'io',
    icon: '☢️',
    level: 'upper',
    title: { sv: 'Badad i dödlig strålning', en: 'Bathed in deadly radiation' },
    body: {
      sv: 'Io befinner sig djupt inne i Jupiters intensiva strålningsbälten. En astronaut utan skydd skulle få en livsfarlig stråldos på bara några timmar.',
      en: "Io sits deep inside Jupiter's intense radiation belts. An unprotected astronaut would receive a lethal radiation dose in just a few hours.",
    },
  },

  // EUROPA
  {
    id: 'europa_ocean',
    bodyId: 'europa',
    icon: '🌊',
    level: 'both',
    title: { sv: 'Ett hav gömt under isen', en: 'An ocean hidden beneath the ice' },
    body: {
      sv: 'Under Europas isiga yta döljer sig ett flytande hav som kan innehålla mer vatten än alla Jordens hav tillsammans. Det hålls flytande av värme från Jupiters tidvattenkrafter.',
      en: "Beneath Europa's icy surface hides a liquid ocean that may contain more water than all of Earth's oceans combined. It's kept liquid by heat from Jupiter's tidal forces.",
    },
  },
  {
    id: 'europa_life',
    bodyId: 'europa',
    icon: '🔬',
    level: 'middle',
    title: { sv: 'Kanske finns liv under isen', en: 'Life might exist beneath the ice' },
    body: {
      sv: 'Europa är ett av de mest lovande ställena att söka efter liv utanför Jorden. Havet under isen kan ha rätt förutsättningar — värme, vatten och kemi — för enkla organismer.',
      en: 'Europa is one of the most promising places to search for life beyond Earth. The ocean beneath the ice may have the right conditions — heat, water and chemistry — for simple organisms to survive.',
    },
  },
  {
    id: 'europa_cracks',
    bodyId: 'europa',
    icon: '❄️',
    level: 'middle',
    title: { sv: 'Sprickor i isen', en: 'Cracks in the ice' },
    body: {
      sv: 'Europas yta är täckt av långa sprickor och rödbruna linjer. De bildas när isskorpan rör sig och böjs av trycket från det varma havet under.',
      en: "Europa's surface is covered in long cracks and reddish-brown lines. They form as the ice shell moves and flexes under pressure from the warm ocean below.",
    },
  },
  {
    id: 'europa_ice_thickness',
    bodyId: 'europa',
    icon: '🧊',
    level: 'upper',
    title: { sv: 'Isskorpa och djuphav', en: 'Ice shell and deep ocean' },
    body: {
      sv: 'Europas isskorpa är uppskattad till 15–25 km tjock. Under den tror forskarna att havet är 60–150 km djupt — tre till åtta gånger djupare än Jordens Marianergraven.',
      en: "Europa's ice shell is estimated to be 15–25 km thick. Beneath it, researchers believe the ocean is 60–150 km deep — three to eight times deeper than Earth's Mariana Trench.",
    },
  },

  // GANYMEDE
  {
    id: 'ganymede_biggest',
    bodyId: 'ganymede',
    icon: '🏆',
    level: 'both',
    title: { sv: 'Störst av alla månar', en: 'Largest of all moons' },
    body: {
      sv: 'Ganymedes är den största månen i hela solsystemet — till och med större än planeten Merkurius. Ändå kretsar den runt Jupiter, inte runt Solen.',
      en: 'Ganymede is the largest moon in the entire solar system — even bigger than the planet Mercury. Yet it orbits Jupiter, not the Sun.',
    },
  },
  {
    id: 'ganymede_magnetic',
    bodyId: 'ganymede',
    icon: '🧲',
    level: 'upper',
    title: {
      sv: 'Den enda månen med eget magnetfält',
      en: 'The only moon with its own magnetic field',
    },
    body: {
      sv: 'Ganymedes är den enda månen i solsystemet med ett eget magnetfält. Det skapar ett mini-polarsken ovanpå Jupiters enorma polarsken.',
      en: "Ganymede is the only moon in the solar system with its own magnetic field. It creates a mini aurora on top of Jupiter's enormous aurora.",
    },
  },
  {
    id: 'ganymede_hidden_ocean',
    bodyId: 'ganymede',
    icon: '🌊',
    level: 'both',
    title: { sv: 'Ocean djupare ner', en: 'An ocean even deeper down' },
    body: {
      sv: 'Under Ganymedes yta döljer sig sannolikt ett saltvattensoceanen. Rymdteleskopet Hubble hittade indikationer via polarskenets rörelser.',
      en: "Beneath Ganymede's surface likely hides a saltwater ocean. The Hubble Space Telescope found evidence through the motion of its auroras.",
    },
  },
  {
    id: 'ganymede_terrain',
    bodyId: 'ganymede',
    icon: '🪨',
    level: 'middle',
    title: { sv: 'Blandat landskap', en: 'Mixed landscape' },
    body: {
      sv: 'Ganymedes yta har två sorters terräng: mörkt, gammalt krattat land och ljust, yngre land med parallella åsar — tecken på geologisk aktivitet.',
      en: "Ganymede's surface has two types of terrain: dark, ancient heavily cratered land, and bright, younger terrain with parallel ridges — signs of geological activity.",
    },
  },

  // CALLISTO
  {
    id: 'callisto_craters',
    bodyId: 'callisto',
    icon: '🕳️',
    level: 'middle',
    title: { sv: 'Det mest kratrade objektet', en: 'The most cratered object' },
    body: {
      sv: 'Callisto är det mest kratrade objektet i solsystemet. Ytan har inte förändrats på miljarder år — en fryst ögonblicksbild av solsystemets barndom.',
      en: "Callisto is the most cratered object in the solar system. The surface hasn't changed for billions of years — a frozen snapshot of what the solar system looked like in its infancy.",
    },
  },
  {
    id: 'callisto_radiation_safe',
    bodyId: 'callisto',
    icon: '☣️',
    level: 'upper',
    title: { sv: 'Skyddad från Jupiters strålning', en: "Sheltered from Jupiter's radiation" },
    body: {
      sv: 'Callisto befinner sig utanför Jupiters intensiva inre strålningsbälten. Det gör den till en av de mer realistiska kandidaterna för en framtida bemannad utpost nära Jupiter.',
      en: "Callisto lies outside Jupiter's intense inner radiation belts. This makes it one of the more realistic candidates for a future crewed outpost in the Jupiter system.",
    },
  },
  {
    id: 'callisto_possible_ocean',
    bodyId: 'callisto',
    icon: '🌊',
    level: 'both',
    title: { sv: 'Möjligt hav under ytan', en: 'A possible ocean below the surface' },
    body: {
      sv: 'Trots sin uråldriga yta tyder magnetmätningar på att Callisto kan gömma ett flytande hav långt under ytan — oväntat för en så till synes inaktiv måne.',
      en: 'Despite its ancient, undisturbed surface, magnetic measurements suggest Callisto may hide a liquid ocean far underground — unexpected for such an apparently inactive moon.',
    },
  },
  {
    id: 'callisto_no_magnetic',
    bodyId: 'callisto',
    icon: '💡',
    level: 'upper',
    title: { sv: 'Inget eget magnetfält', en: 'No magnetic field of its own' },
    body: {
      sv: 'Till skillnad från Ganymedes har Callisto inget eget magnetfält, vilket tyder på en mer homogen inre struktur som aldrig separerat i en järnkärna.',
      en: 'Unlike Ganymede, Callisto has no magnetic field of its own, suggesting a more uniform interior that never separated into an iron core surrounded by a mantle.',
    },
  },

  // TITAN
  {
    id: 'titan_lakes',
    bodyId: 'titan',
    icon: '🌊',
    level: 'both',
    title: { sv: 'Sjöar av flytande gas', en: 'Lakes of liquid gas' },
    body: {
      sv: 'Titan är den enda månen med stabila vätskor på ytan. Men det är inte vatten — det är sjöar och hav av flytande metan och etan vid –179 °C.',
      en: "Titan is the only moon with stable liquids on its surface. But it's not water — it's lakes and seas of liquid methane and ethane at –179 °C.",
    },
  },
  {
    id: 'titan_atmosphere',
    bodyId: 'titan',
    icon: '🌫️',
    level: 'middle',
    title: { sv: 'En tjockare atmosfär än Jordens', en: "A thicker atmosphere than Earth's" },
    body: {
      sv: 'Titan har en atmosfär tjockare än Jordens, mestadels kväve. En orange dimma omger hela månen. Rymdsonden Huygens landade i dimman 2005.',
      en: "Titan has an atmosphere thicker than Earth's, mostly nitrogen. An orange haze surrounds the entire moon. The Huygens probe landed in the haze in 2005.",
    },
  },
  {
    id: 'titan_life_possible',
    bodyId: 'titan',
    icon: '🔬',
    level: 'upper',
    title: { sv: 'En alternativ livsmiljö?', en: 'An alternative habitat for life?' },
    body: {
      sv: 'Titans kombination av kolväten, kväve och energikällor liknar teorier om hur livet kan ha börjat på urtida Jorden. Möjligen kan metanbaserat liv existera i sjöarna.',
      en: "Titan's combination of hydrocarbons, nitrogen and energy sources resembles theories about how life may have started on early Earth. Possibly methane-based life could exist in the lakes.",
    },
  },
  {
    id: 'titan_cassini',
    bodyId: 'titan',
    icon: '🔭',
    level: 'both',
    title: { sv: 'Cassinis trettonåriga arv', en: "Cassini's thirteen-year legacy" },
    body: {
      sv: 'Rymdsonden Cassini tillbringade 13 år i Saturnussystemet och kartlade Titan i detalj. 2017 dök den med flit ner i Saturnus atmosfär — för att inte förorena Titan med jordbakterier.',
      en: "The Cassini spacecraft spent 13 years in the Saturn system and mapped Titan in detail. In 2017 it deliberately plunged into Saturn's atmosphere — to avoid contaminating Titan with Earth bacteria.",
    },
  },

  // TRITON
  {
    id: 'triton_backwards',
    bodyId: 'triton',
    icon: '🔄',
    level: 'both',
    title: { sv: 'Den bakvänt kretsande månen', en: 'The moon that orbits backwards' },
    body: {
      sv: 'Triton kretsar runt Neptunus i motsatt riktning mot Neptunus rotation — den enda stora månen i solsystemet som gör det. Det tyder på att den fångades in utifrån.',
      en: "Triton orbits Neptune in the opposite direction to Neptune's rotation — the only large moon in the solar system to do so. This strongly suggests it was captured from elsewhere.",
    },
  },
  {
    id: 'triton_geysers',
    bodyId: 'triton',
    icon: '🌋',
    level: 'both',
    title: { sv: 'Kvävegeysers i kylan', en: 'Nitrogen geysers in the cold' },
    body: {
      sv: 'Triton har aktiva geysers som sprutar kvävegas upp till 8 km i höjden. Solljuset värmer upp kväveisen under ytan tills den förvandlas till gas och bryter igenom.',
      en: 'Triton has active geysers that shoot nitrogen gas up to 8 km into the air. Sunlight heats nitrogen ice below the surface until it turns to gas and breaks through.',
    },
  },
  {
    id: 'triton_cold',
    bodyId: 'triton',
    icon: '❄️',
    level: 'middle',
    title: {
      sv: 'En av de kallaste platserna vi mätt',
      en: "One of the coldest places we've measured",
    },
    body: {
      sv: 'Triton är en av de kallaste kroppar vi har mätt i solsystemet — ungefär –235 °C. Det är bara 38 grader över den absoluta nollpunkten.',
      en: "Triton is one of the coldest objects we've measured in the solar system — about –235 °C. That's just 38 degrees above absolute zero.",
    },
  },
  {
    id: 'triton_doomed',
    bodyId: 'triton',
    icon: '🕐',
    level: 'upper',
    title: { sv: 'En måne med inbyggt förfallodatum', en: 'A moon with a built-in expiry date' },
    body: {
      sv: 'Triton rör sig i en sakta spiralformad bana mot Neptunus. Om ungefär 3,6 miljarder år kommer Neptunus tyngdkraft riva sönder månen och skapa ett nytt ringsystem.',
      en: "Triton is slowly spiralling inward toward Neptune. In about 3.6 billion years, Neptune's gravity will tear the moon apart and create a new ring system.",
    },
  },

  // ISS
  {
    id: 'iss_construction',
    bodyId: 'iss',
    icon: '🏗️',
    level: 'middle',
    title: { sv: 'Byggd i rymden, bit för bit', en: 'Built in space, piece by piece' },
    body: {
      sv: 'ISS byggdes inte i ett stycke och sköts upp. Den monterades bit för bit i rymden under 13 år av astronauter från 15 länder.',
      en: "The ISS wasn't built in one piece and launched. It was assembled piece by piece in space over 13 years by astronauts from 15 countries.",
    },
  },
  {
    id: 'iss_research',
    bodyId: 'iss',
    icon: '🔬',
    level: 'both',
    title: { sv: 'Forskning i tyngdlöshet', en: 'Research in weightlessness' },
    body: {
      sv: 'På ISS studerar forskare hur kropp och material beter sig utan tyngdkraft. Resultaten hjälper oss förstå hur människan kan överleva en lång resa till Mars.',
      en: 'On the ISS, scientists study how bodies and materials behave without gravity. The findings help us understand how humans could survive a long journey to Mars.',
    },
  },
  {
    id: 'iss_sunrises',
    bodyId: 'iss',
    icon: '🌍',
    level: 'middle',
    title: { sv: '16 soluppgångar om dagen', en: '16 sunrises a day' },
    body: {
      sv: 'ISS kretsar runt Jorden 16 gånger per dygn med en hastighet av 28 000 km/h. Det innebär att astronauterna ombord upplever 16 soluppgångar varje dag.',
      en: 'The ISS orbits Earth 16 times per day at 28,000 km/h. This means astronauts on board experience 16 sunrises and 16 sunsets every single day.',
    },
  },
  {
    id: 'iss_maintenance',
    bodyId: 'iss',
    icon: '🛠️',
    level: 'upper',
    title: { sv: 'Ständigt underhåll', en: 'Constant maintenance' },
    body: {
      sv: 'ISS underhålls kontinuerligt av astronauter som utför rymdpromenader. Utan regelbundna försörjningsraketer och reservdelar skulle stationen inte klara sig mer än några år.',
      en: 'The ISS is continuously maintained by astronauts performing spacewalks. Without regular supply rockets and spare parts, the station would not survive more than a few years.',
    },
  },

  // SPUTNIK
  {
    id: 'sputnik_first',
    bodyId: 'sputnik',
    icon: '🚀',
    level: 'both',
    title: { sv: 'Den första satelliten', en: 'The first satellite' },
    body: {
      sv: 'Sputnik 1 sköts upp av Sovjetunionen den 4 oktober 1957. Det var den allra första artificiella satelliten i rymden och startskottet för rymdkapplöpningen.',
      en: 'Sputnik 1 was launched by the Soviet Union on October 4, 1957. It was the very first artificial satellite in space and marked the start of the Space Race.',
    },
  },
  {
    id: 'sputnik_beep',
    bodyId: 'sputnik',
    icon: '📻',
    level: 'middle',
    title: { sv: 'Bip-bip-bip från rymden', en: 'Beep-beep-beep from space' },
    body: {
      sv: 'Satelliten var bara 58 cm i diameter och hade inga kameror. Istället sände den ut ett enkelt pipande radioljud som radioamatörer över hela världen kunde lyssna på.',
      en: 'The satellite was only 58 cm in diameter and had no cameras. Instead, it broadcast a simple beeping radio signal that amateur radio operators worldwide could listen to.',
    },
  },
  {
    id: 'sputnik_orbit',
    bodyId: 'sputnik',
    icon: '🔥',
    level: 'upper',
    title: { sv: 'Ett kort men historiskt liv', en: 'A short but historic life' },
    body: {
      sv: 'Sputnik 1 kretsade runt Jorden i över 1 400 varv innan dess batterier tog slut. Efter tre månader bromsades den in av atmosfären och brann upp.',
      en: 'Sputnik 1 orbited Earth over 1,400 times before its batteries died. After three months, it was slowed down by the atmosphere and burned up.',
    },
  },
];

export const getFactCardsForBody = (
  bodyId: BodyId,
  level: FactCardLevel,
): ReadonlyArray<FactCard> => {
  if (level === 'both') {
    return FACT_CARDS.filter((c) => c.bodyId === bodyId);
  }

  return FACT_CARDS.filter((c) => c.bodyId === bodyId && (c.level === 'both' || c.level === level));
};
