export const TRITON_QUESTIONS = [
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
] as const;
