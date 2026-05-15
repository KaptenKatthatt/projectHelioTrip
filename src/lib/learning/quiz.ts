import type { BodyId } from '../bodies';
import type { FactCardLevel } from './bodyContent';
import { SUN_QUESTIONS } from './quizData/sun';
import { GANYMEDE } from './quizData/ganymede';
import { EUROPA } from './quizData/europa';
import { IO } from './quizData/io';
import { MOON } from './quizData/moon';
import { PLUTO } from './quizData/pluto';
import { NEPTUNE } from './quizData/neptune';
import { URANUS } from './quizData/uranus';
import { SATURN } from './quizData/saturn';
import { JUPITER } from './quizData/jupiter';
import { MARS } from './quizData/mars';
import { EARTH } from './quizData/earth';
import { VENUS } from './quizData/venus';
import { MERCURY } from './quizData/mercury';

type MultipleChoiceQuestion = {
  readonly type: 'multiple-choice';
  readonly id: string;
  readonly bodyId: BodyId;
  readonly level: FactCardLevel;
  readonly question: { readonly sv: string; readonly en: string };
  readonly options: readonly [
    { readonly key: 'A'; readonly sv: string; readonly en: string },
    { readonly key: 'B'; readonly sv: string; readonly en: string },
    { readonly key: 'C'; readonly sv: string; readonly en: string },
  ];
  readonly correct: 'A' | 'B' | 'C';
  readonly hint: { readonly sv: string; readonly en: string };
  readonly explanation: { readonly sv: string; readonly en: string };
};

type TrueFalseQuestion = {
  readonly type: 'true-false';
  readonly id: string;
  readonly bodyId: BodyId;
  readonly level: FactCardLevel;
  readonly statement: { readonly sv: string; readonly en: string };
  readonly correct: boolean;
  readonly hint: { readonly sv: string; readonly en: string };
  readonly explanation: { readonly sv: string; readonly en: string };
};

type FillInQuestion = {
  readonly type: 'fill-in';
  readonly id: string;
  readonly bodyId: BodyId;
  readonly level: FactCardLevel;
  readonly question: { readonly sv: string; readonly en: string };
  readonly correctAnswer: string;
  readonly hint: { readonly sv: string; readonly en: string };
  readonly explanation: { readonly sv: string; readonly en: string };
};

export type QuizQuestion = MultipleChoiceQuestion | TrueFalseQuestion | FillInQuestion;

