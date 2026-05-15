export const JUPITER_QUESTIONS = [
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
] as const;
