export const URANUS_QUESTIONS = [
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
] as const;
