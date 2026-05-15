import type { BodyId } from '../bodies';
import type { FactCardLevel } from './bodyContent';
import { SUN_QUESTIONS } from './quizData/sun';

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

  // MERCURY
  {
    type: 'true-false',
    id: 'quiz_mercury_temp',
    bodyId: 'mercury',
    level: 'both',
    statement: {
      sv: 'Merkurius är den hetaste planeten i solsystemet eftersom den är närmast Solen.',
      en: 'Mercury is the hottest planet in the solar system because it is closest to the Sun.',
    },
    correct: false,
    hint: {
      sv: 'Tänk på vad en atmosfär gör för temperaturen.',
      en: 'Think about what an atmosphere does for temperature.',
    },
    explanation: {
      sv: 'Venus är hetare trots att den är längre bort. Merkurius saknar atmosfär och kan inte hålla kvar värmen — Venus tjocka atmosfär fungerar som ett växthus.',
      en: "Venus is hotter despite being farther away. Mercury has no atmosphere to retain heat — Venus's thick atmosphere works like a greenhouse.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_mercury_day',
    bodyId: 'mercury',
    level: 'upper',
    question: {
      sv: 'Vad är märkligt med ett dygn på Merkurius?',
      en: 'What is strange about a day on Mercury?',
    },
    options: [
      { key: 'A', sv: 'Det är kortare än en timme', en: 'It is shorter than one hour' },
      {
        key: 'B',
        sv: 'Det är längre än ett år på Merkurius',
        en: 'It is longer than a year on Mercury',
      },
      {
        key: 'C',
        sv: 'Det är exakt lika långt som på Jorden',
        en: 'It is exactly as long as on Earth',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Merkurius roterar väldigt långsamt men kretsar snabbt runt Solen.',
      en: 'Mercury rotates very slowly but orbits the Sun quickly.',
    },
    explanation: {
      sv: 'Ett dygn på Merkurius tar 176 jorddagar, men ett år (ett varv runt Solen) tar bara 88 jorddagar. Alltså är dygnet dubbelt så långt som året.',
      en: 'A day on Mercury takes 176 Earth days, but a year (one orbit of the Sun) takes only 88 Earth days. So the day is twice as long as the year.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_mercury_craters',
    bodyId: 'mercury',
    level: 'middle',
    statement: {
      sv: 'Kratrarna på Merkurius är äldre än kratrarna på Månen.',
      en: 'The craters on Mercury are older than the craters on the Moon.',
    },
    correct: false,
    hint: {
      sv: 'Varför försvinner inte kratrarna på Merkurius?',
      en: "Why don't the craters on Mercury disappear?",
    },
    explanation: {
      sv: 'Kratrarna på Merkurius är inte nödvändigtvis äldre, men de bevaras lika bra eftersom ingen av kropparna har atmosfär eller väder som eroderar ytan.',
      en: "The craters on Mercury aren't necessarily older, but they're preserved just as well since neither body has an atmosphere or weather to erode the surface.",
    },
  },

  // VENUS
  {
    type: 'multiple-choice',
    id: 'quiz_venus_temperature',
    bodyId: 'venus',
    level: 'both',
    question: {
      sv: 'Vilken är medeltemperaturen på Venus yta?',
      en: 'What is the average surface temperature on Venus?',
    },
    options: [
      { key: 'A', sv: 'Ungefär 50 °C', en: 'About 50 °C' },
      { key: 'B', sv: 'Ungefär 200 °C', en: 'About 200 °C' },
      { key: 'C', sv: 'Ungefär 465 °C', en: 'About 465 °C' },
    ],
    correct: 'C',
    hint: {
      sv: 'Tänk på Venus som det ultimata växthuset.',
      en: 'Think of Venus as the ultimate greenhouse.',
    },
    explanation: {
      sv: 'Venus yta håller ungefär 465 °C — tillräckligt för att smälta bly. Det beror på den extrema växthuseffekten i den täta koldioxidatmosfären.',
      en: "Venus's surface is about 465 °C — hot enough to melt lead. This is due to the extreme greenhouse effect in its dense carbon dioxide atmosphere.",
    },
  },
  {
    type: 'true-false',
    id: 'quiz_venus_rotation',
    bodyId: 'venus',
    level: 'upper',
    statement: {
      sv: 'På Venus går solen upp i väster och ner i öster.',
      en: 'On Venus the Sun rises in the west and sets in the east.',
    },
    correct: true,
    hint: {
      sv: 'Venus roterar åt ett annat håll än Jorden.',
      en: 'Venus rotates in the opposite direction to Earth.',
    },
    explanation: {
      sv: 'Venus roterar bakvänt jämfört med de flesta planeter. Det gör att solen rör sig tvärtom på himlen — uppgång i väster, nedgång i öster.',
      en: 'Venus rotates in the opposite direction to most planets. This means the Sun moves the wrong way across the sky — rising in the west and setting in the east.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_venus_earth_twin',
    bodyId: 'venus',
    level: 'middle',
    question: {
      sv: 'Varför kallas Venus ibland Jordens "systerplanet"?',
      en: 'Why is Venus sometimes called Earth\'s "sister planet"?',
    },
    options: [
      { key: 'A', sv: 'Den har också liv', en: 'It also has life' },
      {
        key: 'B',
        sv: 'Den är ungefär lika stor och tung som Jorden',
        en: 'It is roughly the same size and mass as Earth',
      },
      {
        key: 'C',
        sv: 'Den har samma temperatur som Jorden',
        en: 'It has the same temperature as Earth',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Tänk på storlek och massa, inte på ytan eller atmosfären.',
      en: 'Think about size and mass, not surface conditions or atmosphere.',
    },
    explanation: {
      sv: 'Venus och Jorden är nästan identiska i storlek och massa. Men atmosfär, temperatur och förhållanden på ytan är totalt olika.',
      en: 'Venus and Earth are almost identical in size and mass. But their atmospheres, temperatures and surface conditions are completely different.',
    },
  },

  // EARTH
  {
    type: 'multiple-choice',
    id: 'quiz_earth_water',
    bodyId: 'earth',
    level: 'middle',
    question: {
      sv: 'Hur stor del av Jordens yta täcks av vatten?',
      en: "What fraction of Earth's surface is covered by water?",
    },
    options: [
      { key: 'A', sv: 'Ungefär 30 %', en: 'About 30%' },
      { key: 'B', sv: 'Ungefär 50 %', en: 'About 50%' },
      { key: 'C', sv: 'Ungefär 71 %', en: 'About 71%' },
    ],
    correct: 'C',
    hint: {
      sv: 'Sett från rymden är Jorden väldigt blå.',
      en: 'Seen from space, Earth looks very blue.',
    },
    explanation: {
      sv: '71 % av Jordens yta täcks av vatten — det är därför Jorden syns som en blå boll från rymden och kallas "den blå planeten".',
      en: '71% of Earth\'s surface is covered by water — that\'s why Earth appears as a blue ball from space and is called "the blue planet."',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_earth_magnetic',
    bodyId: 'earth',
    level: 'both',
    statement: {
      sv: 'Jordens magnetfält skyddar oss mot skadlig strålning från Solen.',
      en: "Earth's magnetic field protects us from harmful radiation from the Sun.",
    },
    correct: true,
    hint: {
      sv: 'Tänk på vad som händer i atmosfären när solstormar träffar Jordens magnetfält.',
      en: "Think about what happens in the atmosphere when solar storms hit Earth's magnetic field.",
    },
    explanation: {
      sv: 'Jordens magnetfält fångar upp och avleder farliga partiklar från solen. Utan det skulle UV- och partikelstrålning göra Jordens yta svår att bo på.',
      en: "Earth's magnetic field captures and deflects dangerous particles from the Sun. Without it, UV and particle radiation would make Earth's surface very difficult to inhabit.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_earth_moon_stability',
    bodyId: 'earth',
    level: 'upper',
    question: {
      sv: 'Vilken roll spelar Månen för livet på Jorden?',
      en: 'What role does the Moon play for life on Earth?',
    },
    options: [
      {
        key: 'A',
        sv: 'Den skapar Jordens syrerika atmosfär',
        en: "It creates Earth's oxygen-rich atmosphere",
      },
      {
        key: 'B',
        sv: 'Den håller Jordens lutning stabil och skapar förutsägbara årstider',
        en: "It keeps Earth's axial tilt stable, creating predictable seasons",
      },
      {
        key: 'C',
        sv: 'Den håller temperaturen uppe på natten',
        en: 'It keeps temperatures up at night',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Tänk på vad som händer med en snurra som inte har stöd.',
      en: 'Think about what happens to a spinning top without support.',
    },
    explanation: {
      sv: 'Månens gravitation stabiliserar Jordens lutning kring 23,5°. Utan Månen skulle lutningen svänga slumpmässigt och göra årstiderna oförutsägbara under miljoner år.',
      en: "The Moon's gravity stabilises Earth's tilt around 23.5°. Without the Moon, the tilt would swing randomly, making seasons unpredictable over millions of years.",
    },
  },

  // MARS
  {
    type: 'multiple-choice',
    id: 'quiz_mars_mountain',
    bodyId: 'mars',
    level: 'middle',
    question: {
      sv: 'Vad heter solsystemets högsta berg och var finns det?',
      en: 'What is the tallest mountain in the solar system and where is it?',
    },
    options: [
      { key: 'A', sv: 'Everest på Jorden', en: 'Everest on Earth' },
      { key: 'B', sv: 'Olympus Mons på Mars', en: 'Olympus Mons on Mars' },
      { key: 'C', sv: 'Maxwell Montes på Venus', en: 'Maxwell Montes on Venus' },
    ],
    correct: 'B',
    hint: {
      sv: 'Det är en vulkan på vår röde granne.',
      en: "It's a volcano on our red neighbour.",
    },
    explanation: {
      sv: 'Olympus Mons på Mars är ungefär 22 km högt — tre gånger högre än Mount Everest. Det är en sköldvulkan lika bred som Sverige.',
      en: "Olympus Mons on Mars is about 22 km tall — three times taller than Mount Everest. It's a shield volcano as wide as Sweden.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_mars_red',
    bodyId: 'mars',
    level: 'middle',
    question: { sv: 'Varför är Mars röd?', en: 'Why is Mars red?' },
    options: [
      {
        key: 'A',
        sv: 'Hemoglobin (blodprotein) i gammal lava',
        en: 'Haemoglobin (blood protein) in ancient lava',
      },
      { key: 'B', sv: 'Järnoxid (rost) på ytan', en: 'Iron oxide (rust) on the surface' },
      {
        key: 'C',
        sv: 'Reflektion av rött ljus från Solen',
        en: 'Reflection of red light from the Sun',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Samma ämne som gör en gammal cykel rödbrun.',
      en: 'The same substance that makes an old bicycle go rusty.',
    },
    explanation: {
      sv: 'Mars yta täcks av järnoxid — rost. Det är exakt samma kemiska process som när järn rostar på Jorden, men på planetskala.',
      en: "Mars's surface is covered in iron oxide — rust. It's the exact same chemical process as iron rusting on Earth, but on a planetary scale.",
    },
  },
  {
    type: 'true-false',
    id: 'quiz_mars_water',
    bodyId: 'mars',
    level: 'upper',
    statement: {
      sv: 'Mars hade aldrig flytande vatten på ytan.',
      en: 'Mars never had liquid water on its surface.',
    },
    correct: false,
    hint: {
      sv: 'Titta på Mars yta — vad påminner de långa svängende dalarna om?',
      en: "Look at Mars's surface — what do the long winding valleys resemble?",
    },
    explanation: {
      sv: 'Tvärtom — Mars hade flytande vatten för miljarder år sedan. Vi ser fortfarande tydliga floddalar, deltan och mineralavlagringar som bara bildas i vatten.',
      en: 'On the contrary — Mars had liquid water billions of years ago. We can still see clear river valleys, deltas and mineral deposits that only form in water.',
    },
  },

  // JUPITER
  {
    type: 'multiple-choice',
    id: 'quiz_jupiter_storm',
    bodyId: 'jupiter',
    level: 'middle',
    question: {
      sv: 'Hur länge har Jupiters stora röda fläck rasat?',
      en: "How long has Jupiter's Great Red Spot been raging?",
    },
    options: [
      { key: 'A', sv: 'I ungefär 50 år', en: 'For about 50 years' },
      { key: 'B', sv: 'I mer än 350 år', en: 'For more than 350 years' },
      { key: 'C', sv: 'I mer än 10 000 år', en: 'For more than 10,000 years' },
    ],
    correct: 'B',
    hint: {
      sv: 'Stormen observerades redan på 1600-talet.',
      en: 'The storm was already being observed in the 1600s.',
    },
    explanation: {
      sv: 'Den stora röda fläcken har observerats i mer än 350 år. Den är dubbelt så stor som Jorden och dess orsak till att inte avta är fortfarande ett vetenskapligt mysterium.',
      en: "The Great Red Spot has been observed for over 350 years. It's twice the size of Earth, and why it doesn't die down remains a scientific mystery.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_jupiter_weight',
    bodyId: 'jupiter',
    level: 'middle',
    question: {
      sv: 'Du väger 40 kg på Jorden. Hur mycket väger du på Jupiter?',
      en: 'You weigh 40 kg on Earth. How much do you weigh on Jupiter?',
    },
    options: [
      { key: 'A', sv: 'Ungefär 16 kg', en: 'About 16 kg' },
      { key: 'B', sv: 'Ungefär 100 kg', en: 'About 100 kg' },
      { key: 'C', sv: 'Ungefär 400 kg', en: 'About 400 kg' },
    ],
    correct: 'B',
    hint: {
      sv: 'Jupiters yta har 2,5 gånger starkare tyngdkraft än Jordens.',
      en: "Jupiter's surface has 2.5 times stronger gravity than Earth's.",
    },
    explanation: {
      sv: 'På Jupiter är gravitationen 2,5 gånger starkare. 40 kg × 2,5 = 100 kg. Fast "ytan" är bara gas — du skulle sjunka rakt igenom planeten.',
      en: 'On Jupiter gravity is 2.5 times stronger. 40 kg × 2.5 = 100 kg. But the "surface" is just gas — you\'d sink straight through the planet.',
    },
  },
  {
    type: 'fill-in',
    id: 'quiz_jupiter_moons',
    bodyId: 'jupiter',
    level: 'middle',
    question: {
      sv: 'Jupiter har ___ kända månar (2024).',
      en: 'Jupiter has ___ known moons (2024).',
    },
    correctAnswer: '95',
    hint: {
      sv: 'Det är fler månar än någon annan planet.',
      en: "It's more moons than any other planet.",
    },
    explanation: {
      sv: 'Jupiter har 95 kända månar — flest av alla planeter. De fyra galileiska månarna (Io, Europa, Ganymedes, Callisto) är störst och hittades av Galileo 1610.',
      en: 'Jupiter has 95 known moons — more than any other planet. The four Galilean moons (Io, Europa, Ganymede, Callisto) are largest and were discovered by Galileo in 1610.',
    },
  },

  // SATURN
  {
    type: 'true-false',
    id: 'quiz_saturn_rings',
    bodyId: 'saturn',
    level: 'both',
    statement: {
      sv: 'Saturnus ringar är gjorda av flytande vatten.',
      en: "Saturn's rings are made of liquid water.",
    },
    correct: false,
    hint: {
      sv: 'Tänk på vad som händer med vatten i det kalla yttre solsystemet.',
      en: 'Think about what happens to water in the cold outer solar system.',
    },
    explanation: {
      sv: 'Ringarna består av miljarder bitar av is och sten — inte flytande vatten. Isbitarna varierar i storlek från sandkorn till flervåningshus.',
      en: 'The rings consist of billions of pieces of ice and rock — not liquid water. The ice chunks range in size from sand grains to multi-storey buildings.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_saturn_density',
    bodyId: 'saturn',
    level: 'both',
    question: {
      sv: 'Vad är unikt med Saturnus densitet?',
      en: "What is unique about Saturn's density?",
    },
    options: [
      {
        key: 'A',
        sv: 'Den är tyngre än allt annat i solsystemet',
        en: 'It is denser than anything else in the solar system',
      },
      {
        key: 'B',
        sv: 'Den är lättare än vatten — Saturnus skulle flyta',
        en: 'It is less dense than water — Saturn would float',
      },
      { key: 'C', sv: 'Den är precis lika tät som Jorden', en: 'It is exactly as dense as Earth' },
    ],
    correct: 'B',
    hint: {
      sv: 'Tänk dig att du har ett oändligt badkar.',
      en: 'Imagine you had an infinitely large bathtub.',
    },
    explanation: {
      sv: 'Saturnus är den enda planeten i solsystemet med lägre densitet än vatten. Om du hade ett tillräckligt stort badkar skulle planeten flyta.',
      en: 'Saturn is the only planet in the solar system with lower density than water. If you had a large enough bathtub, the planet would float.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_saturn_rings_future',
    bodyId: 'saturn',
    level: 'both',
    statement: {
      sv: 'Saturnus ringar kommer alltid att finnas kvar.',
      en: "Saturn's rings will exist forever.",
    },
    correct: false,
    hint: {
      sv: 'Ringarna rör sig sakta inåt mot planeten.',
      en: 'The rings slowly move inward toward the planet.',
    },
    explanation: {
      sv: 'Saturnus ringar krymper sakta och beräknas vara borta om ungefär 100 miljoner år. Vi lever i en lycklig era — för 100 miljoner år sedan var ringarna ännu tjockare.',
      en: "Saturn's rings are slowly shrinking and are estimated to be gone in about 100 million years. We live in a lucky era — 100 million years ago the rings were even thicker.",
    },
  },

  // URANUS
  {
    type: 'multiple-choice',
    id: 'quiz_uranus_tilt',
    bodyId: 'uranus',
    level: 'both',
    question: {
      sv: 'Uranus lutar 98 grader på sin axel. Vad betyder det för polerna?',
      en: 'Uranus tilts 98 degrees on its axis. What does this mean for the poles?',
    },
    options: [
      {
        key: 'A',
        sv: 'Båda polerna har alltid samma temperatur',
        en: 'Both poles always have the same temperature',
      },
      {
        key: 'B',
        sv: 'En pol kan ha 42 år av sol och sedan 42 år av mörker',
        en: 'One pole can have 42 years of sun followed by 42 years of darkness',
      },
      {
        key: 'C',
        sv: 'Ingenting — lutningen påverkar inte säsongerna',
        en: "Nothing — the tilt doesn't affect the seasons",
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Tänk på hur en lutande snurra rör sig runt Solen.',
      en: 'Think about how a tilted spinning top moves around the Sun.',
    },
    explanation: {
      sv: 'Uranus lutar så mycket att polerna pekar mot Solen under halva omloppet. Det ger extrema årstider — 42 år av konstant sol, sedan 42 år av mörker.',
      en: 'Uranus tilts so much that its poles point toward the Sun during half of its orbit. This creates extreme seasons — 42 years of constant sunlight, then 42 years of darkness.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_uranus_colour',
    bodyId: 'uranus',
    level: 'middle',
    question: {
      sv: 'Vad ger Uranus sin blågrön färg?',
      en: 'What gives Uranus its blue-green colour?',
    },
    options: [
      { key: 'A', sv: 'Alger i atmosfären', en: 'Algae in the atmosphere' },
      { key: 'B', sv: 'Metan i atmosfären', en: 'Methane in the atmosphere' },
      { key: 'C', sv: 'Havsvatten som speglar himlen', en: 'Ocean water reflecting the sky' },
    ],
    correct: 'B',
    hint: {
      sv: 'Samma gas ger Neptunus sin blå färg.',
      en: 'The same gas gives Neptune its blue colour.',
    },
    explanation: {
      sv: 'Metan i atmosfären absorberar rött ljus och reflekterar blått och grönt. Det ger Uranus sin karakteristiska blågrön färg.',
      en: 'Methane in the atmosphere absorbs red light and reflects blue and green. This gives Uranus its characteristic blue-green colour.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_uranus_ice_giant',
    bodyId: 'uranus',
    level: 'upper',
    statement: {
      sv: '"Isjätten" Uranus har is på ytan man kan landa på.',
      en: 'The "ice giant" Uranus has ice on its surface you could land on.',
    },
    correct: false,
    hint: {
      sv: '"Is" i isjätte syftar inte på vanlig is som vi känner den.',
      en: '"Ice" in ice giant doesn\'t refer to ordinary ice as we know it.',
    },
    explanation: {
      sv: 'Under gasskiktet finns inte vanlig is utan supervarm, superkomprimerat vatten och ammoniak under enormt tryck. Det kallas "is" av kemiska skäl, inte för att det är fruset och fast.',
      en: "Beneath the gas layer isn't ordinary ice but super-hot, super-compressed water and ammonia under enormous pressure. It's called \"ice\" for chemical reasons, not because it's frozen and solid.",
    },
  },

  // NEPTUNE
  {
    type: 'multiple-choice',
    id: 'quiz_neptune_winds',
    bodyId: 'neptune',
    level: 'both',
    question: {
      sv: 'Vilken planet har de starkaste vindarna i solsystemet?',
      en: 'Which planet has the strongest winds in the solar system?',
    },
    options: [
      { key: 'A', sv: 'Jupiter', en: 'Jupiter' },
      { key: 'B', sv: 'Saturnus', en: 'Saturn' },
      { key: 'C', sv: 'Neptunus', en: 'Neptune' },
    ],
    correct: 'C',
    hint: {
      sv: 'Det är överraskande med tanke på hur långt ifrån Solen planeten är.',
      en: "It's surprising given how far from the Sun the planet is.",
    },
    explanation: {
      sv: 'Neptunus har vindar upp till 2 100 km/h — starkare än alla andra planeter. Varför, trots lite solenergi, är ett olöst problem inom planetforskning.',
      en: 'Neptune has winds up to 2,100 km/h — stronger than any other planet. Why, despite receiving so little solar energy, remains an unsolved problem in planetary science.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_neptune_voyager',
    bodyId: 'neptune',
    level: 'middle',
    question: {
      sv: 'Hur lång tid tog det för Voyager 2 att nå Neptunus?',
      en: 'How long did it take Voyager 2 to reach Neptune?',
    },
    options: [
      { key: 'A', sv: '2 år', en: '2 years' },
      { key: 'B', sv: '12 år', en: '12 years' },
      { key: 'C', sv: '50 år', en: '50 years' },
    ],
    correct: 'B',
    hint: {
      sv: 'Neptunus är ungefär 30 gånger längre bort från Solen än Jorden.',
      en: 'Neptune is about 30 times farther from the Sun than Earth.',
    },
    explanation: {
      sv: 'Voyager 2 lämnade Jorden 1977 och nådde Neptunus 1989 — tolv år. Det är fortfarande den enda sond som besökt Neptunus.',
      en: 'Voyager 2 left Earth in 1977 and reached Neptune in 1989 — twelve years. It remains the only spacecraft ever to visit Neptune.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_neptune_triton',
    bodyId: 'neptune',
    level: 'upper',
    statement: {
      sv: 'Neptunus måne Triton bildades runt Neptunus precis som vår Måne bildades runt Jorden.',
      en: "Neptune's moon Triton formed around Neptune just as our Moon formed around Earth.",
    },
    correct: false,
    hint: { sv: 'Triton kretsar i fel riktning.', en: 'Triton orbits in the wrong direction.' },
    explanation: {
      sv: 'Triton kretsar bakvänt — motsatt Neptunus rotation. Det tyder på att den inte bildades lokalt utan fångades in utifrån, troligtvis från Kuiperbältet.',
      en: "Triton orbits backwards — opposite to Neptune's rotation. This suggests it didn't form locally but was captured from elsewhere, likely from the Kuiper Belt.",
    },
  },

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