export const QUIZ_QUESTIONS: ReadonlyArray<QuizQuestion> = [
  ...SUN_QUESTIONS,

  ...MERCURY,
  ...VENUS,
  ...EARTH,
  ...MARS,
  ...JUPITER,
  ...SATURN,
  ...URANUS,
  ...NEPTUNE,
  ...PLUTO,
  ...MOON,
  ...IO,
  ...EUROPA,
  ...GANYMEDE,
  // CALLISTO
  {
    type: 'true-false',
    id: 'quiz_callisto_craters',
    bodyId: 'callisto',
    level: 'both',
    statement: {
      sv: 'Callisto är den mest kraterrika kroppen i hela solsystemet.',
      en: 'Callisto is the most heavily cratered body in the entire solar system.',
    },
    correct: true,
    hint: {
      sv: 'Callisto har inga vulkaner eller aktiv geologi som kan fylla igen kratrarna.',
      en: 'Callisto has no volcanoes or active geology to fill in craters.',
    },
    explanation: {
      sv: 'Callisto är geologiskt död — ingen värme från tidvattenkrafter skapar vulkaner eller rörelser som täcker kratrarna. Varje asteroid som träffat den under 4 miljarder år har lämnat ett spår.',
      en: 'Callisto is geologically dead — no tidal heating creates volcanoes or movements to cover craters. Every asteroid that has struck it over 4 billion years has left a mark.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_callisto_position',
    bodyId: 'callisto',
    level: 'middle',
    question: {
      sv: 'Callisto är den yttersta av de fyra galileiska månarna. Vad är en fördel med det?',
      en: 'Callisto is the outermost of the four Galilean moons. What is one advantage of this?',
    },
    options: [
      { key: 'A', sv: 'Den är varmare och mer beboelig', en: 'It is warmer and more habitable' },
      {
        key: 'B',
        sv: 'Den utsätts för mycket mindre strålning från Jupiter',
        en: 'It is exposed to much less radiation from Jupiter',
      },
      { key: 'C', sv: 'Den snurrar snabbast runt Jupiter', en: 'It orbits Jupiter the fastest' },
    ],
    correct: 'B',
    hint: {
      sv: 'Jupiters strålningsbälten är farliga — ju längre bort, desto säkrare.',
      en: "Jupiter's radiation belts are dangerous — the farther away, the safer.",
    },
    explanation: {
      sv: 'Callisto befinner sig utanför Jupiters farligaste strålningsbälten. Det gör den till en kandidat för en framtida rymdstation — fartyg därifrån kan utforska det Jupiterianska systemet utan att utsätta besättningen för dödlig strålning.',
      en: "Callisto sits outside Jupiter's most dangerous radiation belts. This makes it a candidate for a future space base — ships from there could explore the Jovian system without exposing crews to lethal radiation.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_callisto_ocean',
    bodyId: 'callisto',
    level: 'upper',
    question: {
      sv: 'Vad tror forskare döljer sig under Callistos yta?',
      en: "What do scientists believe hides beneath Callisto's surface?",
    },
    options: [
      { key: 'A', sv: 'Smält järn och sten', en: 'Molten iron and rock' },
      {
        key: 'B',
        sv: 'Troligtvis ett flytande saltvattensbäv',
        en: 'Likely a liquid saltwater ocean',
      },
      { key: 'C', sv: 'Ingenting — den är helt solid', en: 'Nothing — it is completely solid' },
    ],
    correct: 'B',
    hint: {
      sv: 'Även om Callisto är geologiskt inaktiv på ytan kan det dolda havet finnas av en annan anledning.',
      en: 'Even though Callisto is geologically inactive on its surface, a hidden ocean could exist for another reason.',
    },
    explanation: {
      sv: 'Magnetmätningar från Galileosonden tyder på ett saltvatten­hav kanske 100–200 km under ytan. Det är inte drivet av tidvattenvärme utan av radioaktivt sönderfall långt inne i månens inre.',
      en: "Magnetic measurements from the Galileo spacecraft suggest a saltwater ocean perhaps 100–200 km below the surface. It is not driven by tidal heating but by radioactive decay deep in the moon's interior.",
    },
  },

  // TITAN
  {
    type: 'multiple-choice',
    id: 'quiz_titan_lakes',
    bodyId: 'titan',
    level: 'both',
    question: {
      sv: 'Vad finns det sjöar av på Titans yta?',
      en: "What are the lakes on Titan's surface made of?",
    },
    options: [
      { key: 'A', sv: 'Flytande vatten', en: 'Liquid water' },
      { key: 'B', sv: 'Flytande metan och etan', en: 'Liquid methane and ethane' },
      { key: 'C', sv: 'Smält is', en: 'Melted ice' },
    ],
    correct: 'B',
    hint: {
      sv: 'Titan är för kallt för flytande vatten, men ett annat ämne förblir flytande vid –179 °C.',
      en: 'Titan is too cold for liquid water, but another substance remains liquid at –179 °C.',
    },
    explanation: {
      sv: 'Titans sjöar och hav är fyllda med flytande metan och etan — väteföreningar som är gas på Jorden men flytande vid Titans extrema kyla på –179 °C.',
      en: "Titan's lakes and seas are filled with liquid methane and ethane — hydrocarbon compounds that are gases on Earth but liquid at Titan's extreme cold of –179 °C.",
    },
  },
  {
    type: 'true-false',
    id: 'quiz_titan_atmosphere',
    bodyId: 'titan',
    level: 'middle',
    statement: {
      sv: 'Titan har en tjockare atmosfär än Jorden.',
      en: 'Titan has a thicker atmosphere than Earth.',
    },
    correct: true,
    hint: {
      sv: 'Titan är ovanlig — de flesta månar saknar atmosfär helt.',
      en: 'Titan is unusual — most moons have no atmosphere at all.',
    },
    explanation: {
      sv: 'Titans atmosfärstryck vid ytan är ungefär 1,5 gånger högre än Jordens. Atmosfären domineras av kväve, precis som Jordens, med en tjock orange dimma av kolväten.',
      en: "Titan's atmospheric pressure at the surface is about 1.5 times higher than Earth's. The atmosphere is dominated by nitrogen, just like Earth's, with a thick orange hydrocarbon haze.",
    },
  },
  {
    type: 'true-false',
    id: 'quiz_titan_rain',
    bodyId: 'titan',
    level: 'upper',
    statement: {
      sv: 'Det regnar och snöar på Titan, men med metan istället för vatten.',
      en: 'It rains and snows on Titan, but with methane instead of water.',
    },
    correct: true,
    hint: {
      sv: 'Titan har en komplett vädercykel, men med ett annat ämne än vatten.',
      en: 'Titan has a complete weather cycle, but with a different substance than water.',
    },
    explanation: {
      sv: 'Titan har en fullständig metancykel: metan avdunstar, bildar moln, regnar ner och rinner till sjöar — precis som vattnets kretslopp på Jorden, men vid –179 °C och med metan.',
      en: 'Titan has a complete methane cycle: methane evaporates, forms clouds, rains down and flows into lakes — exactly like the water cycle on Earth, but at –179 °C and with methane.',
    },
  },

  // TRITON
  {
    type: 'true-false',
    id: 'quiz_triton_orbit',
    bodyId: 'triton',
    level: 'both',
    statement: {
      sv: 'Triton kretsar runt Neptunus i samma riktning som Neptunus roterar.',
      en: 'Triton orbits Neptune in the same direction that Neptune rotates.',
    },
    correct: false,
    hint: {
      sv: 'Det är en av de egenskaper som gör Triton unik.',
      en: 'This is one of the features that makes Triton unique.',
    },
    explanation: {
      sv: 'Triton kretsar bakvänt — mot Neptunus rotationsriktning. Det är starkt bevis för att Triton fångades in från det yttre solsystemet, snarare än bildades runt Neptunus.',
      en: "Triton orbits backwards — against Neptune's direction of rotation. This is strong evidence that Triton was captured from the outer solar system, rather than forming around Neptune.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_triton_fate',
    bodyId: 'triton',
    level: 'upper',
    question: {
      sv: 'Vad händer med Triton om ungefär 3,6 miljarder år?',
      en: 'What will happen to Triton in about 3.6 billion years?',
    },
    options: [
      { key: 'A', sv: 'Den krockar med Neptunus', en: 'It will collide with Neptune' },
      { key: 'B', sv: 'Den lämnar solsystemet', en: 'It will leave the solar system' },
      {
        key: 'C',
        sv: 'Neptunus tyngdkraft river sönder den och skapar ett ringsystem',
        en: "Neptune's gravity will tear it apart and create a ring system",
      },
    ],
    correct: 'C',
    hint: {
      sv: 'Gravitationen kan slita sönder en kropp som spiralrar för nära en tung planet.',
      en: 'Gravity can tear apart a body that spirals too close to a massive planet.',
    },
    explanation: {
      sv: 'Triton spiralrar sakta inåt. När den väl passerat Roches gräns — det avstånd där tyngdkraften övervinner månens eget kohesionsstyrka — slits den sönder och bildar ett ringsystem.',
      en: "Triton is slowly spiralling inward. When it crosses the Roche limit — the distance where gravity overcomes the moon's own cohesive strength — it will be torn apart and form a ring system.",
    },
  },
  {
    type: 'true-false',
    id: 'quiz_triton_geysers',
    bodyId: 'triton',
    level: 'both',
    statement: {
      sv: 'Voyager 2 fotograferade aktiva gejsrar på Triton när den flög förbi 1989.',
      en: 'Voyager 2 photographed active geysers on Triton when it flew past in 1989.',
    },
    correct: true,
    hint: {
      sv: 'Triton är en av mycket få platser utanför Jorden med bekräftad aktiv geologi.',
      en: 'Triton is one of very few places beyond Earth with confirmed active geology.',
    },
    explanation: {
      sv: 'Voyager 2 såg kväve­gejsrar skjuta ut mörka plymer som nådde 8 km höjd. Solens svaga värme expanderar kvävegas under isen och driver ut gejsrarna.',
      en: "Voyager 2 saw nitrogen geysers shoot dark plumes reaching 8 km in height. The Sun's faint warmth expands nitrogen gas beneath the ice and drives the geysers.",
    },
  },

  // ISS
  {
    type: 'multiple-choice',
    id: 'quiz_iss_orbits',
    bodyId: 'iss',
    level: 'middle',
    question: {
      sv: 'Hur många gånger kretsar ISS runt Jorden varje dag?',
      en: 'How many times does the ISS orbit Earth each day?',
    },
    options: [
      { key: 'A', sv: '4 gånger', en: '4 times' },
      { key: 'B', sv: '16 gånger', en: '16 times' },
      { key: 'C', sv: '100 gånger', en: '100 times' },
    ],
    correct: 'B',
    hint: { sv: 'ISS rör sig i ungefär 28 000 km/h.', en: 'The ISS travels at about 28,000 km/h.' },
    explanation: {
      sv: 'ISS kretsar runt Jorden 16 gånger per dygn. Det innebär att astronauterna ombord upplever 16 soluppgångar och 16 solnedgångar varje dag.',
      en: 'The ISS orbits Earth 16 times per day. This means astronauts on board experience 16 sunrises and 16 sunsets every single day.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_iss_build',
    bodyId: 'iss',
    level: 'middle',
    statement: {
      sv: 'ISS byggdes i ett stycke på Jorden och sköts upp med en enda raket.',
      en: 'The ISS was built in one piece on Earth and launched with a single rocket.',
    },
    correct: false,
    hint: {
      sv: 'Tänk på hur stor ISS är — ungefär som en fotbollsplan.',
      en: 'Think about how large the ISS is — roughly the size of a football pitch.',
    },
    explanation: {
      sv: 'ISS monterades bit för bit i rymden under 13 år, av astronauter från 15 länder. Mer än 40 rymdfärder krävdes för att frakta upp alla delar.',
      en: 'The ISS was assembled piece by piece in space over 13 years by astronauts from 15 countries. More than 40 spaceflight missions were needed to transport all the components.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_iss_research',
    bodyId: 'iss',
    level: 'both',
    question: {
      sv: 'Vilken typ av forskning är ISS extra värdefull för?',
      en: 'What type of research is the ISS especially valuable for?',
    },
    options: [
      {
        key: 'A',
        sv: 'Forskning om hur kroppen och material beter sig i tyngdlöshet',
        en: 'Research on how the body and materials behave in weightlessness',
      },
      { key: 'B', sv: 'Forskning om havets djupliv', en: 'Research on deep-sea life' },
      { key: 'C', sv: 'Forskning om jordbävningar', en: 'Research on earthquakes' },
    ],
    correct: 'A',
    hint: {
      sv: 'Tyngdlöshet är omöjligt att skapa på Jordens yta i längre perioder.',
      en: "Weightlessness is impossible to create on Earth's surface for extended periods.",
    },
    explanation: {
      sv: 'ISS är världens enda permanenta laboratorium i tyngdlöshet. Forskningen hjälper oss förstå hur kroppen förändras på lång rymdfärd — kunskap som behövs för framtida resor till Mars.',
      en: "The ISS is the world's only permanent laboratory in weightlessness. The research helps us understand how the body changes on long space voyages — knowledge needed for future journeys to Mars.",
    },
  },

  // SPUTNIK
  {
    type: 'multiple-choice',
    id: 'quiz_sputnik_year',
    bodyId: 'sputnik',
    level: 'both',
    question: { sv: 'Vilket år sköts Sputnik 1 upp?', en: 'In what year was Sputnik 1 launched?' },
    options: [
      { key: 'A', sv: '1945', en: '1945' },
      { key: 'B', sv: '1957', en: '1957' },
      { key: 'C', sv: '1969', en: '1969' },
    ],
    correct: 'B',
    hint: {
      sv: 'Det skedde 12 år innan människan landade på Månen.',
      en: 'It happened 12 years before humans landed on the Moon.',
    },
    explanation: {
      sv: 'Sputnik 1 sköts upp 1957 och startade rymdkapplöpningen mellan USA och Sovjetunionen.',
      en: 'Sputnik 1 was launched in 1957, starting the Space Race between the USA and the Soviet Union.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_sputnik_camera',
    bodyId: 'sputnik',
    level: 'middle',
    statement: {
      sv: 'Sputnik 1 tog de första fotografierna av Jorden från rymden.',
      en: 'Sputnik 1 took the very first photographs of Earth from space.',
    },
    correct: false,
    hint: {
      sv: 'Tänk på vad satelliten var känd för att sända ut för slags signal.',
      en: 'Think about what kind of signal the satellite was famous for transmitting.',
    },
    explanation: {
      sv: 'Den hade ingen kamera alls. Den sände bara ut en pipsignal via radio för att bevisa att den var i omloppsbana.',
      en: 'It had no camera at all. It only transmitted a radio beep to prove it was in orbit.',
    },
  },
  {
    type: 'fill-in',
    id: 'quiz_sputnik_size',
    bodyId: 'sputnik',
    level: 'upper',
    question: {
      sv: 'Sputnik 1 var ganska liten, den hade en diameter på bara ___ cm.',
      en: 'Sputnik 1 was quite small, with a diameter of only ___ cm.',
    },
    correctAnswer: '58',
    hint: { sv: 'Strax över en halvmeter.', en: 'Just over half a meter.' },
    explanation: {
      sv: 'Den var ungefär lika stor som en badboll (58 cm). Mänsklighetens första steg ut i rymden var ganska litet!',
      en: "It was about the size of a beach ball (58 cm). Humanity's first step into space was quite small!",
    },
  },
  // GRAVITY SLING (adventure mission specific — no bodyId)
  {
    type: 'multiple-choice',
    id: 'quiz_gravity_sling_mechanic',
    bodyId: 'jupiter',
    level: 'upper',
    question: {
      sv: 'Vad händer med en rymdsond som utför en gravitationsslinga runt Jupiter?',
      en: 'What happens to a spacecraft performing a gravity slingshot around Jupiter?',
    },
    options: [
      { key: 'A', sv: 'Den saktar ner och bränslebesparar', en: 'It slows down and saves fuel' },
      {
        key: 'B',
        sv: 'Den ökar sin hastighet utan att bränna extra bränsle',
        en: 'It increases its speed without burning extra fuel',
      },
      {
        key: 'C',
        sv: 'Den fastnar i Jupiters omloppsbana',
        en: "It gets trapped in Jupiter's orbit",
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Tänk på att Jupiter rör sig snabbt i sin bana — det är rörelseenergin som "delas".',
      en: 'Think of Jupiter moving fast in its orbit — it\'s this kinetic energy that gets "shared."',
    },
    explanation: {
      sv: 'Rymdsonden flyger in mot Jupiter i en vinkel, svänger runt den och åker ut snabbare. Den "stjäl" en pytteliten del av Jupiters rörelseenergi — för liten för att märkas på Jupiter, men enorm för sonden.',
      en: 'The spacecraft flies toward Jupiter at an angle, swings around it and exits faster. It "steals" a tiny fraction of Jupiter\'s kinetic energy — too small to notice on Jupiter, but enormous for the spacecraft.',
    },
  },
];

export const getQuizQuestionsForBody = (
  bodyId: BodyId,
  level: FactCardLevel,
): ReadonlyArray<QuizQuestion> => {
  if (level === 'both') {
    return QUIZ_QUESTIONS.filter((q) => q.bodyId === bodyId);
  }
  return QUIZ_QUESTIONS.filter(
    (q) => q.bodyId === bodyId && (q.level === level || q.level === 'both'),
  );
};
