export const NEPTUNE_QUESTIONS = [
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
] as const;
