import type { BodyId } from '../bodies';
import type { FactCardLevel } from './bodyContent';
import { SUN_QUESTIONS } from './quizData/sun';
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
  // PLUTO
  {
    type: 'multiple-choice',
    id: 'quiz_pluto_planet',
    bodyId: 'pluto',
    level: 'both',
    question: {
      sv: 'Varför är Pluto inte längre en planet?',
      en: 'Why is Pluto no longer a planet?',
    },
    options: [
      { key: 'A', sv: 'Den är för liten', en: 'It is too small' },
      {
        key: 'B',
        sv: 'Den har inte rensat sin omloppsbana på andra objekt',
        en: 'It has not cleared its orbit of other objects',
      },
      {
        key: 'C',
        sv: 'Den befinner sig utanför solsystemet',
        en: 'It is outside the solar system',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'En av tre krav för att kallas planet är att dominera sin omloppsbana.',
      en: 'One of three requirements to be called a planet is to dominate your orbit.',
    },
    explanation: {
      sv: 'Enligt IAUs definition från 2006 måste en planet ha rensat sin omloppsbana. Pluto delar sin bana med många andra Kuiperbältsobjekt och uppfyller därför inte kravet.',
      en: "According to the IAU's 2006 definition, a planet must have cleared its orbit. Pluto shares its orbit with many other Kuiper Belt objects and therefore doesn't meet the requirement.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_pluto_temperature',
    bodyId: 'pluto',
    level: 'middle',
    question: {
      sv: 'Ungefär hur kallt är det på Pluto?',
      en: 'Approximately how cold is it on Pluto?',
    },
    options: [
      { key: 'A', sv: '–50 °C', en: '–50 °C' },
      { key: 'B', sv: '–130 °C', en: '–130 °C' },
      { key: 'C', sv: '–230 °C', en: '–230 °C' },
    ],
    correct: 'C',
    hint: {
      sv: 'Pluto är extremt långt från Solen och nästan vid den absoluta nollpunkten.',
      en: 'Pluto is extremely far from the Sun and near absolute zero.',
    },
    explanation: {
      sv: 'Pluto håller ungefär –230 °C. Den absoluta nollpunkten (kallaste möjliga) är –273 °C, så Pluto är bara 43 grader från det fysikaliska bottnet.',
      en: 'Pluto is about –230 °C. Absolute zero (the coldest possible) is –273 °C, so Pluto is just 43 degrees from the physical minimum.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_pluto_heart',
    bodyId: 'pluto',
    level: 'middle',
    statement: {
      sv: 'Pluto har ett hjärtformat område av is som hittades av rymdsonden New Horizons 2015.',
      en: 'Pluto has a heart-shaped region of ice discovered by the New Horizons spacecraft in 2015.',
    },
    correct: true,
    hint: {
      sv: 'New Horizons flög förbi Pluto 2015 efter en resa på nästan tio år.',
      en: 'New Horizons flew past Pluto in 2015 after an almost ten-year journey.',
    },
    explanation: {
      sv: 'Tombaugh Regio är ett gigantiskt hjärtformat område av kvävesis på Plutos yta. Det var en av de mest ikoniska bilderna från New Horizons uppdrag.',
      en: "Tombaugh Regio is a giant heart-shaped region of nitrogen ice on Pluto's surface. It was one of the most iconic images from the New Horizons mission.",
    },
  },

  // MOON
  {
    type: 'true-false',
    id: 'quiz_moon_locked',
    bodyId: 'moon',
    level: 'middle',
    statement: {
      sv: 'Vi på Jorden har aldrig sett Månens baksida.',
      en: 'People on Earth have never seen the far side of the Moon.',
    },
    correct: true,
    hint: {
      sv: 'Tänk på varför vi alltid ser samma sida av Månen.',
      en: 'Think about why we always see the same side of the Moon.',
    },
    explanation: {
      sv: 'Eftersom Månen är tidslåst till Jorden — den roterar lika snabbt som den kretsar — ser vi alltid samma sida. Baksidan fotograferades först 1959 av den sovjetiska sonden Luna 3.',
      en: 'Because the Moon is tidally locked to Earth — it rotates as fast as it orbits — we always see the same side. The far side was first photographed in 1959 by the Soviet Luna 3 probe.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_moon_tides',
    bodyId: 'moon',
    level: 'middle',
    question: { sv: 'Vad orsakar tidvatten på Jorden?', en: 'What causes tides on Earth?' },
    options: [
      { key: 'A', sv: 'Jordens rotation', en: "Earth's rotation" },
      { key: 'B', sv: 'Månens gravitationsdrag', en: "The Moon's gravitational pull" },
      { key: 'C', sv: 'Vindarna i haven', en: 'The winds in the oceans' },
    ],
    correct: 'B',
    hint: {
      sv: 'Det är Månens dragkraft som "lyfter" havets vatten.',
      en: 'It\'s the Moon\'s gravitational pull that "lifts" the ocean water.',
    },
    explanation: {
      sv: 'Månens gravitation drar i Jordens hav och skapar tidvatten. Solens gravitation bidrar också, men Månens effekt är starkare trots att Solen är mycket tyngre.',
      en: "The Moon's gravity pulls on Earth's oceans to create tides. The Sun's gravity also contributes, but the Moon's effect is stronger despite the Sun being much more massive.",
    },
  },
  {
    type: 'fill-in',
    id: 'quiz_moon_astronauts',
    bodyId: 'moon',
    level: 'middle',
    question: {
      sv: 'Totalt ___ astronauter har gått på Månens yta.',
      en: "A total of ___ astronauts have walked on the Moon's surface.",
    },
    correctAnswer: '12',
    hint: {
      sv: 'Apolloprogrammet genomförde 6 landningar med 2 astronauter per landning.',
      en: 'The Apollo programme completed 6 landings with 2 astronauts per landing.',
    },
    explanation: {
      sv: 'Tolv astronauter gick på Månen under NASA:s Apolloprogram, mellan 1969 och 1972. Den siste var Harrison Schmitt och Eugene Cernan i Apollo 17.',
      en: "Twelve astronauts walked on the Moon during NASA's Apollo programme, between 1969 and 1972. The last were Harrison Schmitt and Eugene Cernan on Apollo 17.",
    },
  },

  // IO
  {
    type: 'true-false',
    id: 'quiz_io_volcanoes',
    bodyId: 'io',
    level: 'both',
    statement: {
      sv: 'Io är den mest vulkaniskt aktiva kroppen i solsystemet.',
      en: 'Io is the most volcanically active body in the solar system.',
    },
    correct: true,
    hint: {
      sv: 'Tänk på vad Jupiters enorma gravitation gör med en liten måne.',
      en: "Think about what Jupiter's enormous gravity does to a small moon.",
    },
    explanation: {
      sv: 'Io har ständigt pågående vulkanutbrott. Jupiters tidvattenkrafter knådar ständigt månens inre och genererar enorm värme som driver all vulkanisk aktivitet.',
      en: "Io has constantly ongoing volcanic eruptions. Jupiter's tidal forces constantly knead the moon's interior, generating enormous heat that drives all the volcanic activity.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_io_heat',
    bodyId: 'io',
    level: 'upper',
    question: {
      sv: 'Vad orsakar Ios extrema vulkanism?',
      en: "What causes Io's extreme volcanism?",
    },
    options: [
      { key: 'A', sv: 'Radioaktivt sönderfall i kärnan', en: 'Radioactive decay in the core' },
      {
        key: 'B',
        sv: 'Jupiters tidvattenkrafter värmer upp månens inre',
        en: "Jupiter's tidal forces heat the moon's interior",
      },
      { key: 'C', sv: 'Solens direkta uppvärmning', en: 'Direct heating from the Sun' },
    ],
    correct: 'B',
    hint: {
      sv: 'Io befinner sig i ett dragkampsspel mellan Jupiter och de andra galileiska månarna.',
      en: 'Io is caught in a gravitational tug-of-war between Jupiter and the other Galilean moons.',
    },
    explanation: {
      sv: 'Jupiters och de andra galileiska månkraften tänjer ständigt på Io, precis som att böja ett gem fram och tillbaka. Friktionen genererar enorma mängder värme i det inre.',
      en: "Jupiter's and the other Galilean moons' gravity constantly flex Io, like bending a paperclip back and forth. The friction generates enormous heat in the interior.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_io_colour',
    bodyId: 'io',
    level: 'middle',
    question: {
      sv: 'Varför har Io så många färger på ytan?',
      en: 'Why does Io have so many colours on its surface?',
    },
    options: [
      { key: 'A', sv: 'Oliktfärgade bergarter', en: 'Differently coloured rock types' },
      {
        key: 'B',
        sv: 'Svavel i olika temperaturer bildar olika färger',
        en: 'Sulphur at different temperatures forms different colours',
      },
      {
        key: 'C',
        sv: 'Målad av den första rymdmissionen',
        en: 'Painted by the first space mission',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Isen på Io är inte is utan ett annat ämne.',
      en: 'The "ice" on Io is not water ice but another substance.',
    },
    explanation: {
      sv: 'Svavel antar olika färger beroende på temperaturen — gult nära 120 °C, orange och rött vid högre temperaturer, svart vid de varmaste vulkanerna.',
      en: 'Sulphur takes on different colours depending on temperature — yellow near 120 °C, orange and red at higher temperatures, black at the hottest vents.',
    },
  },

  // EUROPA
  {
    type: 'true-false',
    id: 'quiz_europa_ocean',
    bodyId: 'europa',
    level: 'both',
    statement: {
      sv: 'Det finns ett flytande hav under Europas yta.',
      en: "There is a liquid ocean beneath Europa's surface.",
    },
    correct: true,
    hint: {
      sv: 'Vad håller ett hav flytande när det är –160 °C på ytan?',
      en: "What keeps an ocean liquid when it's –160 °C on the surface?",
    },
    explanation: {
      sv: 'Jupiters tidvattenkrafter värmer Europas inre och håller havet under isen flytande. Det kan innehålla mer vatten än alla Jordens hav tillsammans.',
      en: "Jupiter's tidal forces heat Europa's interior and keep the ocean beneath the ice liquid. It may contain more water than all of Earth's oceans combined.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_europa_life',
    bodyId: 'europa',
    level: 'middle',
    question: {
      sv: 'Varför anser många forskare att Europa är ett bra ställe att söka efter liv?',
      en: 'Why do many scientists consider Europa a good place to search for life?',
    },
    options: [
      { key: 'A', sv: 'Det finns syre i atmosfären', en: 'There is oxygen in its atmosphere' },
      {
        key: 'B',
        sv: 'Det finns ett flytande hav med energi och möjlig kemi för liv',
        en: 'There is a liquid ocean with energy and possible chemistry for life',
      },
      { key: 'C', sv: 'Temperaturen är behaglig', en: 'The temperature is comfortable' },
    ],
    correct: 'B',
    hint: {
      sv: 'Tänk på vad livet på Jordens djuphav behöver.',
      en: "Think about what life in Earth's deep oceans needs.",
    },
    explanation: {
      sv: 'Europas hav under isen kan ha värme från Jupiters tidvattenkrafter, kemiska ämnen och flytande vatten — de tre grundförutsättningarna som liv vi känner det verkar kräva.',
      en: "Europa's subsurface ocean may have heat from Jupiter's tidal forces, chemical nutrients and liquid water — the three basic requirements that life as we know it seems to need.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_europa_ice',
    bodyId: 'europa',
    level: 'upper',
    question: {
      sv: 'Ungefär hur tjock är Europas isskorpa?',
      en: "Approximately how thick is Europa's ice shell?",
    },
    options: [
      { key: 'A', sv: '1–2 km', en: '1–2 km' },
      { key: 'B', sv: '15–25 km', en: '15–25 km' },
      { key: 'C', sv: '200–300 km', en: '200–300 km' },
    ],
    correct: 'B',
    hint: {
      sv: 'Det är tjockare än de flesta berg är höga.',
      en: "It's thicker than most mountains are tall.",
    },
    explanation: {
      sv: 'Europas isskorpa beräknas vara 15–25 km tjock. Under den kan havet vara 60–150 km djupt — långt djupare än Jordens Marianergraven.',
      en: "Europa's ice shell is estimated to be 15–25 km thick. Below it, the ocean may be 60–150 km deep — far deeper than Earth's Mariana Trench.",
    },
  },

  // GANYMEDE
  {
    type: 'true-false',
    id: 'quiz_ganymede_size',
    bodyId: 'ganymede',
    level: 'both',
    statement: {
      sv: 'Ganymedes är större än planeten Merkurius.',
      en: 'Ganymede is larger than the planet Mercury.',
    },
    correct: true,
    hint: {
      sv: 'Ganymedes är den största månen i solsystemet.',
      en: 'Ganymede is the largest moon in the solar system.',
    },
    explanation: {
      sv: 'Ja — Ganymedes diameter är ungefär 5 268 km, medan Merkurius diameter är 4 879 km. Ganymedes är alltså bredare än en hel planet, men kretsar runt Jupiter.',
      en: "Yes — Ganymede's diameter is about 5,268 km, while Mercury's is 4,879 km. Ganymede is wider than a whole planet, yet orbits Jupiter.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_ganymede_magnetic',
    bodyId: 'ganymede',
    level: 'upper',
    question: {
      sv: 'Vad är unikt med Ganymedes bland alla månar i solsystemet?',
      en: 'What is unique about Ganymede among all moons in the solar system?',
    },
    options: [
      {
        key: 'A',
        sv: 'Det är den enda måne med flytande vatten på ytan',
        en: 'It is the only moon with liquid water on its surface',
      },
      {
        key: 'B',
        sv: 'Det är den enda måne med eget magnetfält',
        en: 'It is the only moon with its own magnetic field',
      },
      {
        key: 'C',
        sv: 'Det är den enda måne med atmosfär',
        en: 'It is the only moon with an atmosphere',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Det skapar ett unikt polarsken som kan ses från Jupiters omloppsbana.',
      en: "It creates a unique aurora that can be seen from Jupiter's orbit.",
    },
    explanation: {
      sv: 'Ganymedes är den enda måne i solsystemet med ett eget magnetfält, troligtvis skapat av en flytande järnkärna. Det skapar ett mini-polarsken ovanpå Jupiters enorma polarsken.',
      en: "Ganymede is the only moon in the solar system with its own magnetic field, likely generated by a liquid iron core. It creates a mini-aurora on top of Jupiter's enormous aurora.",
    },
  },
  {
    type: 'true-false',
    id: 'quiz_ganymede_ocean',
    bodyId: 'ganymede',
    level: 'upper',
    statement: {
      sv: 'Ganymedes har ett saltvattensbäv gömt under isen, precis som Europa.',
      en: 'Ganymede has a saltwater ocean hidden beneath its ice, just like Europa.',
    },
    correct: true,
    hint: {
      sv: 'Hubbleteleskopet har hittat tecken på havet genom att studera polarsken.',
      en: 'The Hubble telescope found evidence of the ocean by studying its auroras.',
    },
    explanation: {
      sv: 'Ja — ett globalt saltvatten­hav gömmer sig ungefär 800 km under Ganymedes yta. Hubble identifierade havet genom att se hur magnetfältet och polarskenet rörde sig.',
      en: "Yes — a global saltwater ocean hides about 800 km beneath Ganymede's surface. Hubble identified the ocean by observing how the magnetic field and aurora moved.",
    },
  },

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
