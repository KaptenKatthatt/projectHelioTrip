import type { BodyId } from '../bodies';
import { SUN_FACT_CARDS } from './factCardData/sun';
import { MERCURY_FACT_CARDS } from './factCardData/mercury';
import { VENUS_FACT_CARDS } from './factCardData/venus';
import { EARTH_FACT_CARDS } from './factCardData/earth';
import { MARS_FACT_CARDS } from './factCardData/mars';
import { JUPITER_FACT_CARDS } from './factCardData/jupiter';
import { SATURN_FACT_CARDS } from './factCardData/saturn';
import { URANUS_FACT_CARDS } from './factCardData/uranus';
import { NEPTUNE_FACT_CARDS } from './factCardData/neptune';
import { PLUTO_FACT_CARDS } from './factCardData/pluto';
import { MOON_FACT_CARDS } from './factCardData/moon';
import { IO_FACT_CARDS } from './factCardData/io';
import { EUROPA_FACT_CARDS } from './factCardData/europa';
import { GANYMEDE_FACT_CARDS } from './factCardData/ganymede';

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
  ...URANUS_FACT_CARDS,
  ...NEPTUNE_FACT_CARDS,
  ...PLUTO_FACT_CARDS,
  ...MOON_FACT_CARDS,
  ...IO_FACT_CARDS,
  ...EUROPA_FACT_CARDS,
  ...GANYMEDE_FACT_CARDS,
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
