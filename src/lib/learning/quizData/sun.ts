export const SUN_QUESTIONS = [
  {
    type: 'multiple-choice',
    id: 'quiz_sun_size',
    bodyId: 'sun',
    level: 'middle',
    question: {
      sv: 'Hur många jordklot ryms ungefär inuti Solen?',
      en: 'Roughly how many Earths fit inside the Sun?',
    },
    options: [
      { key: 'A', sv: '1 300', en: '1,300' },
      { key: 'B', sv: '13 000', en: '13,000' },
      { key: 'C', sv: '130', en: '130' },
    ],
    correct: 'A',
    hint: {
      sv: 'Tänk på att Solen är gigantisk — men inte oändlig.',
      en: 'Think about the Sun being enormous — but not infinite.',
    },
    explanation: {
      sv: 'Ungefär 1,3 miljoner jordklot ryms inuti Solen. Om Solen vore en fotboll skulle Jorden vara en liten ärta.',
      en: 'About 1.3 million Earths fit inside the Sun. If the Sun were a football, Earth would be a small pea.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_sun_fusion',
    bodyId: 'sun',
    level: 'upper',
    statement: {
      sv: 'Solen förbränner syre för att producera energi, precis som en låga.',
      en: 'The Sun burns oxygen to produce energy, just like a flame.',
    },
    correct: false,
    hint: {
      sv: 'En vanlig eld kräver syre. Hur fungerar det i rymden?',
      en: 'An ordinary fire needs oxygen. How does it work in space?',
    },
    explanation: {
      sv: 'Solen producerar energi via kärnfusion — väteatomer trycks ihop till helium. Det kräver inget syre och fungerar annorlunda än vanlig förbränning.',
      en: 'The Sun produces energy via nuclear fusion — hydrogen atoms are fused into helium. It needs no oxygen and works differently from ordinary combustion.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_sun_age',
    bodyId: 'sun',
    level: 'both',
    question: { sv: 'Ungefär hur gammal är Solen?', en: 'Approximately how old is the Sun?' },
    options: [
      { key: 'A', sv: '4,6 miljarder år', en: '4.6 billion years' },
      { key: 'B', sv: '4,6 miljoner år', en: '4.6 million years' },
      { key: 'C', sv: '4,6 biljoner år', en: '4.6 trillion years' },
    ],
    correct: 'A',
    hint: {
      sv: 'Det är väldigt länge — ungefär hälften av universums ålder.',
      en: "It's a very long time — about half the age of the universe.",
    },
    explanation: {
      sv: 'Solen är 4,6 miljarder år gammal och har bränsle för ungefär lika länge till. Universet är ungefär 13,8 miljarder år.',
      en: 'The Sun is 4.6 billion years old and has fuel for roughly the same time again. The universe is about 13.8 billion years old.',
    },
  },
] as const;
