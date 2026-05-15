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
import { CALLISTO_FACT_CARDS } from './factCardData/callisto';
import { TITAN_FACT_CARDS } from './factCardData/titan';

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
  ...CALLISTO_FACT_CARDS,
  ...TITAN_FACT_CARDS,
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
