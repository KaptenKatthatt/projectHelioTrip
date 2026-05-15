export const VENUS_QUESTIONS = [
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
] as const;
